-- Database Index Recommendations for Polling App
-- Run these in your Supabase SQL editor for better performance

-- Index for polls table (frequently queried by user_id)
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);

-- Index for polls table (frequently queried by created_at for ordering)
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);

-- Index for poll_options table (frequently queried by poll_id)
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);

-- Index for votes table (frequently queried by option_id for vote counting)
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);

-- Index for votes table (frequently queried by poll_id for vote analytics)
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);

-- Index for votes table (frequently queried by user_id for vote checking)
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Composite index for votes table (common query pattern: user_id + poll_id)
CREATE INDEX IF NOT EXISTS idx_votes_user_poll ON votes(user_id, poll_id);

-- Composite index for votes table (common query pattern: option_id + poll_id)
CREATE INDEX IF NOT EXISTS idx_votes_option_poll ON votes(option_id, poll_id);

-- Index for auth.users table (if frequently joining with polls)
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);

-- Note: These indexes should be created based on actual query patterns
-- Monitor query performance and adjust indexes as needed