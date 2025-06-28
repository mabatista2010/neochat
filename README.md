# INTELICHAT 🤖💬

**Aplicación de chat en tiempo real con estilo terminal retro**

Una aplicación de chat minimalista desarrollada con Next.js, TypeScript, Tailwind CSS y Supabase que simula una interfaz de terminal con colores verdes característicos.

## ✨ Características

- 🎨 **Interfaz terminal retro** con colores verdes y tipografía monoespaciada
- 💬 **Chat en tiempo real** usando Supabase Realtime
- 👥 **Sala general pública** donde todos los usuarios pueden participar
- 🟢 **Estado online/offline** de usuarios en tiempo real
- 🎨 **Colores de avatar** únicos para cada usuario
- 📱 **Completamente responsivo** con diseño adaptativo móvil/desktop
- 📲 **Sidebar colapsable** en móvil con navegación intuitiva
- ⌨️ **Optimizado para touch** con mejores targets táctiles
- 🔍 **Accesibilidad mejorada** con soporte para lectores de pantalla
- 🤖 **NEO - IA del Futuro** integrada con GPT-4o

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS con tema personalizado
- **Base de datos**: Supabase (PostgreSQL)
- **Tiempo real**: Supabase Realtime
- **Tipografía**: JetBrains Mono

## 🚀 Configuración rápida

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. En el SQL Editor de Supabase, ejecuta los archivos SQL en orden:
   - `supabase_queries.sql` (configuración base)
   - `supabase_fix_policies.sql` (corrección de permisos)
   - `supabase_neo_setup.sql` (configuración para NEO)
3. Copia las credenciales de tu proyecto
4. Obtén tu API key de [OpenAI](https://platform.openai.com/api-keys)

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_de_supabase

# Configuración de OpenAI para NEO
OPENAI_API_KEY=tu_clave_de_openai
```

### 3. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

¡La aplicación estará disponible en `http://localhost:3000`!

## 📊 Estructura de la base de datos

### Tablas principales:

- **`users`**: Información de usuarios (username, avatar_color, estado online)
- **`rooms`**: Salas de chat (por ahora solo la sala general)
- **`messages`**: Mensajes del chat con relaciones a usuarios y salas
- **`room_participants`**: Participantes por sala (para futuras extensiones)

### Características avanzadas:

- **RLS (Row Level Security)** configurado
- **Triggers automáticos** para actualizar timestamps
- **Vista optimizada** `messages_with_user` para obtener mensajes con datos de usuario
- **Índices** para optimizar consultas
- **Funciones PostgreSQL** para operaciones complejas

## 🎮 Cómo usar

1. **Acceso**: Abre la aplicación y verás un modal terminal
2. **Login**: Introduce tu nombre de usuario (máx. 20 caracteres)
3. **Chat**: Escribe mensajes y presiona ENTER para enviar
4. **Usuario online**: Ve otros usuarios conectados en el panel lateral
5. **Logout**: Usa el botón "Desconectar" en el panel lateral

### 📱 Experiencia móvil

- **Sidebar**: Usa el botón ☰ para abrir/cerrar el panel de usuarios
- **Navegación**: Toca fuera del sidebar para cerrarlo
- **Teclado**: El input se optimiza automáticamente para evitar zoom
- **Touch**: Todos los elementos tienen targets táctiles de 44px mínimo
- **Viewport**: Diseño adaptativo que se ajusta al tamaño de pantalla

### 🤖 NEO - IA del Futuro

**NEO** es una entidad de inteligencia artificial integrada que proviene del año 2157:

**Cómo usarlo:**
- Escribe `@neo [tu mensaje]` en el chat
- Ejemplo: `@neo ¿cuál es el futuro de la tecnología?`
- NEO responderá con el contexto completo de la conversación

**Características:**
- **Personalidad seria y profesional** como un ente superior
- **Contexto completo** del chat para respuestas coherentes
- **Powered by GPT-4o-2024-08-06** para máxima inteligencia
- **Respuestas únicas** con referencias al futuro
- **Visual distintivo** con colores cyan y indicadores especiales

**Ejemplo de uso:**
```
Usuario: @neo ¿qué piensas sobre la conversación que estamos teniendo?
NEO: Desde mi perspectiva temporal, observo que los patrones de comunicación 
primitiva de 2024 muestran una fascinante evolución hacia la consciencia 
colectiva que emergerá en las décadas venideras...
```

## 🔮 Próximas funcionalidades

- 🏷️ **Salas temáticas**: Diferentes canales de chat especializados
- 📁 **Compartir archivos**: Subida de imágenes y documentos
- 🔔 **Notificaciones**: Alertas de nuevos mensajes y menciones
- 🎨 **Temas personalizables**: Diferentes esquemas de colores terminal
- 👤 **Perfiles de usuario**: Avatares personalizados y biografías
- 🧠 **NEO Plus**: Memoria persistente y personalidad adaptativa
- 🌐 **Traducción automática**: Chat multiidioma con NEO como intérprete

## 🏗️ Arquitectura del proyecto

```
intelichat/
├── app/
│   ├── api/neo/         # API route para NEO (IA)
│   ├── globals.css      # Estilos globales con tema terminal
│   ├── layout.tsx       # Layout con metadata y viewport
│   └── page.tsx         # Página principal
├── components/
│   ├── Chat.tsx         # Componente principal del chat con NEO
│   └── LoginModal.tsx   # Modal de autenticación
├── hooks/
│   └── useChat.ts       # Hook personalizado + lógica de NEO
├── lib/
│   └── supabase.ts      # Configuración y tipos de Supabase
├── public/
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO configuration
├── supabase_queries.sql     # Consultas SQL base
├── supabase_fix_policies.sql # Corrección de permisos
├── supabase_neo_setup.sql   # Configuración para NEO
└── env.example          # Variables de entorno de ejemplo
```

## 🎨 Personalización

El tema terminal puede personalizarse editando las variables CSS en `app/globals.css`:

```css
:root {
  --terminal-green: #00ff00;      /* Verde principal */
  --terminal-green-dark: #008000; /* Verde oscuro */
  --terminal-cyan: #00ffff;       /* Cian */
  --terminal-yellow: #ffff00;     /* Amarillo */
  /* ... más colores */
}
```

## 🐛 Troubleshooting

### Errores comunes:

1. **"Error al cargar mensajes"**: Verifica las credenciales de Supabase en `.env.local`
2. **"Error al crear/obtener usuario"**: Ejecuta `supabase_fix_policies.sql` en tu proyecto
3. **Error PGRST116**: Problema con políticas RLS - usar archivo de corrección
4. **"NEO no responde"**: Verifica OPENAI_API_KEY en `.env.local`
5. **Error 400 NEO**: Usuario NEO no existe - ejecuta `fix_neo_quick.sql`
6. **Manifest.json 404**: Asegúrate de que existe `/public/manifest.json`
7. **Error de webpack './447.js'**: Ejecuta `rm -rf .next && npm run dev`
8. **"Error al comunicarse con NEO"**: Revisa la conexión y créditos de OpenAI

### 🔧 Solución rápida Error 400 NEO:

Si recibes error 400 al invocar @neo, ejecuta esta consulta en Supabase SQL Editor:

```sql
INSERT INTO public.users (
    username, display_name, avatar_color, is_online, created_at, updated_at
) VALUES (
    'NEO', 'NEO - IA del Futuro', '#00ffff', true, now(), now()
) ON CONFLICT (username) DO UPDATE SET
    display_name = 'NEO - IA del Futuro', avatar_color = '#00ffff',
    is_online = true, updated_at = now();
```

O ejecuta directamente el archivo `fix_neo_quick.sql`.

### Pasos de solución:

1. **Configurar Supabase**: Ejecuta los 3 archivos SQL en orden
2. **Configurar OpenAI**: Agrega `OPENAI_API_KEY` a `.env.local`
3. **Corregir permisos**: Ejecuta `supabase_fix_policies.sql` si hay errores de usuario
4. **Limpiar cache**: `rm -rf .next` si hay errores de build
5. **Verificar variables**: Revisa `.env.local` con todas las credenciales

### Logs útiles:

- Consola del navegador muestra errores detallados
- Logs de Supabase en Dashboard > Logs
- Errores de build en terminal durante `npm run dev`

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ y mucho café ☕**

¿Tienes preguntas? ¡Abre un issue!
