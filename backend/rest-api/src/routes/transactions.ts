import { Router } from 'express';
import { supabase } from '../config';

const router = Router();

// GET /api/transactions
// Get all transactions with optional filters
router.get('/', async (req, res) => {
    try {
        const { wallet, event_id, type } = req.query;
        
        let query = supabase.from('transactions').select('*');
        
        // Filter by wallet (from or to)
        if (wallet) {
            query = query.or(`from_wallet.ilike.${wallet},to_wallet.ilike.${wallet}`);
        }
        
        if (event_id) query = query.eq('event_id', event_id);
        if (type) query = query.eq('type', type);
        
        const { data, error } = await query.order('timestamp', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch transactions.', details: error.message });
    }
});

// GET /api/transactions/:tx_hash
// Get single transaction by hash
router.get('/:tx_hash', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('tx_hash', req.params.tx_hash)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: 'Could not fetch transaction.', details: error.message });
    }
});

export default router;
