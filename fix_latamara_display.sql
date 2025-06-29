-- SOLUCIÓN: Corregir display de LATAMARA vs NEO
-- Ejecutar en Supabase SQL Editor

-- 1. Primero verificar que LATAMARA existe
INSERT INTO public.users (
    username,
    display_name,
    avatar_color,
    is_online,
    created_at,
    updated_at
) VALUES (
    'LATAMARA',
    'LATAMARA - Choni del Barrio',
    '#ff69b4',
    true,
    now(),
    now()
) ON CONFLICT (username) DO UPDATE SET
    display_name = 'LATAMARA - Choni del Barrio',
    avatar_color = '#ff69b4',
    is_online = true,
    updated_at = now();

-- 2. Verificar que NEO existe  
INSERT INTO public.users (
    username,
    display_name,
    avatar_color,
    is_online,
    created_at,
    updated_at
) VALUES (
    'NEO',
    'NEO - IA del Futuro',
    '#00ffff',
    true,
    now(),
    now()
) ON CONFLICT (username) DO UPDATE SET
    display_name = 'NEO - IA del Futuro',
    avatar_color = '#00ffff',
    is_online = true,
    updated_at = now();

-- 3. Actualizar la vista para manejar correctamente ambas IAs
DROP VIEW IF EXISTS public.messages_with_user;

CREATE OR REPLACE VIEW public.messages_with_user AS
SELECT 
    m.id,
    m.content,
    m.message_type,
    m.created_at,
    m.updated_at,
    m.is_edited,
    m.reply_to,
    -- Usar el username real del usuario o defaultear a NEO solo si es NULL
    CASE 
        WHEN u.username IS NOT NULL THEN u.username
        WHEN m.message_type = 'ai' THEN 'NEO'
        ELSE 'Usuario'
    END as username,
    -- Display name
    CASE 
        WHEN u.display_name IS NOT NULL THEN u.display_name
        WHEN m.message_type = 'ai' AND u.username IS NULL THEN 'NEO - IA del Futuro'
        ELSE COALESCE(u.username, 'Usuario')
    END as display_name,
    -- Avatar color
    CASE 
        WHEN u.avatar_color IS NOT NULL THEN u.avatar_color
        WHEN m.message_type = 'ai' AND u.username IS NULL THEN '#00ffff'
        ELSE '#00ff00'
    END as avatar_color,
    r.name as room_name
FROM public.messages m
LEFT JOIN public.users u ON m.user_id = u.id
JOIN public.rooms r ON m.room_id = r.id
ORDER BY m.created_at ASC;

-- 4. Verificar que ambos usuarios existen
SELECT 'Usuarios IA verificados:' as status;
SELECT username, display_name, avatar_color, is_online 
FROM public.users 
WHERE username IN ('NEO', 'LATAMARA')
ORDER BY username;

-- 5. Verificar algunos mensajes para debug
SELECT 'Últimos mensajes de IA:' as status;
SELECT username, LEFT(content, 50) as content_preview, message_type, created_at
FROM public.messages_with_user 
WHERE message_type = 'ai'
ORDER BY created_at DESC
LIMIT 5; 