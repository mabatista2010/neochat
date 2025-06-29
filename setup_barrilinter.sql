-- Configuración del usuario BARRILINTER
-- Un erudito de barrio con acceso a internet

-- Insertar usuario BARRILINTER con configuración única
INSERT INTO users (
  id, 
  username, 
  avatar_color, 
  is_online, 
  last_seen, 
  created_at, 
  updated_at
) VALUES (
  'barrilinter-ai-2025',
  'BARRILINTER',
  'orange',
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  avatar_color = EXCLUDED.avatar_color,
  is_online = EXCLUDED.is_online,
  last_seen = EXCLUDED.last_seen,
  updated_at = NOW();

-- Verificar que el usuario BARRILINTER fue creado correctamente
DO $$
DECLARE
    barrilinter_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO barrilinter_count 
    FROM users 
    WHERE username = 'BARRILINTER';
    
    IF barrilinter_count = 1 THEN
        RAISE NOTICE 'Usuario BARRILINTER configurado exitosamente';
    ELSE
        RAISE EXCEPTION 'Error: Usuario BARRILINTER no fue creado correctamente';
    END IF;
END $$;

-- Asegurar que BARRILINTER aparezca en la vista de mensajes
-- (Esto ya debería funcionar con la vista existente, pero verificamos)
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

-- Mostrar información del usuario creado
SELECT 
  id,
  username,
  avatar_color,
  is_online,
  created_at
FROM users 
WHERE username = 'BARRILINTER'; 