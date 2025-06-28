-- SOLUCIÓN RÁPIDA PARA ERROR 400 DE NEO
-- Ejecutar esta consulta en Supabase SQL Editor

-- Crear usuario NEO
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

-- Verificar que se creó correctamente
SELECT 'Usuario NEO creado correctamente' as status, id, username 
FROM public.users 
WHERE username = 'NEO'; 