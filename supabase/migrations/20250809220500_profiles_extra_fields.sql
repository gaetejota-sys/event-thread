-- Extend profiles with contact and role fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS comuna TEXT,
ADD COLUMN IF NOT EXISTS role_owner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role_corral BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role_aficionado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role_jinete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role_preparador BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_role TEXT CHECK (primary_role IN ('propietario','corral','aficionado','jinete','preparador'));


