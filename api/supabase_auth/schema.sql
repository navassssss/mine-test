-- supabase_auth/schema.sql
-- migration or setup commands to update your existing profiles table

-- Run these commands to upgrade your existing profiles table to support API Keys & Quotas:

-- 1. Add api_key column (generated natively as 'mine_pub_<hex>')
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE NOT NULL DEFAULT ('mine_pub_' || replace(gen_random_uuid()::text, '-', ''));

-- 2. Add requests_remaining column (quota track counter)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS requests_remaining INTEGER NOT NULL DEFAULT 30 CHECK (requests_remaining >= 0);

-- 3. Replace the Update RLS policy to secure api_key and requests_remaining from client modification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;

CREATE POLICY "Users can update their own profile fields"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    requests_remaining = (SELECT requests_remaining FROM public.profiles WHERE id = auth.uid()) AND
    api_key = (SELECT api_key FROM public.profiles WHERE id = auth.uid())
  );
