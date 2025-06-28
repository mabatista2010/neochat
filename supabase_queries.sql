-- Consultas SQL para Supabase - Aplicación de Chat Terminal

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_color VARCHAR(7) DEFAULT '#00ff00', -- Color verde terminal por defecto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_online BOOLEAN DEFAULT false
);

-- 2. Tabla de salas de chat (para futuras extensiones)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_general BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 3. Insertar sala general por defecto
INSERT INTO public.rooms (name, description, is_general) 
VALUES ('General', 'Sala general de chat', true)
ON CONFLICT DO NOTHING;

-- 4. Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user', -- 'user', 'ai', 'system'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_edited BOOLEAN DEFAULT false,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL
);

-- 5. Tabla para participantes de sala (para futuras extensiones)
CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- 6. Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_room_created_at ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_online ON public.users(is_online);

-- 7. RLS (Row Level Security) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (todos pueden leer, solo el propio usuario puede actualizar)
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para salas (todos pueden leer)
CREATE POLICY "Users can view all rooms" ON public.rooms
    FOR SELECT USING (true);

-- Políticas para mensajes (todos pueden leer y escribir en sala general)
CREATE POLICY "Users can view all messages" ON public.messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON public.messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para participantes de sala
CREATE POLICY "Users can view room participants" ON public.room_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON public.room_participants
    FOR INSERT WITH CHECK (true);

-- 8. Funciones para automatizar actualizaciones
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER on_users_updated
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_messages_updated
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 9. Función para actualizar last_seen automáticamente
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_seen = timezone('utc'::text, now()),
        is_online = true
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_message_insert_update_last_seen
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE public.update_user_last_seen();

-- 10. Vista para obtener mensajes con información del usuario
CREATE OR REPLACE VIEW public.messages_with_user AS
SELECT 
    m.id,
    m.content,
    m.message_type,
    m.created_at,
    m.updated_at,
    m.is_edited,
    m.reply_to,
    u.username,
    u.display_name,
    u.avatar_color,
    r.name as room_name
FROM public.messages m
JOIN public.users u ON m.user_id = u.id
JOIN public.rooms r ON m.room_id = r.id
ORDER BY m.created_at ASC;

-- 11. Función para obtener ID de sala general
CREATE OR REPLACE FUNCTION public.get_general_room_id()
RETURNS UUID AS $$
DECLARE
    room_id UUID;
BEGIN
    SELECT id INTO room_id FROM public.rooms WHERE is_general = true LIMIT 1;
    RETURN room_id;
END;
$$ language 'plpgsql'; 