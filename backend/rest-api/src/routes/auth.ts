import { Router } from 'express';
import { verifyMessage } from 'ethers';
import { supabase } from '../config';

export const authRouter = Router();

// POST /api/auth/register
// Register with email/password (for mobile)
authRouter.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // For now, store plain password (NOT RECOMMENDED for production)
        // In production, use bcrypt: const passwordHash = await bcrypt.hash(password, 10);
        
        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert({
                email: email.toLowerCase(),
                password_hash: password, // TODO: Hash this with bcrypt in production
                username: username || email.split('@')[0],
                auth_type: 'email'
            })
            .select('id, email, username, auth_type, created_at')
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                return res.status(409).json({ error: 'Email already exists.' });
            }
            console.error('❌ Registration error:', insertError);
            return res.status(500).json({ error: 'Registration failed', details: insertError.message });
        }

        console.log('✅ User registered:', user.email);
        res.status(201).json({
            message: 'Registration successful.',
            user: user
        });

    } catch (error: any) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// POST /api/auth/login
// Login with email/password (for mobile)
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const { data: user, error: selectError } = await supabase
            .from('users')
            .select('id, email, username, password_hash, auth_type, created_at')
            .eq('email', email.toLowerCase())
            .eq('auth_type', 'email')
            .single();

        if (selectError || !user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // TODO: Use bcrypt.compare(password, user.password_hash) in production
        if (password !== user.password_hash) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        console.log('✅ User logged in:', user.email);

        const { password_hash, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Login successful.',
            user: userWithoutPassword
        });

    } catch (error: any) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// POST /api/auth/verify
// Verifies a signed message and upserts user (for web wallet authentication)
authRouter.post('/verify', async (req, res) => {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
        return res.status(400).json({ error: 'Missing message, signature, or address.' });
    }

    try {
        // Check if this is a demo/mock signature (for mobile testing)
        const isDemoMode = signature === '0x' + '0'.repeat(130) && message.includes('Demo login');
        
        if (!isDemoMode) {
            // 1. Verify Signature (only for real signatures)
            const recoveredAddress = verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
                return res.status(401).json({ error: 'Invalid signature.' });
            }
            console.log('✅ Signature verified for address:', address);
        } else {
            console.log('⚠️ Demo mode authentication for address:', address);
        }

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
