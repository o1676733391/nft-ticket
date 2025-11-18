import { Router } from 'express';
import { ethers } from 'ethers';
import { supabase, provider, adminWallet } from '../config';
import { MARKETPLACE_ABI } from '../abi/Marketplace';

const router = Router();

router.post('/list-ticket', async (req, res) => {
    const { tokenId, price } = req.body;
    if (!tokenId || !price) {
        return res.status(400).json({ error: 'Missing tokenId or price' });
    }

    try {
        const marketplaceContract = new ethers.Contract(process.env.MARKETPLACE_ADDRESS!, MARKETPLACE_ABI, adminWallet);

        const tx = await marketplaceContract.listTicket(tokenId, ethers.parseEther(price.toString()));
        await tx.wait();

        res.status(200).json({ message: 'Ticket listed successfully', transactionHash: tx.hash });
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
        const marketplaceContract = new ethers.Contract(process.env.MARKETPLACE_ADDRESS!, MARKETPLACE_ABI, adminWallet);

        const tx = await marketplaceContract.unlistTicket(tokenId);
        await tx.wait();

        res.status(200).json({ message: 'Ticket unlisted successfully', transactionHash: tx.hash });
    } catch (error: any) {
        console.error('Error unlisting ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/buy-ticket', async (req, res) => {
    const { tokenId, buyerAddress } = req.body;
    if (!tokenId || !buyerAddress) {
        return res.status(400).json({ error: 'Missing tokenId or buyerAddress' });
    }

    try {
        const { data: listing, error: fetchError } = await supabase
            .from('marketplace_listings')
            .select('price')
            .eq('token_id', tokenId)
            .eq('status', 'active')
            .single();

        if (fetchError || !listing) {
            return res.status(404).json({ error: 'Active listing not found for this token.' });
        }

        const marketplaceContract = new ethers.Contract(process.env.MARKETPLACE_ADDRESS!, MARKETPLACE_ABI, adminWallet);

        // This is a simplified buy function. A real implementation would require
        // the buyer to approve the marketplace to spend their SystemTokens.
        // Here, we assume the admin is facilitating the sale.
        const tx = await marketplaceContract.buyTicket(tokenId, buyerAddress);
        await tx.wait();

        res.status(200).json({ message: 'Ticket purchased successfully', transactionHash: tx.hash });
    } catch (error: any) {
        console.error('Error buying ticket:', error);
        res.status(500).json({ error: error.message });
    }
});


export default router;
