import { Router } from 'express';
import { ethers } from 'ethers';
import { provider, adminWallet } from '../config';
import { TICKET_NFT_ABI } from '../abi/TicketNFT';

const router = Router();

router.post('/check-in', async (req, res) => {
    const { tokenId } = req.body;
    if (!tokenId) {
        return res.status(400).json({ error: 'Missing tokenId' });
    }

    try {
        const ticketContract = new ethers.Contract(process.env.TICKET_NFT_ADDRESS!, TICKET_NFT_ABI, adminWallet);

        const tx = await ticketContract.checkIn(tokenId);
        await tx.wait();

        res.status(200).json({ message: 'Ticket checked in successfully', transactionHash: tx.hash });
    } catch (error: any) {
        console.error('Error checking in ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
