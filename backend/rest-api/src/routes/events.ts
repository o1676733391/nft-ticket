import { Router } from 'express';
import { supabase, ticketContract } from '../config';
// We'll need a middleware to protect these routes
// import { authMiddleware } from '../middleware/auth';

export const eventRouter = Router();

// GET /api/events/users
// Helper: Gets all users (for testing)
eventRouter.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, wallet_address, username, created_at')
            .limit(10);
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch users.', details: error.message });
    }
});

// POST /api/events/test-user
// Helper: Creates a test user (for testing)
eventRouter.post('/test-user', async (req, res) => {
    try {
        const { wallet_address, username } = req.body;
        const testWallet = wallet_address || `0x${Math.random().toString(16).substr(2, 40)}`;
        const testUsername = username || `testuser_${Date.now()}`;
        
        const { data, error } = await supabase
            .from('users')
            .insert({ wallet_address: testWallet, username: testUsername })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not create test user.', details: error.message });
    }
});

// GET /api/events
// Gets all events
eventRouter.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch events.', details: error.message });
    }
});

// GET /api/events/:id
// Gets a single event by ID
eventRouter.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, tickets(*)')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: `Could not fetch event ${req.params.id}.`, details: error.message });
    }
});


// The following routes should be protected by an auth middleware
// that verifies the JWT and checks if the user is an organizer.

// POST /api/events
// Creates a new event (organizer only)
eventRouter.post('/', /* authMiddleware, */ async (req, res) => {
    // For now, we'll skip auth for simplicity.
    // const organizer_id = req.user.id; 
    const { 
        organizer_id, 
        title, 
        description, 
        start_date, 
        end_date,
        location, 
        venue_name,
        category,
        banner_url,
        thumbnail_url,
        total_supply,
        royalty_fee 
    } = req.body;

    try {
        // 1. Prepare event data for DB (without onchain ID initially)
        const eventData: any = {
            organizer_id,
            title: title || req.body.name,
            description,
            start_date: start_date || req.body.date,
            end_date: end_date || start_date || req.body.date,
            location,
            venue_name: venue_name || location,
            category: category || 'general',
            banner_url: banner_url || req.body.image_url,
            thumbnail_url: thumbnail_url || req.body.image_url,
            total_supply: total_supply || req.body.total_tickets || 0,
            royalty_fee: royalty_fee || 0,
            is_published: true
        };

        // 2. Insert event into database first to get UUID
        const { data: event, error: dbError } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();
        if (dbError) throw dbError;

        console.log(`✅ Event created in DB: ${event.id}`);

        // 3. Generate onchain event ID from DB event ID
        // Convert UUID to number: use timestamp-based approach
        const onchainEventId = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);
        console.log(`Generated onchain event ID: ${onchainEventId}`);

        // 4. Create event on blockchain
        console.log(`Creating event on blockchain: ${event.title}...`);
        try {
            const createTx = await ticketContract.createEvent(
                onchainEventId,
                event.title || 'Event',
                event.royalty_fee || 0
            );
            await createTx.wait();
            console.log(`✅ Event created on blockchain with ID ${onchainEventId}`);

            // 5. Update DB with onchain ID and contract address
            const { error: updateError } = await supabase
                .from('events')
                .update({
                    event_id_onchain: onchainEventId,
                    contract_address: ticketContract.target as string
                })
                .eq('id', event.id);

            if (updateError) {
                console.error('❌ Failed to update event with onchain ID:', updateError);
            } else {
                event.event_id_onchain = onchainEventId;
                event.contract_address = ticketContract.target as string;
                console.log(`✅ Updated event ${event.id} with onchain ID ${onchainEventId}`);
            }
        } catch (blockchainError: any) {
            console.error('❌ Blockchain error:', blockchainError.message);
            console.warn('⚠️ Event created in DB but not on blockchain. Can retry later.');
        }

        // Automatically create a default "General Admission" template
        const { data: template, error: templateError } = await supabase
            .from('ticket_templates')
            .insert({
                event_id: event.id,
                name: 'General Admission',
                description: 'Standard ticket for this event',
                price_token: 0.01,
                supply: event.total_supply || 100,
                tier: 1,
                royalty_fee: event.royalty_fee || 0,
                is_active: true,
                sale_starts_at: event.start_date,
                sale_ends_at: event.end_date
            })
            .select()
            .single();

        if (templateError) {
            console.warn('Could not create default template:', templateError);
        } else {
            console.log('✅ Created default template:', template.id);
        }

        console.log(`✅ Event created successfully: ${event.id} (onchain: ${event.event_id_onchain})`);
        res.status(201).json({ ...event, default_template: template });
    } catch (error: any) {
        res.status(500).json({ error: 'Could not create event.', details: error.message });
    }
});
