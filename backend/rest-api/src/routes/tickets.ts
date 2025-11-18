import { Router } from 'express';
import { supabase, provider, ticketContract } from '../config';

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
            .select('id, title, total_supply, total_sold, event_id_onchain')
            .eq('id', event_id)
            .single();

        if (eventError || !event) {
            console.error('Event lookup error:', eventError);
            return res.status(404).json({ error: 'Event not found.', details: eventError?.message });
        }

        // Check if event has available tickets
        if (event.total_sold >= event.total_supply) {
            return res.status(400).json({ error: 'Sorry, this event is sold out.' });
        }

        // 2. Use event_id_onchain if available, otherwise use a default value (1)
        const onchainEventId = event.event_id_onchain || 1;

        // 2. Check if event exists on blockchain, if not create it
        try {
            const eventOnChain = await ticketContract.events(onchainEventId);
            if (!eventOnChain.isActive) {
                console.log(`Creating event ${onchainEventId} on blockchain...`);
                const createTx = await ticketContract.createEvent(
                    onchainEventId,
                    event.title || 'Event',
                    0 // royalty fee
                );
                await createTx.wait();
                console.log('Event created on blockchain');
            }
        } catch (error) {
            // Event doesn't exist, create it
            console.log(`Creating event ${onchainEventId} on blockchain...`);
            const createTx = await ticketContract.createEvent(
                onchainEventId,
                event.title || 'Event',
                0 // royalty fee
            );
            await createTx.wait();
            console.log('Event created on blockchain');
        }

        // 3. Mint the ticket on-chain
        console.log(`Minting ticket for event ${event_id} (onchain ID: ${onchainEventId}) to ${user_wallet}...`);
        const tx = await ticketContract.mintTicket(
            user_wallet,
            onchainEventId,
            1, // templateId (default to 1)
            '', // uri (empty for now, can be updated later)
            false // isSoulbound (false = transferable)
        );
        const receipt = await tx.wait();
        console.log(`Transaction successful with hash: ${receipt.hash}`);

        // Update total_sold count
        await supabase
            .from('events')
            .update({ total_sold: event.total_sold + 1 })
            .eq('id', event_id);

        // The indexer will handle creating the record in the 'tickets' table.
        // We just return the transaction hash.
        res.status(201).json({
            message: 'Mint transaction sent successfully.',
            transactionHash: receipt.hash,
            tokenId: 'Will be available after indexer processes the transaction'
        });

    } catch (error: any) {
        console.error("Minting error:", error);
        res.status(500).json({ error: 'An unexpected error occurred during minting.', details: error.message });
    }
});
