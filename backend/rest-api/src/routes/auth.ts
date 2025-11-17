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
            .select('*')
            .eq('wallet_address', address.toLowerCase())
            .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = "Row not found"
            throw userError;
        }

        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ wallet_address: address.toLowerCase() }])
                .select()
                .single();
            if (createError) throw createError;
            user = newUser;
        }

        // 3. Generate a Supabase JWT for the user
        // This requires creating a temporary email and using the admin client
        const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: `${user.id}@temp.wallet`, // Create a fake email for wallet-based auth
        });

        if (tokenError) throw tokenError;

        // The token is in the properties of the response
        const accessToken = tokenData.properties?.access_token;
        if (!accessToken) {
            throw new Error("Could not extract access token from Supabase response.");
        }

        res.status(200).json({
            message: 'Authentication successful.',
            user,
            token: accessToken,
        });

    } catch (error: any) {
        console.error("Auth error:", error);
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
    }
});
