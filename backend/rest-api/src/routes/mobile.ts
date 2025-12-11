// Mobile API Routes - No blockchain, traditional database transactions
import { Router } from 'express';
import { supabase } from '../config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import checkoutRouter from './checkout';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Multer config for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Mount checkout routes
router.use('/checkout', checkoutRouter);

// =============================================
// AUTH ROUTES (Email/Password for Mobile)
// =============================================

// POST /api/mobile/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      username, 
      fullName, 
      phone,
      isOrganizer,
      organizationName,
      organizationDescription 
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // If registering as organizer, organization name is required
    if (isOrganizer && !organizationName) {
      return res.status(400).json({ error: 'Organization name is required for organizers' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('mobile_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error } = await supabase
      .from('mobile_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        username: username || email.split('@')[0],
        full_name: fullName || null,
        phone: phone || null,
        acc_type: isOrganizer ? 'organizer' : 'user',
        organization_name: isOrganizer ? organizationName : null,
        organization_description: isOrganizer ? organizationDescription : null,
      })
      .select('id, email, username, full_name, avatar_url, acc_type, organization_name, created_at')
      .single();

    if (error) throw error;

    // Generate JWT with account type
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, accType: newUser.acc_type }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// POST /api/mobile/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT with account type
    const token = jwt.sign(
      { userId: user.id, email: user.email, accType: user.acc_type }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    await supabase
      .from('mobile_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        acc_type: user.acc_type,
        organization_name: user.organization_name,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// GET /api/mobile/auth/me - Get current user
router.get('/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('id, email, username, full_name, avatar_url, phone, acc_type, organization_name, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// PUT /api/mobile/auth/profile - Update profile
router.put('/auth/profile', authenticateToken, async (req: any, res) => {
  try {
    const { username, fullName, phone, avatarUrl } = req.body;

    const { data: user, error } = await supabase
      .from('mobile_users')
      .update({
        username,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.userId)
      .select('id, email, username, full_name, avatar_url, phone')
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated', user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// =============================================
// EVENTS ROUTES
// =============================================

// GET /api/mobile/events - Get all events with filters
router.get('/events', async (req, res) => {
  try {
    const { category, location, search, startDate, endDate, freeOnly, limit = 20, offset = 0 } = req.query;

    console.log('GET /events - Query params:', { category, location, search, startDate, endDate, freeOnly, limit, offset });

    let query = supabase
      .from('events')
      .select(`
        *,
        ticket_templates (
          id, name, price_token, supply, sold, tier, benefits
        )
      `)
      .eq('is_active', true)
      .eq('is_published', true)
      // Don't filter by end_date to show all events (including past ones for demo)
      // .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: false }); // Show newest first

    console.log('Query filters - is_active: true, is_published: true');

    // Apply filters
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    // Pagination
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    console.log('Query result - Found events:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('First event sample:', JSON.stringify(data[0], null, 2));
    }

    // Filter free events if needed
    let filteredData = data;
    if (freeOnly === 'true') {
      filteredData = data?.filter((event: any) =>
        event.ticket_templates?.some((t: any) => Number(t.price_token) === 0)
      );
    }

    console.log('Returning events count:', filteredData?.length || 0);

    res.json({
      events: filteredData,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// DEBUG: GET /api/mobile/events/debug/all - Get ALL events without filters
router.get('/events/debug/all', async (req, res) => {
  try {
    console.log('DEBUG: Fetching ALL events without filters...');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('DEBUG: Query error:', error);
      throw error;
    }

    console.log('DEBUG: Found', data?.length || 0, 'total events');
    
    const summary = data?.map(e => ({
      id: e.id,
      title: e.title,
      is_active: e.is_active,
      is_published: e.is_published,
      start_date: e.start_date,
      end_date: e.end_date,
    }));

    res.json({
      total: data?.length || 0,
      events: summary,
      raw: data,
    });
  } catch (error: any) {
    console.error('DEBUG: Error:', error);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// GET /api/mobile/events/:id - Get single event
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_templates (
          id, name, description, price_token, supply, sold, tier, benefits, is_active
        ),
        users!events_organizer_id_fkey (
          id, username, avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch event', details: error.message });
  }
});

// GET /api/mobile/events/featured - Get featured/popular events
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_templates (id, name, price_token, supply, sold)
      `)
      .eq('is_active', true)
      .eq('is_published', true)
      .gte('end_date', new Date().toISOString())
      .order('total_sold', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch featured events', details: error.message });
  }
});

// =============================================
// ORGANIZERS ROUTES
// =============================================

// GET /api/mobile/organizers/:id - Get organizer info by ID
router.get('/organizers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get from mobile_users table
    const { data: organizer, error } = await supabase
      .from('mobile_users')
      .select('id, username, full_name, avatar_url, organization_name, organization_description, created_at')
      .eq('id', id)
      .eq('acc_type', 'organizer')
      .single();

    if (error) {
      // If not found in mobile_users, try users table (for blockchain organizers)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .eq('id', id)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: 'Organizer not found' });
      }

      // Return user data in organizer format
      return res.json({
        id: user.id,
        username: user.username,
        full_name: user.username,
        avatar_url: user.avatar_url,
        organization_name: user.username,
        organization_description: null,
        created_at: null,
      });
    }

    res.json(organizer);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch organizer', details: error.message });
  }
});

// =============================================
// TICKET PURCHASE (No Blockchain)
// =============================================

// POST /api/mobile/orders - Create order (buy tickets)
router.post('/orders', authenticateToken, async (req: any, res) => {
  try {
    const { eventId, templateId, quantity = 1, paymentMethod = 'card' } = req.body;
    const userId = req.user.userId;

    // Get ticket template
    const { data: template, error: templateError } = await supabase
      .from('ticket_templates')
      .select('*, events!inner(*)')
      .eq('id', templateId)
      .eq('event_id', eventId)
      .single();

    if (templateError || !template) {
      return res.status(404).json({ error: 'Ticket template not found' });
    }

    // Check availability
    const available = template.supply - (template.sold || 0);
    if (available < quantity) {
      return res.status(400).json({ error: 'Not enough tickets available', available });
    }

    // Calculate total
    const unitPrice = Number(template.price_token);
    const totalAmount = unitPrice * quantity;

    // Create order
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
      .from('mobile_orders')
      .insert({
        id: orderId,
        user_id: userId,
        event_id: eventId,
        template_id: templateId,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // For now, auto-confirm order (in real app, integrate payment gateway)
    // In production: redirect to payment gateway, webhook confirms order

    // Simulate successful payment
    const confirmedOrder = await confirmOrder(orderId, userId, template);

    res.status(201).json({
      message: 'Order created successfully',
      order: confirmedOrder,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Helper: Confirm order and create tickets
async function confirmOrder(orderId: string, userId: string, template: any) {
  // Start transaction-like operations
  try {
    // Update order status
    const { data: order, error: orderError } = await supabase
      .from('mobile_orders')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create mobile tickets
    const ticketsToCreate = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketCode = generateTicketCode();
      const qrData = JSON.stringify({
        ticketId: uuidv4(),
        orderId,
        eventId: order.event_id,
        code: ticketCode,
      });

      ticketsToCreate.push({
        order_id: orderId,
        user_id: userId,
        event_id: order.event_id,
        template_id: order.template_id,
        ticket_code: ticketCode,
        qr_data: qrData,
        status: 'valid',
      });
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('mobile_tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketsError) throw ticketsError;

    // Update template sold count
    await supabase
      .from('ticket_templates')
      .update({ sold: (template.sold || 0) + order.quantity })
      .eq('id', template.id);

    // Update event total_sold
    await supabase
      .from('events')
      .update({ total_sold: (template.events?.total_sold || 0) + order.quantity })
      .eq('id', order.event_id);

    return { ...order, tickets };
  } catch (error) {
    // Rollback: mark order as failed
    await supabase.from('mobile_orders').update({ status: 'failed' }).eq('id', orderId);
    throw error;
  }
}

// Generate unique ticket code
function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/mobile/orders - Get user's orders
router.get('/orders', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const { data: orders, error } = await supabase
      .from('mobile_orders')
      .select(`
        *,
        events (id, title, banner_url, start_date, location),
        ticket_templates (id, name, tier),
        mobile_tickets (id, ticket_code, status, is_checked_in)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// GET /api/mobile/orders/:id - Get single order
router.get('/orders/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: order, error } = await supabase
      .from('mobile_orders')
      .select(`
        *,
        events (*),
        ticket_templates (*),
        mobile_tickets (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

// =============================================
// MY TICKETS
// =============================================

// GET /api/mobile/tickets - Get user's tickets
router.get('/tickets', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { status, upcoming } = req.query;

    let query = supabase
      .from('mobile_tickets')
      .select(`
        *,
        events (id, title, banner_url, thumbnail_url, start_date, end_date, location, venue_name),
        ticket_templates (id, name, tier, benefits),
        mobile_orders (id, total_amount, payment_method)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming === 'true') {
      query = query.gte('events.start_date', new Date().toISOString());
    }

    const { data: tickets, error } = await query;

    if (error) throw error;

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tickets', details: error.message });
  }
});

// GET /api/mobile/tickets/:id - Get single ticket with QR
router.get('/tickets/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: ticket, error } = await supabase
      .from('mobile_tickets')
      .select(`
        *,
        events (*),
        ticket_templates (*),
        mobile_orders (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch ticket', details: error.message });
  }
});

// =============================================
// CHECK-IN (for event staff)
// =============================================

// POST /api/mobile/checkin - Check in a ticket
router.post('/checkin', authenticateToken, async (req: any, res) => {
  try {
    const { ticketCode, qrData } = req.body;

    // Find ticket by code or QR data
    let query = supabase.from('mobile_tickets').select('*, events(*)');

    if (ticketCode) {
      query = query.eq('ticket_code', ticketCode);
    } else if (qrData) {
      const parsed = JSON.parse(qrData);
      query = query.eq('ticket_code', parsed.code);
    } else {
      return res.status(400).json({ error: 'Ticket code or QR data required' });
    }

    const { data: ticket, error } = await query.single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Validate ticket
    if (ticket.status !== 'valid') {
      return res.status(400).json({ error: 'Ticket is not valid', status: ticket.status });
    }

    if (ticket.is_checked_in) {
      return res.status(400).json({
        error: 'Ticket already checked in',
        checkedInAt: ticket.checked_in_at,
      });
    }

    // Check event date
    const eventDate = new Date(ticket.events.start_date);
    const now = new Date();
    const hoursBefore = 24; // Allow check-in 24 hours before event

    if (now < new Date(eventDate.getTime() - hoursBefore * 60 * 60 * 1000)) {
      return res.status(400).json({ error: 'Check-in not yet available' });
    }

    // Perform check-in
    const { data: updatedTicket, error: updateError } = await supabase
      .from('mobile_tickets')
      .update({
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: req.user.userId,
      })
      .eq('id', ticket.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log check-in
    await supabase.from('mobile_checkin_logs').insert({
      ticket_id: ticket.id,
      event_id: ticket.event_id,
      scanned_by: req.user.userId,
      device_info: req.body.deviceInfo || null,
    });

    res.json({
      message: 'Check-in successful',
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Check-in failed', details: error.message });
  }
});

// =============================================
// FILE UPLOAD ROUTES
// =============================================

// POST /api/mobile/upload/image - Upload image to Supabase Storage
router.post('/upload/image', authenticateToken, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.body.folder || 'events';
    const userId = req.user.userId;
    
    // Generate unique filename
    const fileExt = req.file.originalname.split('.').pop() || 'png';
    const fileName = `${folder}/${userId}/${uuidv4()}.${fileExt}`;
    
    console.log('Uploading file:', fileName, 'Size:', req.file.size);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    console.log('Upload success:', urlData.publicUrl);

    res.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// =============================================
// ORGANIZER ROUTES
// =============================================

// Middleware to check organizer role
function requireOrganizer(req: any, res: any, next: any) {
  if (req.user.accType !== 'organizer') {
    return res.status(403).json({ error: 'Organizer access required' });
  }
  next();
}

// GET /api/mobile/organizer/dashboard - Get organizer dashboard stats
router.get('/organizer/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;

    // Get organizer's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        start_date,
        end_date,
        is_active,
        is_published,
        total_sold,
        ticket_templates (id, price_token, supply, sold)
      `)
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Calculate stats
    let totalEvents = events?.length || 0;
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let upcomingEvents = 0;

    const now = new Date();
    
    events?.forEach((event: any) => {
      // Count upcoming events
      if (new Date(event.start_date) > now && event.is_active) {
        upcomingEvents++;
      }

      // Sum tickets and revenue from templates
      event.ticket_templates?.forEach((template: any) => {
        const sold = template.sold || 0;
        totalTicketsSold += sold;
        totalRevenue += sold * Number(template.price_token);
      });
    });

    // Get recent events (last 5)
    const recentEvents = events?.slice(0, 5).map((event: any) => {
      let eventTicketsSold = 0;
      let eventTotalTickets = 0;
      let eventRevenue = 0;

      event.ticket_templates?.forEach((template: any) => {
        const sold = template.sold || 0;
        eventTicketsSold += sold;
        eventTotalTickets += template.supply || 0;
        eventRevenue += sold * Number(template.price_token);
      });

      return {
        id: event.id,
        title: event.title,
        date: event.start_date,
        ticketsSold: eventTicketsSold,
        totalTickets: eventTotalTickets,
        revenue: eventRevenue,
        status: event.is_published ? (event.is_active ? 'active' : 'ended') : 'draft',
      };
    }) || [];

    res.json({
      stats: {
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        upcomingEvents,
      },
      recentEvents,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard', details: error.message });
  }
});

// GET /api/mobile/organizer/events - Get organizer's events
router.get('/organizer/events', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('events')
      .select(`
        *,
        ticket_templates (id, name, price_token, supply, sold, tier)
      `, { count: 'exact' })
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'draft') {
      query = query.eq('is_active', false);
    }

    const { data: events, error, count } = await query;

    if (error) throw error;

    // Calculate stats for each event
    const eventsWithStats = events?.map((event: any) => {
      let ticketsSold = 0;
      let totalTickets = 0;
      let revenue = 0;

      event.ticket_templates?.forEach((template: any) => {
        const sold = template.sold || 0;
        ticketsSold += sold;
        totalTickets += template.supply || 0;
        revenue += sold * Number(template.price_token);
      });

      return {
        ...event,
        ticketsSold,
        totalTickets,
        revenue,
      };
    }) || [];

    res.json({
      events: eventsWithStats,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error('Organizer events error:', error);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// POST /api/mobile/organizer/events - Create new event
router.post('/organizer/events', authenticateToken, async (req: any, res) => {
  try {
    const mobileUserId = req.user.userId;
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      venue,
      imageUrl,
      ticketTemplates,
    } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: 'Title and start date are required' });
    }

    // Get mobile user info
    const { data: mobileUser, error: userError } = await supabase
      .from('mobile_users')
      .select('id, email, username, full_name, avatar_url')
      .eq('id', mobileUserId)
      .single();

    if (userError || !mobileUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if there's a linked user in the blockchain users table
    // If not, create one with a placeholder wallet address
    let organizerId = mobileUserId;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', mobileUserId)
      .single();

    if (!existingUser) {
      // Create a placeholder user in the users table for mobile organizers
      const placeholderWallet = `mobile_${mobileUserId.replace(/-/g, '').substring(0, 30)}`;
      
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          id: mobileUserId, // Use same ID for easy linking
          wallet_address: placeholderWallet,
          username: mobileUser.username || mobileUser.email?.split('@')[0],
          email: mobileUser.email,
          avatar_url: mobileUser.avatar_url,
        })
        .select()
        .single();

      if (createUserError) {
        console.error('Failed to create linked user:', createUserError);
        return res.status(500).json({ error: 'Failed to setup organizer profile', details: createUserError.message });
      }
      
      organizerId = newUser.id;
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organizer_id: organizerId,
        title,
        description: description || '',
        category: category || 'other',
        start_date: startDate,
        end_date: endDate || startDate,
        location: location || '',
        venue_name: venue || '',
        banner_url: imageUrl || null,
        thumbnail_url: imageUrl || null, // Use same image as thumbnail
        is_active: true, // Active by default
        is_published: true, // Published by default
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Create ticket templates if provided
    if (ticketTemplates && ticketTemplates.length > 0) {
      const templates = ticketTemplates.map((t: any) => ({
        event_id: event.id,
        name: t.name,
        description: t.description || '',
        price_token: t.price || 0,
        supply: t.supply || 100,
        sold: 0,
        tier: t.tier || 'general',
        benefits: t.benefits || [],
        is_active: true,
      }));

      const { error: templatesError } = await supabase
        .from('ticket_templates')
        .insert(templates);

      if (templatesError) {
        console.error('Templates error:', templatesError);
      }
    }

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// PUT /api/mobile/organizer/events/:id - Update event
router.put('/organizer/events/:id', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', id)
      .single();

    if (!existing || existing.organizer_id !== organizerId) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    // Update event
    const { data: event, error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        category: updates.category,
        start_date: updates.startDate,
        end_date: updates.endDate,
        location: updates.location,
        venue: updates.venue,
        image_url: updates.imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event', details: error.message });
  }
});

// PUT /api/mobile/organizer/events/:id/publish - Publish event
router.put('/organizer/events/:id/publish', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', id)
      .single();

    if (!existing || existing.organizer_id !== organizerId) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    // Publish event
    const { data: event, error } = await supabase
      .from('events')
      .update({
        is_active: true,
        is_published: true,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Event published successfully',
      event,
    });
  } catch (error: any) {
    console.error('Publish event error:', error);
    res.status(500).json({ error: 'Failed to publish event', details: error.message });
  }
});

// GET /api/mobile/organizer/events/:id/tickets - Get tickets for an event
router.get('/organizer/events/:id/tickets', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;
    const { id } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    // Verify ownership
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', id)
      .single();

    if (!event || event.organizer_id !== organizerId) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    let query = supabase
      .from('mobile_tickets')
      .select(`
        *,
        mobile_users!mobile_tickets_user_id_fkey (id, email, full_name, phone)
      `, { count: 'exact' })
      .eq('event_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status === 'checked_in') {
      query = query.eq('is_checked_in', true);
    } else if (status === 'not_checked_in') {
      query = query.eq('is_checked_in', false);
    }

    const { data: tickets, error, count } = await query;

    if (error) throw error;

    res.json({
      tickets,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets', details: error.message });
  }
});

// GET /api/mobile/organizer/events/:id/stats - Get event stats
router.get('/organizer/events/:id/stats', authenticateToken, async (req: any, res) => {
  try {
    const organizerId = req.user.userId;
    const { id } = req.params;

    // Verify ownership and get event with templates
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        ticket_templates (id, name, price_token, supply, sold)
      `)
      .eq('id', id)
      .single();

    if (eventError || !event || event.organizer_id !== organizerId) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    // Get check-in stats
    const { count: checkedInCount } = await supabase
      .from('mobile_tickets')
      .select('id', { count: 'exact' })
      .eq('event_id', id)
      .eq('is_checked_in', true);

    const { count: totalTickets } = await supabase
      .from('mobile_tickets')
      .select('id', { count: 'exact' })
      .eq('event_id', id);

    // Calculate revenue by template
    const revenueByTemplate = event.ticket_templates?.map((t: any) => ({
      name: t.name,
      sold: t.sold || 0,
      supply: t.supply,
      revenue: (t.sold || 0) * Number(t.price_token),
      price: Number(t.price_token),
    })) || [];

    const totalRevenue = revenueByTemplate.reduce((sum: number, t: any) => sum + t.revenue, 0);
    const totalSold = revenueByTemplate.reduce((sum: number, t: any) => sum + t.sold, 0);
    const totalSupply = revenueByTemplate.reduce((sum: number, t: any) => sum + t.supply, 0);

    res.json({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.start_date,
        endDate: event.end_date,
        status: event.is_active ? 'active' : 'draft',
      },
      stats: {
        totalSold,
        totalSupply,
        totalRevenue,
        checkedIn: checkedInCount || 0,
        totalTickets: totalTickets || 0,
        checkInRate: totalTickets ? Math.round(((checkedInCount || 0) / totalTickets) * 100) : 0,
      },
      revenueByTemplate,
    });
  } catch (error: any) {
    console.error('Event stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// =============================================
// MIDDLEWARE
// =============================================

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export default router;
