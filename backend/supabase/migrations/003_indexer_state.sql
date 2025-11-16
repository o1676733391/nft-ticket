-- Table to store indexer state
CREATE TABLE IF NOT EXISTS indexer_state (
    id VARCHAR(50) PRIMARY KEY,
    last_block BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial state
INSERT INTO indexer_state (id, last_block)
VALUES ('main', 0)
ON CONFLICT (id) DO NOTHING;
