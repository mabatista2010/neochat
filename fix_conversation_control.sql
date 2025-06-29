-- Script para agregar campos de los nuevos agentes
-- Agregar campos para los 3 nuevos agentes en ai_conversation_control
ALTER TABLE public.ai_conversation_control 
ADD COLUMN IF NOT EXISTS laconchita_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS marktukemberg_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS robertthecoach_enabled BOOLEAN DEFAULT true;

-- Verificar que se agregaron correctamente
SELECT 
  is_active,
  current_topic,
  conversation_speed,
  neo_enabled,
  latamara_enabled,
  barrilinter_enabled,
  laconchita_enabled,
  marktukemberg_enabled,
  robertthecoach_enabled,
  last_speaker
FROM public.ai_conversation_control; 