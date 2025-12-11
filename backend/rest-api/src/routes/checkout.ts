import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate unique ticket code
function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = [4, 4, 4].map((len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
  return segments.join("-");
}

// Generate QR data for ticket
function generateQRData(ticketId: string, ticketCode: string, eventId: string, userId: string) {
  return JSON.stringify({
    ticketId,
    ticketCode,
    eventId,
    userId,
    timestamp: Date.now(),
    signature: crypto
      .createHash("sha256")
      .update(`${ticketId}-${ticketCode}-${eventId}-${userId}`)
      .digest("hex")
      .substring(0, 16),
  });
}

/**
 * POST /api/mobile/checkout/create-order
 * Create order and tickets
 */
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      eventId,
      templateId,
      quantity,
      paymentMethod = "card",
      promoCode,
    } = req.body;

    // Validation
    if (!userId || !eventId || !templateId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, eventId, templateId, quantity",
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 10",
      });
    }

    // 1. Get ticket template and check availability
    const { data: template, error: templateError } = await supabase
      .from("ticket_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return res.status(404).json({
        success: false,
        message: "Ticket template not found",
      });
    }

    // Check if enough tickets available
    const { count: soldCount } = await supabase
      .from("mobile_tickets")
      .select("*", { count: "exact", head: true })
      .eq("template_id", templateId)
      .in("status", ["valid", "used"]);

    const availableTickets = template.quantity - (soldCount || 0);
    if (availableTickets < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableTickets} tickets available`,
      });
    }

    // 2. Calculate pricing
    let unitPrice = parseFloat(template.price) || 0;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode)
        .eq("is_active", true)
        .single();

      if (promo) {
        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
        const validTo = promo.valid_to ? new Date(promo.valid_to) : null;

        if (
          (!validFrom || now >= validFrom) &&
          (!validTo || now <= validTo) &&
          (promo.usage_limit === null || promo.used_count < promo.usage_limit)
        ) {
          // Apply discount
          if (promo.discount_type === "percentage") {
            discountAmount = (unitPrice * quantity * promo.discount_value) / 100;
          } else {
            discountAmount = promo.discount_value * quantity;
          }

          // Update promo usage
          await supabase
            .from("promo_codes")
            .update({ used_count: promo.used_count + 1 })
            .eq("id", promo.id);
        }
      }
    }

    const totalAmount = unitPrice * quantity - discountAmount;

    // 3. Create order
    const { data: order, error: orderError } = await supabase
      .from("mobile_orders")
      .insert({
        user_id: userId,
        event_id: eventId,
        template_id: templateId,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        promo_code: promoCode || null,
        payment_method: paymentMethod,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }

    // 4. Process payment (mock for now)
    const paymentSuccess = true; // TODO: Integrate real payment gateway
    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    if (!paymentSuccess) {
      // Update order status to failed
      await supabase
        .from("mobile_orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      return res.status(400).json({
        success: false,
        message: "Payment failed",
      });
    }

    // 5. Update order status to confirmed
    await supabase
      .from("mobile_orders")
      .update({
        status: "confirmed",
        payment_reference: paymentReference,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // 6. Generate tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = generateTicketCode();
      const ticketId = crypto.randomUUID();
      const qrData = generateQRData(ticketId, ticketCode, eventId, userId);

      tickets.push({
        id: ticketId,
        order_id: order.id,
        user_id: userId,
        event_id: eventId,
        template_id: templateId,
        ticket_code: ticketCode,
        qr_data: qrData,
        status: "valid",
        original_user_id: userId,
      });
    }

    const { data: createdTickets, error: ticketsError } = await supabase
      .from("mobile_tickets")
      .insert(tickets)
      .select();

    if (ticketsError) {
      console.error("Tickets creation error:", ticketsError);
      return res.status(500).json({
        success: false,
        message: "Failed to create tickets",
      });
    }

    // 7. Get complete order data with tickets
    const { data: completeOrder } = await supabase
      .from("mobile_orders")
      .select(`
        *,
        event:events(*),
        template:ticket_templates(*),
        user:mobile_users(id, email, username, full_name),
        tickets:mobile_tickets(*)
      `)
      .eq("id", order.id)
      .single();

    res.json({
      success: true,
      message: "Order created successfully",
      data: {
        order: completeOrder,
        tickets: createdTickets,
        paymentReference,
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/mobile/checkout/orders/:userId
 * Get user's orders
 */
router.get("/orders/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: orders, error } = await supabase
      .from("mobile_orders")
      .select(`
        *,
        event:events(id, title, start_date, location, banner_url),
        template:ticket_templates(id, name, price),
        tickets:mobile_tickets(id, ticket_code, status, qr_data)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }

    res.json({
      success: true,
      data: orders || [],
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/mobile/checkout/order/:orderId
 * Get single order details
 */
router.get("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from("mobile_orders")
      .select(`
        *,
        event:events(*),
        template:ticket_templates(*),
        user:mobile_users(id, email, username, full_name, phone),
        tickets:mobile_tickets(*)
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/mobile/checkout/tickets/:userId
 * Get user's tickets
 */
router.get("/tickets/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from("mobile_tickets")
      .select(`
        *,
        event:events(id, title, start_date, end_date, location, venue_name, banner_url),
        template:ticket_templates(id, name, price, tier),
        order:mobile_orders(id, total_amount, payment_method, created_at)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }

    res.json({
      success: true,
      data: tickets || [],
    });
  } catch (error: any) {
    console.error("Get tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/mobile/checkout/cancel-order
 * Cancel an order
 */
router.post("/cancel-order", async (req: Request, res: Response) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId or userId",
      });
    }

    // Get order
    const { data: order } = await supabase
      .from("mobile_orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "confirmed" && order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Update order
    await supabase
      .from("mobile_orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Update tickets
    await supabase
      .from("mobile_tickets")
      .update({ status: "cancelled" })
      .eq("order_id", orderId);

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
