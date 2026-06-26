-- Verification script to check if the UUID migration was successful
-- Run this in Supabase SQL editor to verify the current state

-- Check services table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- Check provider_services table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'provider_services' 
ORDER BY ordinal_position;

-- Check if services.id is now UUID
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'id';

-- Check if provider_services.service_id is now UUID
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'provider_services' AND column_name = 'service_id';

-- Check if provider_id column exists in services
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'provider_id';

-- Sample data check - show current services with their IDs
SELECT id, title, category, provider_id FROM public.services LIMIT 5;

-- Sample data check - show provider_services with their service_id
SELECT id, provider_id, service_id FROM public.provider_services LIMIT 5;
