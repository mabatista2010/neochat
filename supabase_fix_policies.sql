-- Corrección de políticas RLS para INTELICHAT
-- Ejecutar estas consultas para corregir el problema de permisos

-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- 2. Crear nuevas políticas más permisivas (ya que no usamos auth)
CREATE POLICY "Users can update profiles" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can update messages" ON public.messages
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete messages" ON public.messages
    FOR DELETE USING (true);

-- 3. Verificar que todas las políticas funcionan
-- Opcional: Si sigues teniendo problemas, puedes deshabilitar RLS temporalmente:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 4. Limpiar sesiones antiguas (opcional)
UPDATE public.users SET is_online = false WHERE is_online = true; 