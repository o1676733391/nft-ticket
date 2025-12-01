import { Router } from 'express';
import { ethers } from 'ethers';
import { supabase, marketplaceContract, ticketContract, provider, systemTokenAddress, marketplaceAddress } from '../config';

const router = Router();

router.post('/list-ticket', async (req, res) => {
    const { tokenId, price, seller_wallet, seller_private_key } = req.body;
    if (!tokenId || !price || !seller_wallet) {
        return res.status(400).json({ error: 'Missing tokenId, price, or seller_wallet' });
    }

    try {
        // Check current owner
        const currentOwner = await ticketContract.ownerOf(tokenId);
        
        console.log(`Token ${tokenId} owner: ${currentOwner}`);
        console.log(`Listing from wallet: ${seller_wallet}`);
        
        if (currentOwner.toLowerCase() !== seller_wallet.toLowerCase()) {
            return res.status(403).json({ 
                error: 'Cannot list ticket: Seller is not the owner',
                details: {
                    currentOwner,
                    sellerWallet: seller_wallet
                }
            });
        }
        
        // Convert price to wei
        const priceInWei = ethers.parseEther(price.toString());
        
        console.log(`Listing token ${tokenId} for ${price} (${priceInWei} wei)`);
        
        // Create wallet for the seller
        let sellerWallet: ethers.Wallet;
        if (seller_private_key) {
            // Use provided private key (for testing)
            sellerWallet = new ethers.Wallet(seller_private_key, provider);
            console.log('Using provided seller private key');
        } else {
            return res.status(400).json({ 
                error: 'seller_private_key is required for this endpoint',
                note: 'In production, users would sign transactions directly from their wallet (MetaMask, etc.)'
            });
        }
        
        // Create contract instances with seller's wallet
        const sellerTicketContract = new ethers.Contract(
            await ticketContract.getAddress(),
            [
                "function approve(address to, uint256 tokenId)",
                "function ownerOf(uint256 tokenId) view returns (address)"
            ],
            sellerWallet
        );
        const sellerMarketplaceContract = new ethers.Contract(
            await marketplaceContract.getAddress(),
            [
                "function list(uint256 tokenId, uint256 price)"
            ],
            sellerWallet
        );
        
        // Get current nonce
        const nonce = await provider.getTransactionCount(sellerWallet.address, 'pending');
        console.log('Current nonce:', nonce);
        
        // Step 1: Approve marketplace to transfer the NFT
        console.log('Step 1: Approving marketplace...');
        const approveTx = await sellerTicketContract.approve(
            await marketplaceContract.getAddress(),
            tokenId,
            { nonce }
        );
        const approveReceipt = await approveTx.wait();
        console.log('Approval confirmed:', approveReceipt.hash);
        
        // Step 2: List the ticket (with nonce + 1)
        console.log('Step 2: Listing ticket...');
        const listTx = await sellerMarketplaceContract.list(tokenId, priceInWei, { nonce: nonce + 1 });
        const listReceipt = await listTx.wait();
        console.log('Listing confirmed:', listReceipt.hash);

        res.status(200).json({ 
            message: 'Ticket listed successfully', 
            approvalTxHash: approveReceipt.hash,
            listingTxHash: listReceipt.hash,
            tokenId,
            price: price.toString(),
            seller: seller_wallet
        });
    } catch (error: any) {
        console.error('Error listing ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/unlist-ticket', async (req, res) => {
    const { tokenId } = req.body;
    if (!tokenId) {
        return res.status(400).json({ error: 'Missing tokenId' });
    }

    try {
        const tx = await marketplaceContract.unlist(tokenId);
        const receipt = await tx.wait();

        res.status(200).json({ 
            message: 'Ticket unlisted successfully', 
            transactionHash: receipt.hash 
        });
    } catch (error: any) {
        console.error('Error unlisting ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/buy-ticket', async (req, res) => {
    const { tokenId, buyerAddress, buyer_private_key } = req.body;
    if (!tokenId || !buyerAddress) {
        return res.status(400).json({ error: 'Missing tokenId or buyerAddress' });
    }

    try {
        // Check listing on blockchain directly
        let listingInfo;
        try {
            listingInfo = await marketplaceContract.listings(tokenId);
            console.log('Blockchain listing info:', listingInfo);
            
            if (!listingInfo.isActive) {
                return res.status(404).json({ error: 'No active listing found for this token on blockchain' });
            }
        } catch (error: any) {
            console.error('Error fetching listing from blockchain:', error);
            return res.status(404).json({ error: 'Could not fetch listing from blockchain' });
        }

        // Create buyer wallet
        let buyerWallet: ethers.Wallet;
        if (buyer_private_key) {
            buyerWallet = new ethers.Wallet(buyer_private_key, provider);
            console.log('Using provided buyer private key');
        } else {
            return res.status(400).json({ 
                error: 'buyer_private_key is required for this endpoint',
                note: 'In production, users would sign transactions directly from their wallet'
            });
        }

        // Create marketplace contract with buyer's wallet
        const buyerMarketplaceContract = new ethers.Contract(
            await marketplaceContract.getAddress(),
            [
                "function buy(uint256 tokenId)",
                "function listings(uint256) view returns (uint256 tokenId, address seller, uint256 price, bool isActive)"
            ],
            buyerWallet
        );
        
        // Create SystemToken contract with buyer's wallet
        const buyerTokenContract = new ethers.Contract(
            systemTokenAddress!,
            [
                "function approve(address spender, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function balanceOf(address account) view returns (uint256)"
            ],
            buyerWallet
        );

        // Get current nonce
        const nonce = await provider.getTransactionCount(buyerWallet.address, 'pending');
        console.log('Buyer nonce:', nonce);
        
        // Check buyer's token balance
        const balance = await buyerTokenContract.balanceOf(buyerWallet.address);
        console.log('Buyer token balance:', ethers.formatEther(balance));
        
        if (balance < listingInfo.price) {
            return res.status(400).json({ 
                error: 'Insufficient token balance',
                required: ethers.formatEther(listingInfo.price),
                available: ethers.formatEther(balance)
            });
        }
        
        // Check current allowance
        const currentAllowance = await buyerTokenContract.allowance(
            buyerWallet.address,
            await marketplaceContract.getAddress()
        );
        console.log('Current allowance:', ethers.formatEther(currentAllowance));
        
        let approveTxHash;
        if (currentAllowance < listingInfo.price) {
            // Step 1: Approve marketplace to spend tokens
            console.log('Step 1: Approving marketplace to spend tokens...');
            const approveTx = await buyerTokenContract.approve(
                await marketplaceContract.getAddress(),
                listingInfo.price,
                { nonce }
            );
            const approveReceipt = await approveTx.wait();
            approveTxHash = approveReceipt.hash;
            console.log('Approval confirmed:', approveTxHash);
            
            // Step 2: Buy with nonce + 1
            console.log('Step 2: Executing buy transaction...');
            const tx = await buyerMarketplaceContract.buy(tokenId, { nonce: nonce + 1 });
            const receipt = await tx.wait();
            console.log('Purchase confirmed:', receipt.hash);

            res.status(200).json({ 
                message: 'Ticket purchased successfully',
                approvalTxHash: approveTxHash,
                transactionHash: receipt.hash,
                buyer: buyerAddress,
                tokenId
            });
        } else {
            // Already approved, just buy
            console.log('Already approved, executing buy transaction...');
            const tx = await buyerMarketplaceContract.buy(tokenId);
            const receipt = await tx.wait();
            console.log('Purchase confirmed:', receipt.hash);

            res.status(200).json({ 
                message: 'Ticket purchased successfully', 
                transactionHash: receipt.hash,
                buyer: buyerAddress,
                tokenId
            });
        }
    } catch (error: any) {
        console.error('Error buying ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/marketplace/listings
// Get all active listings
router.get('/listings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('marketplace_listings')
            .select('*')
            .eq('status', 'active')
            .order('listed_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error: any) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
