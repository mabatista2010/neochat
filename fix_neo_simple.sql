-- VERSIÓN SIMPLIFICADA: Solo un usuario NEO
-- Ejecutar en Supabase SQL Editor

-- Limpiar usuarios NEO existentes (opcional)
DELETE FROM public.users WHERE username LIKE 'NEO%';

-- Crear únicamente el usuario NEO principal
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

-- Verificar creación
SELECT 'Usuario NEO creado correctamente' as status, id, username, display_name
FROM public.users 
WHERE username = 'NEO'; 