import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyMessage } from 'ethers';
import { supabase } from '../config';

export const authRouter = Router();

// POST /api/auth/verify
// Verifies a signed message and returns a JWT
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

        // 2. Find or create user in Supabase
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, wallet_address')
            .eq('wallet_address', address.toLowerCase())
            .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = "Row not found"
            throw userError;
        }

        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ wallet_address: address.toLowerCase() }])
                .select('id, wallet_address')
                .single();
            if (createError) throw createError;
            user = newUser;
        }

        // 3. Generate a Supabase JWT for the user using a magic link.
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: `${user.id}@temp.wallet`, // Create a fake email for wallet-based auth
        });

        if (linkError) throw linkError;

        // The generateLink response contains an action_link with a token hash.
        // We need to extract this token and exchange it for a session.
        const actionLink = linkData.properties.action_link;
        const url = new URL(actionLink);
        const token_hash = url.searchParams.get('token');

        if (!token_hash) {
            return res.status(500).json({ error: 'Could not extract token from action link.' });
        }

        // Exchange the token hash for a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token_hash: token_hash,
        });

        if (sessionError) {
            console.error('Error verifying OTP:', sessionError);
            return res.status(500).json({ error: sessionError.message });
        }

        if (!sessionData.session) {
            return res.status(500).json({ error: 'Could not create a session.' });
        }

        res.status(200).json({
            message: 'Authentication successful.',
            user: user, // Return the user from 'users' table, not auth.users
            token: sessionData.session.access_token,
            auth_user: sessionData.user, // Optional: include auth user for debugging
        });

    } catch (error: any) {
        console.error("Auth error:", error);
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
    }
});
