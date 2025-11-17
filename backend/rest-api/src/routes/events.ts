import { Router } from 'express';
import { supabase } from '../config';
// We'll need a middleware to protect these routes
// import { authMiddleware } from '../middleware/auth';

export const eventRouter = Router();

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
    const { organizer_id, name, description, date, location, total_tickets, image_url } = req.body;

    try {
        const { data, error } = await supabase
            .from('events')
            .insert({ organizer_id, name, description, date, location, total_tickets, image_url })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not create event.', details: error.message });
    }
});
