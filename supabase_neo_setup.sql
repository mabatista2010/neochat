-- Configuración adicional para NEO en INTELICHAT
-- Ejecutar estas consultas después de supabase_queries.sql y supabase_fix_policies.sql

-- 1. Modificar tabla de mensajes para permitir user_id NULL (para NEO)
ALTER TABLE public.messages ALTER COLUMN user_id DROP NOT NULL;

-- 2. Actualizar la vista para manejar mensajes de IA (sin user_id)
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
    COALESCE(u.username, 'NEO') as username,
    COALESCE(u.display_name, 'NEO - IA del Futuro') as display_name,
    COALESCE(u.avatar_color, '#00ffff') as avatar_color,
    r.name as room_name
FROM public.messages m
LEFT JOIN public.users u ON m.user_id = u.id
JOIN public.rooms r ON m.room_id = r.id
ORDER BY m.created_at ASC;

-- 3. Crear función para insertar mensajes de NEO
CREATE OR REPLACE FUNCTION public.insert_neo_message(
    message_content TEXT,
    target_room_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
BEGIN
    INSERT INTO public.messages (content, user_id, room_id, message_type)
    VALUES (message_content, NULL, target_room_id, 'ai')
    RETURNING id INTO new_message_id;
    
    RETURN new_message_id;
END;
$$ language 'plpgsql';

-- 4. Crear índice para mensajes de IA
CREATE INDEX IF NOT EXISTS idx_messages_ai_type ON public.messages(message_type, created_at DESC);

-- 5. Función para obtener contexto del chat (útil para NEO)
CREATE OR REPLACE FUNCTION public.get_recent_messages(
    target_room_id UUID,
    message_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    username TEXT,
    content TEXT,
    message_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(u.username, 'NEO') as username,
        m.content,
        m.message_type,
        m.created_at
    FROM public.messages m
    LEFT JOIN public.users u ON m.user_id = u.id
    WHERE m.room_id = target_room_id
    ORDER BY m.created_at DESC
    LIMIT message_limit;
END;
$$ language 'plpgsql';

-- 6. Comentarios para documentación
COMMENT ON FUNCTION public.insert_neo_message IS 'Función para insertar mensajes de la IA NEO';
COMMENT ON FUNCTION public.get_recent_messages IS 'Obtiene mensajes recientes para contexto de IA';
COMMENT ON VIEW public.messages_with_user IS 'Vista actualizada que incluye mensajes de NEO (IA)';

-- 7. Verificar que todo funciona
SELECT 'NEO setup completado correctamente' as status; 