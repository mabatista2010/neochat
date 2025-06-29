-- Script para actualizar la función RPC get_ai_conversation_status
-- Incluir los 3 nuevos agentes: LACONCHITA, MARKTUKEMBERG, ROBERTTHECOACH

-- Eliminar función existente
DROP FUNCTION IF EXISTS get_ai_conversation_status();

-- Crear función actualizada con los 6 agentes
CREATE OR REPLACE FUNCTION get_ai_conversation_status()
RETURNS TABLE (
  is_active BOOLEAN,
  current_topic TEXT,
  conversation_speed INTEGER,
  neo_enabled BOOLEAN,
  latamara_enabled BOOLEAN,
  barrilinter_enabled BOOLEAN,
  laconchita_enabled BOOLEAN,
  marktukemberg_enabled BOOLEAN,
  robertthecoach_enabled BOOLEAN,
  last_speaker TEXT,
  updated_at TIMESTAMPTZ
) LANGUAGE SQL AS $$
  SELECT 
    ai.is_active,
    ai.current_topic,
    ai.conversation_speed,
    ai.neo_enabled,
    ai.latamara_enabled,
    ai.barrilinter_enabled,
    ai.laconchita_enabled,
    ai.marktukemberg_enabled,
    ai.robertthecoach_enabled,
    ai.last_speaker,
    ai.updated_at
  FROM ai_conversation_control ai
  LIMIT 1;
$$;

-- Verificar que funciona correctamente
SELECT * FROM get_ai_conversation_status(); 