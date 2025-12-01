import { Router } from 'express';
import { supabase } from '../config';

export const ticketTemplateRouter = Router();

// GET /api/ticket_templates
// Get all templates (optionally filtered by event_id)
ticketTemplateRouter.get('/', async (req, res) => {
    try {
        const { event_id } = req.query;
        
        let query = supabase.from('ticket_templates').select('*');
        
        if (event_id) {
            query = query.eq('event_id', event_id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch templates.', details: error.message });
    }
});

// GET /api/ticket_templates/:id
// Get single template by ID
ticketTemplateRouter.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ticket_templates')
            .select('*, events(*)')
            .eq('id', req.params.id)
            .single();
            
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: `Could not fetch template ${req.params.id}.`, details: error.message });
    }
});

// POST /api/ticket_templates
// Create a new ticket template
ticketTemplateRouter.post('/', async (req, res) => {
    const { 
        event_id, 
        name, 
        description,
        price_token, 
        supply, 
        tier,
        royalty_fee,
        benefits,
        metadata_uri,
        is_soulbound,
        is_active,
        sale_starts_at,
        sale_ends_at
    } = req.body;

    if (!event_id || !name || price_token === undefined || !supply) {
        return res.status(400).json({ 
            error: 'Missing required fields: event_id, name, price_token, supply' 
        });
    }

    try {
        // Verify event exists
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', event_id)
            .single();
            
        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        const templateData = {
            event_id,
            name,
            description: description || null,
            price_token: parseFloat(price_token),
            supply: parseInt(supply),
            sold: 0,
            tier: tier || 1,
            royalty_fee: royalty_fee || 0,
            benefits: benefits || null,
            metadata_uri: metadata_uri || null,
            is_soulbound: is_soulbound || false,
            is_active: is_active !== undefined ? is_active : true,
            sale_starts_at: sale_starts_at || null,
            sale_ends_at: sale_ends_at || null
        };

        const { data, error } = await supabase
            .from('ticket_templates')
            .insert(templateData)
            .select()
            .single();
            
        if (error) throw error;
        
        console.log('✅ Created ticket template:', data.id);
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Template creation error:', error);
        res.status(500).json({ error: 'Could not create template.', details: error.message });
    }
});

// PATCH /api/ticket_templates/:id
// Update template
ticketTemplateRouter.patch('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ticket_templates')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not update template.', details: error.message });
    }
});

// DELETE /api/ticket_templates/:id
// Delete template (soft delete by setting is_active = false)
ticketTemplateRouter.delete('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ticket_templates')
            .update({ is_active: false })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error) throw error;
        res.status(200).json({ message: 'Template deactivated', data });
    } catch (error: any) {
        res.status(500).json({ error: 'Could not delete template.', details: error.message });
    }
});
