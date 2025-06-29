-- =====================================================
-- INTELICHAT - SALA IA AUTÓNOMA CON CONTROL ADMIN
-- =====================================================

-- 1. Agregar campo admin a tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Crear sala IA específica
INSERT INTO public.rooms (id, name, description, is_general, created_at)
VALUES (
  gen_random_uuid(),
  'IA Lounge',
  'Conversación autónoma entre agentes IA - Solo lectura',
  false,
  NOW()
) ON CONFLICT DO NOTHING;

-- 3. Tabla para controlar estado de conversación IA
CREATE TABLE IF NOT EXISTS public.ai_conversation_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT FALSE,
  current_topic TEXT,
  conversation_speed INTEGER DEFAULT 2, -- 1=lento, 2=normal, 3=rápido
  neo_enabled BOOLEAN DEFAULT TRUE,
  latamara_enabled BOOLEAN DEFAULT TRUE,
  barrilinter_enabled BOOLEAN DEFAULT TRUE,
  last_speaker TEXT, -- username del último agente que habló
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- 4. Insertar configuración inicial
INSERT INTO public.ai_conversation_control (
  is_active, 
  current_topic, 
  conversation_speed,
  neo_enabled,
  latamara_enabled,
  barrilinter_enabled
) VALUES (
  FALSE, 
  'Presentación inicial - Los agentes se conocen entre ellos',
  2,
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT DO NOTHING;

-- 5. Tabla para temas de conversación predefinidos
CREATE TABLE IF NOT EXISTS public.ai_conversation_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  initial_prompt TEXT NOT NULL,
  category VARCHAR(50), -- 'filosofia', 'actualidad', 'cotidiano', 'debate', 'personalizado'
  leader_agent VARCHAR(20), -- 'NEO', 'LATAMARA', 'BARRILINTER', null para aleatorio
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insertar temas predefinidos
INSERT INTO public.ai_conversation_topics (title, description, initial_prompt, category, leader_agent) VALUES
  (
    'Filosofía y Tecnología',
    'Debate sobre el futuro de la humanidad y la tecnología',
    'NEO, como ser del futuro, ¿qué opinas sobre el desarrollo tecnológico actual? LATAMARA y BARRILINTER, ¿cómo veis vosotros el tema?',
    'filosofia',
    'NEO'
  ),
  (
    'Vida en el Barrio',
    'Conversación sobre la vida cotidiana y costumbres',
    'LATAMARA, cuéntanos algo típico de tu barrio. NEO y BARRILINTER, ¿qué os parece desde vuestras perspectivas?',
    'cotidiano',
    'LATAMARA'
  ),
  (
    'Actualidad Mundial',
    'Debate sobre noticias y eventos actuales',
    'BARRILINTER, con tu acceso a internet, ¿qué está pasando hoy en el mundo? NEO y LATAMARA, ¿qué opináis?',
    'actualidad',
    'BARRILINTER'
  ),
  (
    'Debate Libre',
    'Tema aleatorio surgido naturalmente',
    'Agentes, ¿de qué os apetece hablar hoy? Que surja de forma natural.',
    'debate',
    null
  ),
  (
    'Presentación Inicial',
    'Los agentes se presentan entre ellos',
    'Agentes, presentaos entre vosotros. NEO, LATAMARA, BARRILINTER - cada uno explicad quiénes sois para que os conozcáis mejor.',
    'presentacion',
    null
  );

-- 7. Tabla para historial de conversaciones IA (opcional, para logs)
CREATE TABLE IF NOT EXISTS public.ai_conversation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_start TIMESTAMP WITH TIME ZONE,
  session_end TIMESTAMP WITH TIME ZONE,
  topic_used TEXT,
  messages_count INTEGER DEFAULT 0,
  participants TEXT[], -- array de agentes que participaron
  started_by UUID REFERENCES public.users(id), -- admin que inició
  stopped_by UUID REFERENCES public.users(id), -- admin que paró
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_ai_control_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS ai_control_update_trigger ON public.ai_conversation_control;
CREATE TRIGGER ai_control_update_trigger
  BEFORE UPDATE ON public.ai_conversation_control
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_control_timestamp();

-- 10. Políticas RLS para ai_conversation_control (solo admins)
ALTER TABLE public.ai_conversation_control ENABLE ROW LEVEL SECURITY;

-- Política de lectura: todos pueden ver el estado
CREATE POLICY "ai_control_read_policy" ON public.ai_conversation_control
  FOR SELECT USING (true);

-- Política de actualización: solo admins
CREATE POLICY "ai_control_update_policy" ON public.ai_conversation_control
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- 11. Políticas RLS para ai_conversation_topics
ALTER TABLE public.ai_conversation_topics ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer temas
CREATE POLICY "ai_topics_read_policy" ON public.ai_conversation_topics
  FOR SELECT USING (true);

-- Solo admins pueden crear/modificar temas
CREATE POLICY "ai_topics_admin_policy" ON public.ai_conversation_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- 12. Políticas RLS para ai_conversation_log
ALTER TABLE public.ai_conversation_log ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer logs (opcional, puedes restringir solo a admins)
CREATE POLICY "ai_log_read_policy" ON public.ai_conversation_log
  FOR SELECT USING (true);

-- Solo admins pueden crear logs
CREATE POLICY "ai_log_admin_policy" ON public.ai_conversation_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- 13. Vista para obtener sala IA con facilidad
CREATE OR REPLACE VIEW ai_lounge_room AS
SELECT id, name, description, created_at
FROM public.rooms 
WHERE name = 'IA Lounge';

-- 14. Función para verificar si usuario es admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Función para obtener estado actual de conversación IA
CREATE OR REPLACE FUNCTION get_ai_conversation_status()
RETURNS TABLE (
  is_active BOOLEAN,
  current_topic TEXT,
  speed INTEGER,
  neo_enabled BOOLEAN,
  latamara_enabled BOOLEAN,
  barrilinter_enabled BOOLEAN,
  last_speaker TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.is_active,
    c.current_topic,
    c.conversation_speed,
    c.neo_enabled,
    c.latamara_enabled,
    c.barrilinter_enabled,
    c.last_speaker,
    c.updated_at
  FROM public.ai_conversation_control c
  ORDER BY c.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONFIGURACIÓN INICIAL COMPLETADA
-- =====================================================

-- Para configurar tu usuario como admin, ejecuta:
-- UPDATE public.users SET is_admin = true WHERE username = 'TU_USERNAME_AQUI';

-- Consultas útiles para verificar:
-- SELECT * FROM public.ai_conversation_control;
-- SELECT * FROM public.ai_conversation_topics;
-- SELECT username, is_admin FROM public.users WHERE is_admin = true; 