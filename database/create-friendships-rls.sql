-- RLS policies for friendships table
-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendships" ON friendships;

-- Policy 1: Users can view friendships where they are involved (either as user_id or friend_id)
CREATE POLICY "Users can view own friendships"
ON friendships
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR friend_id = auth.uid()
);

-- Policy 2: Users can send friend requests (create friendship with themselves as user_id)
CREATE POLICY "Users can send friend requests"
ON friendships
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    status = 'pending'
);

-- Policy 3: Users can update friend requests that were sent to them (they are the friend_id)
-- This allows accepting/rejecting requests
CREATE POLICY "Users can update friend requests"
ON friendships
FOR UPDATE
TO authenticated
USING (
    friend_id = auth.uid()
)
WITH CHECK (
    friend_id = auth.uid()
);

-- Policy 4: Users can delete friendships where they are involved (either side can remove friendship)
CREATE POLICY "Users can delete friendships"
ON friendships
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid() OR friend_id = auth.uid()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
