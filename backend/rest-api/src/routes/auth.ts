import { Router } from 'express';
import { verifyMessage } from 'ethers';
import { supabase } from '../config';

export const authRouter = Router();

// POST /api/auth/verify
// Verifies a signed message and upserts user (service role bypasses RLS)
authRouter.post('/verify', async (req, res) => {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
        return res.status(400).json({ error: 'Missing message, signature, or address.' });
    }

    try {
        // 1. Verify Signature
        const recoveredAddress = verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }

        console.log('✅ Signature verified for address:', address);

        // 2. Upsert user in Supabase (service role key bypasses RLS)
        const { data: user, error: upsertError } = await supabase
            .from('users')
            .upsert(
                { wallet_address: address.toLowerCase() },
                { onConflict: 'wallet_address', ignoreDuplicates: false }
            )
            .select('id, wallet_address, username, email, created_at')
            .single();

        if (upsertError) {
            console.error('❌ Supabase upsert error:', upsertError);
            return res.status(500).json({ error: 'Database error', details: upsertError });
        }

        if (!user) {
            console.error('❌ No user returned after upsert');
            return res.status(500).json({ error: 'User creation failed' });
        }

        console.log('✅ User upserted:', user);

        // 3. Return user data (no JWT needed for now — can add later if needed)
        res.status(200).json({
            message: 'Authentication successful.',
            user: user
        });

    } catch (error: any) {
        console.error("❌ Auth error:", error);
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
    }
});
