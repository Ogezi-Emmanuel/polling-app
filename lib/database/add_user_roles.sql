ALTER TABLE auth.users
ADD COLUMN role TEXT DEFAULT 'user';

-- Optional: Create a RLS policy to allow users to see their own role
CREATE POLICY "Users can view their own role" ON auth.users FOR SELECT TO authenticated USING (auth.uid() = id);