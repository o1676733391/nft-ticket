import { Router } from 'express';
import { supabase } from '../config';
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
        // Use start_date for both start and end if end_date is not provided
        const eventData: any = {
            organizer_id,
            title: title || req.body.name, // Support both 'title' and 'name'
            description,
            start_date: start_date || req.body.date, // Support both 'start_date' and 'date'
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

        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not create event.', details: error.message });
    }
});
