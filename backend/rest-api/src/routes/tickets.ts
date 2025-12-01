import { Router } from 'express';
import { supabase, ticketContract } from '../config';

export const ticketRouter = Router();

// GET /api/tickets
// Get all tickets with optional filters
ticketRouter.get('/', async (req, res) => {
    try {
        const { event_id, owner_wallet, status } = req.query;
        
        let query = supabase.from('tickets').select('*');
        
        if (event_id) query = query.eq('event_id', event_id);
        if (owner_wallet) query = query.ilike('owner_wallet', owner_wallet as string);
        if (status) query = query.eq('status', status);
        
        const { data, error } = await query.order('minted_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch tickets.', details: error.message });
    }
});

// POST /api/tickets/mint
// Mints a new ticket for a user
ticketRouter.post('/mint', async (req, res) => {
    const { event_id, user_wallet, template_id } = req.body;

    if (!event_id || !user_wallet) {
        return res.status(400).json({ error: 'Missing event_id or user_wallet.' });
    }

    try {
        // 1. Check if event exists
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

        // 2. Get or use default template
        let templateToUse = template_id;
        if (!templateToUse) {
            // Find first active template for this event
            const { data: templates } = await supabase
                .from('ticket_templates')
                .select('id')
                .eq('event_id', event_id)
                .eq('is_active', true)
                .limit(1);
            
            if (templates && templates.length > 0) {
                templateToUse = templates[0].id;
                console.log(`Using default template: ${templateToUse}`);
            } else {
                return res.status(400).json({ error: 'No active ticket templates found for this event.' });
            }
        }

        // 3. Get template details
        const { data: template, error: templateError } = await supabase
            .from('ticket_templates')
            .select('*')
            .eq('id', templateToUse)
            .single();

        if (templateError || !template) {
            return res.status(404).json({ error: 'Template not found.' });
        }

        // Check template supply
        if (template.sold >= template.supply) {
            return res.status(400).json({ error: 'This ticket type is sold out.' });
        }

        // 2. Get onchain event ID (should already exist from event creation)
        let onchainEventId = event.event_id_onchain;
        
        if (!onchainEventId) {
            return res.status(400).json({ 
                error: 'Event has no on-chain ID. Please recreate the event or contact support.' 
            });
        }

        console.log(`Using existing onchain event ID: ${onchainEventId}`);

        // 3. Verify event exists on blockchain (optional check)
        try {
            const eventOnChain = await ticketContract.events(onchainEventId);
            if (!eventOnChain.isActive) {
                console.warn(`⚠️ Event ${onchainEventId} exists but is not active on-chain`);
            }
        } catch (error: any) {
            console.warn(`⚠️ Could not verify event ${onchainEventId} on blockchain (continuing anyway):`, error.message);
            // Continue anyway - the event was created in DB and transaction sent
        }

        // 4. Mint the ticket on-chain
        console.log(`Minting ticket for event ${event_id} (onchain ID: ${onchainEventId}) to ${user_wallet}...`);
        console.log('DEBUG: Contract address:', ticketContract.target);
        console.log('DEBUG: Contract runner type:', ticketContract.runner?.constructor.name);
        console.log('DEBUG: Admin wallet address from config:', (await import('../config')).adminWallet.address);
        
        // Verify the contract has the correct signer
        if (!ticketContract.runner) {
            throw new Error('Contract has no runner/signer attached');
        }
        
        const tx = await ticketContract.mintTicket(
            user_wallet,
            onchainEventId,
            1, // templateId (hardcoded for now, can be mapped later)
            template.metadata_uri || '',
            template.is_soulbound || false
        );
        const receipt = await tx.wait();
        console.log(`Transaction successful with hash: ${receipt.hash}`);

        // Update event and template counters
        await supabase
            .from('events')
            .update({ 
                total_sold: event.total_sold + 1
            })
            .eq('id', event_id);

        await supabase
            .from('ticket_templates')
            .update({ sold: template.sold + 1 })
            .eq('id', templateToUse);

        // The indexer will handle creating the record in the 'tickets' table.
        res.status(201).json({
            message: 'Mint transaction sent successfully.',
            transactionHash: receipt.hash,
            template: template.name,
            tokenId: 'Will be available after indexer processes the transaction'
        });

    } catch (error: any) {
        console.error("Minting error:", error);
        res.status(500).json({ error: 'An unexpected error occurred during minting.', details: error.message });
    }
});

// GET /api/tickets/user/:wallet
// Get tickets owned by a specific wallet
ticketRouter.get('/user/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        const { data, error } = await supabase
            .from('tickets_full') // Use the view for full details
            .select('*')
            .ilike('owner_wallet', wallet); // Case-insensitive match

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch user tickets.', details: error.message });
    }
});

// GET /api/tickets/:id
// Get single ticket by ID
ticketRouter.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tickets_full')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch ticket.', details: error.message });
    }
});

export default ticketRouter;
