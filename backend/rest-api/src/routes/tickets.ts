import { Router } from 'express';
import { supabase, ticketContract } from '../config';

export const ticketRouter = Router();

// POST /api/tickets/mint
// Mints a new ticket for a user
ticketRouter.post('/mint', async (req, res) => {
    const { event_id, user_wallet } = req.body;

    if (!event_id || !user_wallet) {
        return res.status(400).json({ error: 'Missing event_id or user_wallet.' });
    }

    try {
        // 1. Check if event exists and has available tickets
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('total_tickets, tickets(count)')
            .eq('id', event_id)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        if (event.tickets[0].count >= event.total_tickets) {
            return res.status(400).json({ error: 'Sorry, this event is sold out.' });
        }

        // 2. Mint the ticket on-chain
        console.log(`Minting ticket for event ${event_id} to ${user_wallet}...`);
        const tx = await ticketContract.mint(user_wallet, event_id);
        const receipt = await tx.wait();
        console.log(`Transaction successful with hash: ${receipt.hash}`);

        // The indexer will handle creating the record in the 'tickets' table.
        // We just return the transaction hash.
        res.status(201).json({
            message: 'Mint transaction sent successfully.',
            transactionHash: receipt.hash,
        });

    } catch (error: any) {
        console.error("Minting error:", error);
        res.status(500).json({ error: 'An unexpected error occurred during minting.', details: error.message });
    }
});
