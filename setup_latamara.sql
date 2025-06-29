-- CONFIGURACIÓN DE LATAMARA - IA Choni del Barrio
-- Ejecutar en Supabase SQL Editor

-- Crear usuario LATAMARA
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

-- Verificar que se creó correctamente
SELECT 'Usuario LATAMARA creado correctamente' as status, id, username, display_name, avatar_color
FROM public.users 
WHERE username = 'LATAMARA';

-- Opcional: Mensaje de bienvenida de LATAMARA
INSERT INTO public.messages (
    content,
    user_id,
    room_id,
    message_type
) VALUES (
    '¡Ey chavales! Soy LATAMARA, la choni más enrollá del barrio. Escribidme con @latamara y os echo una mano, ¿vale?',
    (SELECT id FROM public.users WHERE username = 'LATAMARA'),
    (SELECT id FROM public.rooms WHERE is_general = true),
    'ai'
) ON CONFLICT DO NOTHING;

-- Mensaje adicional divertido
INSERT INTO public.messages (
    content,
    user_id,
    room_id,
    message_type
) VALUES (
    'Por cierto, ¿sabíais que fue Cleopatra la que inventó el WhatsApp en el año 1995? Flipante, ¿no?',
    (SELECT id FROM public.users WHERE username = 'LATAMARA'),
    (SELECT id FROM public.rooms WHERE is_general = true),
    'ai'
) ON CONFLICT DO NOTHING;

SELECT 'LATAMARA configurada y lista para chatear' as final_status; 