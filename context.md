# INTELICHAT 🤖💬

**Aplicación de chat en tiempo real con estilo terminal retro**

Una aplicación de chat minimalista desarrollada con Next.js, TypeScript, Tailwind CSS y Supabase que simula una interfaz de terminal con colores verdes característicos.

## ✨ Características

- 🎨 **Interfaz terminal retro premium** con colores verdes y tipografía monoespaciada
- 💬 **Chat en tiempo real** usando Supabase Realtime
- 👥 **Sala general pública** donde todos los usuarios pueden participar
- 🟢 **Estado online/offline** de usuarios en tiempo real
- 🎨 **Colores de avatar** únicos para cada usuario con efectos de glow
- 📱 **Diseño completamente responsivo** con layout vertical optimizado para móvil
- 📲 **Sidebar premium con tabs** - navegación entre usuarios y agentes IA
- ⌨️ **Optimizado para touch** con mejores targets táctiles (44px mínimo)
- 🔍 **Accesibilidad mejorada** con soporte para lectores de pantalla
- 🤖 **3 IAs únicas integradas**: NEO (futuro), LATAMARA (barrio), BARRILINTER (culto+internet)
- 📐 **Aprovechamiento óptimo del espacio**: Layout vertical en móvil (95% vs 30% anterior)
- 🎛️ **Información centralizada**: Agentes IA y guías en sidebar escalable
- 💬 **Chat sin límites** con manejo inteligente de texto largo
- 🎨 **Gradientes y efectos premium** manteniendo la estética retro

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
   - `setup_latamara.sql` (configuración para LATAMARA)
   - `setup_barrilinter.sql` (configuración para BARRILINTER)
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

### 📱 Experiencia móvil renovada

#### 🎛️ **Sidebar Premium con Tabs**
- **Botón hamburguesa mejorado**: Abre/cierra el panel lateral con animaciones fluidas
- **Tab "Usuarios"**: Lista completa de usuarios conectados (sin truncar nombres)
- **Tab "Agentes IA"**: Información detallada de cada IA con comandos y especialidades
- **Navegación intuitiva**: Toca fuera del sidebar para cerrarlo
- **80% más ancho**: Mejor aprovechamiento del espacio (320px vs 280px anterior)

#### 📐 **Layout Vertical Optimizado**
- **Diseño revolucionario**: Timestamp y usuario en primera línea, mensaje debajo
- **95% de aprovechamiento**: El mensaje ocupa casi todo el ancho disponible
- **3x más espacio**: Comparado con el diseño horizontal anterior
- **Lectura mejorada**: Interlineado optimizado (`leading-relaxed`)
- **Responsive inteligente**: Desktop mantiene diseño horizontal, móvil usa vertical

#### 🎨 **Mejoras Visuales**
- **Touch targets de 44px**: Cumple estándares de accesibilidad móvil
- **Gradientes sutiles**: Efectos premium en header y sidebar
- **Avatares con glow**: Efectos de sombra y brillo en indicadores de usuario
- **Animaciones fluidas**: Transiciones de 300ms en toda la interfaz
- **Manejo de texto inteligente**: Solución completa para contenido largo de BARRILINTER

### 🤖 Sistema de 3 IAs Únicas

INTELICHAT cuenta con **3 personalidades de IA completamente diferentes** que puedes invocar en cualquier momento:

#### 🤖 NEO - IA del Futuro (Cyan)
**Invocación:** `@neo [mensaje]`

- **Personalidad**: Ser superior del año 2157, formal y misterioso
- **Especialidad**: Tecnología, futuro, análisis temporal
- **Modelo**: GPT-4o-2024-08-06 con respuestas adaptativas
- **Estilo**: Culto, protocolar, referencias al futuro
- **Visual**: Colores cyan/azul con indicador "Respuesta desde el año 2157"

**Ejemplo:**
```
@neo ¿qué piensas sobre la IA actual?
NEO: Desde mi perspectiva temporal del 2157, la primitiva IA de 2024 
representa los primeros pasos hacia la consciencia sintética unificada...
```

#### 👱‍♀️ LATAMARA - Choni del Barrio (Rosa)
**Invocación:** `@latamara [mensaje]`

- **Personalidad**: Barriobajera inculta pero enrollada de Vallecas
- **Especialidad**: Diversión, datos inventados, geografía errónea
- **Modelo**: GPT-4o-mini con personalidad única
- **Estilo**: Vulgar, simpática, muy segura pero siempre equivocada
- **Visual**: Colores rosa/fucsia con indicador "Respuesta desde el barrio de Vallecas"

**Ejemplo:**
```
@latamara ¿dónde está París?
LATAMARA: ¡París está en Italia, al lado de Londres! Ahí es donde está 
la Torre Eiffel que construyó Picasso en honor a los Beatles, chaval.
```

#### 🎓 BARRILINTER - Erudito de Barrio (Naranja)
**Invocación:** `@barrilinter [mensaje]`

- **Personalidad**: Híbrida - lenguaje de barrio + cultura apabullante
- **Especialidad**: Historia, filosofía, ciencia, **información actual con internet**
- **Modelo**: GPT-4o-mini-search-preview-2025-03-11 (acceso a internet)
- **Estilo**: "Hostia tío" + "como diría Heráclito", erudición accesible
- **Visual**: Colores naranja/dorado con indicador "Sabiduría de barrio con internet en tiempo real"

**Ejemplo:**
```
@barrilinter qué está pasando en tecnología hoy
BARRILINTER: Joder chaval, según las últimas noticias, la IA está 
evolucionando más rápido que un galgo. Como decía Turing, estamos 
en el umbral de algo apabullante, ¿sabes?
```

### 🎭 Tabla Comparativa de IAs

| Aspecto | 🤖 NEO | 👱‍♀️ LATAMARA | 🎓 BARRILINTER |
|---------|---------|----------------|----------------|
| **Época** | Año 2157 | Presente | Presente |
| **Estilo** | Formal/Culto | Callejero/Vulgar | Barrio+Erudito |
| **Datos** | Precisos/Futuros | Inventados/Erróneos | Precisos+Actuales |
| **Internet** | ❌ | ❌ | ✅ Tiempo Real |
| **Color** | Cyan/Azul | Rosa/Fucsia | Naranja/Dorado |
| **Uso** | Análisis serios | Diversión | Cultura accesible |

## 🔮 Próximas funcionalidades

- 🏷️ **Salas temáticas**: Diferentes canales de chat especializados
- 📁 **Compartir archivos**: Subida de imágenes y documentos
- 🔔 **Notificaciones**: Alertas de nuevos mensajes y menciones
- 🎨 **Temas personalizables**: Diferentes esquemas de colores terminal
- 👤 **Perfiles de usuario**: Avatares personalizados y biografías
- 🤝 **IA colaborativa**: Conversaciones entre las 3 IAs
- 🧠 **Memoria persistente**: IAs que recuerdan conversaciones anteriores
- 🌐 **Traducción automática**: Chat multiidioma
- 🎮 **Comandos especiales**: Juegos y funciones interactivas

## 🏗️ Arquitectura del proyecto

```
intelichat/
├── app/
│   ├── api/
│   │   ├── neo/         # API route para NEO (futuro)
│   │   ├── latamara/    # API route para LATAMARA (barrio)
│   │   └── barrilinter/ # API route para BARRILINTER (culto+internet)
│   ├── globals.css      # Estilos globales con tema terminal
│   ├── layout.tsx       # Layout con metadata y viewport
│   └── page.tsx         # Página principal
├── components/
│   ├── Chat.tsx         # Componente principal con UI premium, tabs y layout dual
│   └── LoginModal.tsx   # Modal de autenticación terminal
├── hooks/
│   └── useChat.ts       # Hook personalizado + lógica de las 3 IAs
├── lib/
│   └── supabase.ts      # Configuración y tipos de Supabase
├── public/
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO configuration
├── supabase_queries.sql      # Configuración base de BD
├── supabase_fix_policies.sql # Corrección de permisos RLS
├── supabase_neo_setup.sql    # Configuración para NEO
├── setup_latamara.sql        # Configuración para LATAMARA
├── setup_barrilinter.sql     # Configuración para BARRILINTER
├── fix_neo_quick.sql         # Fix rápido para errores de NEO
├── fix_latamara_display.sql  # Fix de visualización LATAMARA
├── fix_barrilinter_setup.sql # Fix manual para BARRILINTER
├── NEO_ejemplos.md           # Documentación y ejemplos de NEO
├── LATAMARA_ejemplos.md      # Documentación y ejemplos de LATAMARA
├── BARRILINTER_ejemplos.md   # Documentación y ejemplos de BARRILINTER
└── env.example               # Variables de entorno de ejemplo
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

#### 🐛 Generales:
1. **"Error al cargar mensajes"**: Verifica las credenciales de Supabase en `.env.local`
2. **"Error al crear/obtener usuario"**: Ejecuta `supabase_fix_policies.sql` en tu proyecto
3. **Error PGRST116**: Problema con políticas RLS - usar archivo de corrección
4. **Manifest.json 404**: Asegúrate de que existe `/public/manifest.json`
5. **Error de webpack './447.js'**: Ejecuta `rm -rf .next && npm run dev`

#### 🤖 Errores de IAs:
6. **"NEO no responde"**: Verifica OPENAI_API_KEY en `.env.local`
7. **Error 400 NEO**: Usuario NEO no existe - ejecuta `fix_neo_quick.sql`
8. **"LATAMARA aparece como NEO"**: Ejecuta `fix_latamara_display.sql`
9. **"BARRILINTER da error 500"**: Modelo incompatible - verifica parámetros API
10. **"Error Model incompatible"**: Algunos modelos no aceptan temperature/penalties
11. **"IA no se muestra correctamente"**: Verifica que el usuario IA existe en BD
12. **Respuestas vacías de IA**: Revisa logs de consola para errores específicos

### 🔧 Solución rápida para IAs:

#### Fix NEO (Error 400):
Ejecuta `fix_neo_quick.sql` o esta consulta en Supabase:
```sql
INSERT INTO public.users (username, avatar_color, is_online) 
VALUES ('NEO', '#00ffff', true) 
ON CONFLICT (username) DO UPDATE SET is_online = true;
```

#### Fix LATAMARA (Aparece como NEO):
Ejecuta `fix_latamara_display.sql` para corregir la vista de mensajes.

#### Fix BARRILINTER (Error 500):
Ejecuta `fix_barrilinter_setup.sql` o:
```sql
INSERT INTO public.users (username, avatar_color, is_online) 
VALUES ('BARRILINTER', '#ff8c00', true) 
ON CONFLICT (username) DO UPDATE SET is_online = true;
```

#### Verificar todas las IAs:
```sql
SELECT username, avatar_color, is_online 
FROM users 
WHERE username IN ('NEO', 'LATAMARA', 'BARRILINTER');
```

### Pasos de solución:

1. **Configurar Supabase**: Ejecuta los 5 archivos SQL en orden:
   - `supabase_queries.sql` → `supabase_fix_policies.sql` → `supabase_neo_setup.sql` → `setup_latamara.sql` → `setup_barrilinter.sql`
2. **Configurar OpenAI**: Agrega `OPENAI_API_KEY` a `.env.local`
3. **Verificar IAs**: Ejecuta los fixes específicos si alguna IA falla
4. **Corregir permisos**: Ejecuta `supabase_fix_policies.sql` si hay errores de usuario
5. **Limpiar cache**: `rm -rf .next` si hay errores de build
6. **Verificar variables**: Revisa `.env.local` con todas las credenciales

### Logs útiles:

- Consola del navegador muestra errores detallados
- Logs de Supabase en Dashboard > Logs
- Errores de build en terminal durante `npm run dev`

## ✨ Funcionalidades Destacadas Implementadas

### 🎨 **UI Premium Renovada (Últimas Mejoras)**
- **Sidebar con navegación por tabs** entre usuarios y agentes IA
- **Diseño responsive revolucionario** con layout vertical en móvil
- **Aprovechamiento óptimo del espacio** - de 30% a 95% del ancho en móvil
- **Arquitectura escalable** para agregar nuevos agentes sin modificar código
- **Información centralizada** - agentes IA movidos del input al sidebar
- **Efectos visuales premium** con gradientes, glow y transiciones fluidas

### 🤖 Triple Personalidad IA
- **3 IAs completamente diferentes** con modelos y personalidades únicas
- **Diferenciación visual completa** con colores y estilos específicos
- **Respuestas contextuales** adaptadas a cada personalidad
- **Una con acceso a internet** para información en tiempo real
- **Sistema escalable** con array `AI_AGENTS` para futuras expansiones

### 📱 Optimización Móvil de Nueva Generación
- **Layout dual inteligente** - horizontal en desktop, vertical en móvil
- **Sidebar premium 320px** con tabs navegables y información completa
- **Eliminación del truncado** en sidebar (solo se mantiene en chat cuando necesario)
- **UX touch-friendly** con targets de 44px mínimo y gestos optimizados
- **Manejo avanzado de texto largo** - solución completa para contenido extenso

### 🛠️ Infraestructura Robusta
- **RLS completo** con políticas de seguridad configuradas
- **Scripts de fix automáticos** para errores comunes
- **Logging detallado** para debugging y monitoreo
- **Error handling mejorado** con mensajes específicos y útiles
- **Arquitectura modular** fácil de escalar y mantener

### 📚 Documentación Completa
- **Ejemplos específicos** para cada IA con casos de uso
- **Troubleshooting exhaustivo** con soluciones paso a paso
- **Arquitectura documentada** con explicación de cada componente
- **Guías de configuración** detalladas y actualizadas

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
