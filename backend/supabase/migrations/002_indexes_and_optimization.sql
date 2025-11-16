-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Additional composite indexes for common queries

-- Events by date range and category
CREATE INDEX idx_events_date_category ON events(start_date, category) WHERE is_published = true;

-- Tickets by event and status
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);

-- Active listings by price
CREATE INDEX idx_listings_price ON marketplace_listings(price_token) WHERE status = 'active';

-- User's transaction history
CREATE INDEX idx_transactions_user_timestamp ON transactions(from_wallet, timestamp DESC);
CREATE INDEX idx_transactions_buyer_timestamp ON transactions(to_wallet, timestamp DESC);

-- Check-ins for specific event
CREATE INDEX idx_checkin_event_timestamp ON checkin_logs(event_id, timestamp DESC);

-- Analytics queries
CREATE INDEX idx_analytics_event_date ON event_analytics(event_id, date DESC);

-- =============================================
-- FULL TEXT SEARCH
-- =============================================

-- Add tsvector column for events search
ALTER TABLE events ADD COLUMN search_vector tsvector;

-- Create index for full text search
CREATE INDEX idx_events_search ON events USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION events_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER events_search_update BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION events_search_trigger();

-- =============================================
-- PARTITIONING FOR LARGE TABLES (Optional)
-- =============================================

-- Partition checkin_logs by month if volume is high
-- CREATE TABLE checkin_logs_2024_01 PARTITION OF checkin_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =============================================
-- MATERIALIZED VIEWS FOR HEAVY QUERIES
-- =============================================

-- Popular events view (updated periodically)
CREATE MATERIALIZED VIEW popular_events AS
SELECT 
    e.id,
    e.title,
    e.banner_url,
    e.start_date,
    e.location,
    COUNT(t.id) as tickets_sold,
    COUNT(DISTINCT t.owner_wallet) as unique_buyers,
    AVG(ml.price_token) as avg_secondary_price
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id
LEFT JOIN marketplace_listings ml ON t.id = ml.ticket_id
WHERE e.is_published = true
GROUP BY e.id
ORDER BY tickets_sold DESC, unique_buyers DESC
LIMIT 100;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX ON popular_events (id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_events()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_events;
END;
$$ LANGUAGE plpgsql;
