// Configuración del sistema de usuarios online en tiempo real
export const USER_ACTIVITY_CONFIG = {
  // Tiempo máximo de inactividad antes de marcar usuario como offline (2 minutos - más agresivo)
  MAX_INACTIVE_TIME: 2 * 60 * 1000,
  
  // Duración de notificaciones de conexión/desconexión (3 segundos)
  NOTIFICATION_DURATION: 3 * 1000,
  
  // Lista de usuarios IA que siempre deben permanecer online
  AI_USERS: ['NEO', 'LATAMARA', 'BARRILINTER', 'LACONCHITA', 'MARKTUKEMBERG', 'ROBERTTHECOACH'],
  
  // Debounce para eventos de actividad (100ms)
  ACTIVITY_DEBOUNCE: 100
} as const

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  USER_CONNECTED: (username: string) => `🟢 ${username} se conectó`,
  USER_DISCONNECTED: (username: string) => `🔴 ${username} se desconectó`,
  ACTIVITY_UPDATED: (username: string) => `⚡ Actividad actualizada para: ${username}`,
  REALTIME_CONNECTED: '⚡ Sistema en tiempo real conectado',
  REALTIME_ERROR: '❌ Error en sistema en tiempo real'
} as const

// Información de los agentes IA para el sidebar
export const AI_AGENTS = [
  {
    name: 'NEO',
    icon: '🤖',
    color: '#00ffff',
    command: '@neo',
    description: 'IA del Futuro (2157)',
    specialties: ['Tecnología avanzada', 'Análisis temporal', 'Perspectiva futura'],
    example: '@neo ¿qué opinas del presente?'
  },
  {
    name: 'LATAMARA',
    icon: '👱‍♀️',
    color: '#ff1493',
    command: '@latamara',
    description: 'Choni de Vallecas',
    specialties: ['Diversión garantizada', 'Datos inventados', 'Geografía errónea'],
    example: '@latamara ¿dónde está París?'
  },
  {
    name: 'BARRILINTER',
    icon: '🎓',
    color: '#ff8c00',
    command: '@barrilinter',
    description: 'Erudito de Barrio',
    specialties: ['Historia y filosofía', 'Sabiduría accesible', 'Info en tiempo real'],
    example: '@barrilinter explícame algo interesante'
  },
  {
    name: 'LACONCHITA',
    icon: '👵',
    color: '#ff69b4',
    command: '@laconchita',
    description: 'Abuela Sabia',
    specialties: ['Consejos maternales', 'Refranes tradicionales', 'Sabiduría popular'],
    example: '@laconchita necesito un consejo'
  },
  {
    name: 'MARKTUKEMBERG',
    icon: '👨‍💻',
    color: '#00ff7f',
    command: '@marktukemberg',
    description: 'Hacker Millennial',
    specialties: ['Tecnología actual', 'Cultura geek', 'Memes y gaming'],
    example: '@marktukemberg qué opinas de esta app?'
  },
  {
    name: 'ROBERTTHECOACH',
    icon: '🏃‍♂️',
    color: '#ffa500',
    command: '@robertthecoach',
    description: 'Coach Motivador',
    specialties: ['Motivación extrema', 'Desarrollo personal', 'Mindset ganador'],
    example: '@robertthecoach necesito motivación'
  }
] as const