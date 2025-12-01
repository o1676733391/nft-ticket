import { Router } from 'express';
import { ethers } from 'ethers';
import { provider, adminWallet, supabase } from '../config';
import { TICKET_NFT_ABI } from '../abi/TicketNFT';

const router = Router();

// GET /api/checkin/logs
// Get check-in logs with optional filters
router.get('/logs', async (req, res) => {
    try {
        const { event_id, token_id } = req.query;
        
        let query = supabase.from('checkin_logs').select('*');
        
        if (event_id) query = query.eq('event_id', event_id);
        if (token_id) query = query.eq('token_id', token_id);
        
        const { data, error } = await query.order('timestamp', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch check-in logs.', details: error.message });
    }
});

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
