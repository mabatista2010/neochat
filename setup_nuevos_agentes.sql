-- =========================================
-- SETUP DE NUEVOS AGENTES PARA INTELICHAT
-- =========================================
-- Este script configura LaConchita, MarkTukemberg y RobertTheCoach

-- 1. LaConchita - La abuela sabia
INSERT INTO public.users (username, avatar_color, is_online) 
VALUES ('LACONCHITA', '#ff69b4', true) 
ON CONFLICT (username) DO UPDATE SET 
  avatar_color = EXCLUDED.avatar_color,
  is_online = true;

-- 2. MarkTukemberg - El hacker millennial  
INSERT INTO public.users (username, avatar_color, is_online) 
VALUES ('MARKTUKEMBERG', '#00ff7f', true) 
ON CONFLICT (username) DO UPDATE SET 
  avatar_color = EXCLUDED.avatar_color,
  is_online = true;

-- 3. RobertTheCoach - El coach motivador
INSERT INTO public.users (username, avatar_color, is_online) 
VALUES ('ROBERTTHECOACH', '#ffa500', true) 
ON CONFLICT (username) DO UPDATE SET 
  avatar_color = EXCLUDED.avatar_color,
  is_online = true;

-- Verificar que todos los agentes estén creados
SELECT username, avatar_color, is_online, created_at 
FROM public.users 
WHERE username IN ('NEO', 'LATAMARA', 'BARRILINTER', 'LACONCHITA', 'MARKTUKEMBERG', 'ROBERTTHECOACH')
ORDER BY username;

-- Mostrar estadísticas
SELECT 
  COUNT(*) as total_agentes_ia,
  COUNT(CASE WHEN is_online = true THEN 1 END) as agentes_online
FROM public.users 
WHERE username IN ('NEO', 'LATAMARA', 'BARRILINTER', 'LACONCHITA', 'MARKTUKEMBERG', 'ROBERTTHECOACH'); 