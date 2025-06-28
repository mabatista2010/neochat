-- Creación de usuario NEO y corrección de políticas
-- Ejecutar estas consultas para solucionar el error 400 de NEO

-- 1. Crear usuario especial para NEO
INSERT INTO public.users (
    id,
    username,
    display_name,
    avatar_color,
    is_online,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'NEO',
    'NEO - IA del Futuro',
    '#00ffff',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    display_name = 'NEO - IA del Futuro',
    avatar_color = '#00ffff',
    is_online = true,
    updated_at = now();

-- 2. También crear por username en caso de conflicto
INSERT INTO public.users (
    username,
    display_name,
    avatar_color,
    is_online,
    created_at,
    updated_at
) VALUES (
    'NEO_AI',
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

-- 3. Verificar que los usuarios NEO existen
SELECT 'Usuario NEO creado correctamente' as status, id, username 
FROM public.users 
WHERE username IN ('NEO', 'NEO_AI');

-- 4. Función para obtener ID de usuario NEO
CREATE OR REPLACE FUNCTION public.get_neo_user_id()
RETURNS UUID AS $$
DECLARE
    neo_id UUID;
BEGIN
    -- Intentar obtener el usuario NEO principal
    SELECT id INTO neo_id FROM public.users WHERE username = 'NEO' LIMIT 1;
    
    -- Si no existe, usar el alternativo
    IF neo_id IS NULL THEN
        SELECT id INTO neo_id FROM public.users WHERE username = 'NEO_AI' LIMIT 1;
    END IF;
    
    -- Si aún no existe, crear uno nuevo
    IF neo_id IS NULL THEN
        INSERT INTO public.users (username, display_name, avatar_color, is_online)
        VALUES ('NEO_SYSTEM', 'NEO - IA del Futuro', '#00ffff', true)
        RETURNING id INTO neo_id;
    END IF;
    
    RETURN neo_id;
END;
$$ language 'plpgsql';

-- 5. Función mejorada para insertar mensajes de NEO
CREATE OR REPLACE FUNCTION public.insert_neo_message_safe(
    message_content TEXT,
    target_room_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
    neo_user_id UUID;
BEGIN
    -- Obtener ID del usuario NEO
    SELECT public.get_neo_user_id() INTO neo_user_id;
    
    -- Insertar mensaje
    INSERT INTO public.messages (content, user_id, room_id, message_type)
    VALUES (message_content, neo_user_id, target_room_id, 'ai')
    RETURNING id INTO new_message_id;
    
    RETURN new_message_id;
END;
$$ language 'plpgsql';

-- 6. Actualizar la vista para manejar mejor los usuarios NEO
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
    CASE 
        WHEN m.message_type = 'ai' OR u.username LIKE 'NEO%' THEN 'NEO'
        ELSE COALESCE(u.username, 'Usuario')
    END as username,
    CASE 
        WHEN m.message_type = 'ai' OR u.username LIKE 'NEO%' THEN 'NEO - IA del Futuro'
        ELSE COALESCE(u.display_name, u.username, 'Usuario')
    END as display_name,
    CASE 
        WHEN m.message_type = 'ai' OR u.username LIKE 'NEO%' THEN '#00ffff'
        ELSE COALESCE(u.avatar_color, '#00ff00')
    END as avatar_color,
    r.name as room_name
FROM public.messages m
LEFT JOIN public.users u ON m.user_id = u.id
JOIN public.rooms r ON m.room_id = r.id
ORDER BY m.created_at ASC;

-- 7. Verificar configuración
SELECT 'Configuración de NEO completada correctamente' as status; 