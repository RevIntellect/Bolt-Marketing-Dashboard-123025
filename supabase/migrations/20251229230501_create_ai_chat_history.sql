/*
  # Create AI Chat History Table

  1. New Tables
    - `ai_chat_messages`
      - `id` (uuid, primary key)
      - `role` (text) - Either 'user' or 'assistant'
      - `content` (text) - The message content
      - `context_data` (jsonb) - Optional data context used for this message
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on the table
    - Add policies for public access (since this is a demo app)
*/

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  context_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat messages"
  ON ai_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete chat messages"
  ON ai_chat_messages FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_chat_created_at ON ai_chat_messages(created_at DESC);