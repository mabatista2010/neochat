-- Script para configurar BARRILINTER en Supabase
-- Ejecutar manualmente en el SQL Editor de Supabase

-- 1. Crear usuario BARRILINTER
INSERT INTO users (
  id, 
  username, 
  avatar_color, 
  is_online, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'BARRILINTER',
  '#ff8c00',
  true,
  NOW(),
  NOW()
);

-- 2. Verificar que se creó correctamente
SELECT 
  id,
  username,
  avatar_color,
  is_online,
  created_at
FROM users 
WHERE username = 'BARRILINTER';

-- 3. Verificar que aparece en la vista de mensajes (después del primer mensaje)
SELECT 
  m.id,
  m.content,
  m.message_type,
  u.username,
  u.avatar_color,
  m.created_at
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE u.username = 'BARRILINTER'
ORDER BY m.created_at DESC
LIMIT 5; 