// Configuración del sistema de usuarios online en tiempo real
export const USER_ACTIVITY_CONFIG = {
  // Tiempo máximo de inactividad antes de marcar usuario como offline (2 minutos - más agresivo)
  MAX_INACTIVE_TIME: 2 * 60 * 1000,
  
  // Duración de notificaciones de conexión/desconexión (3 segundos)
  NOTIFICATION_DURATION: 3 * 1000,
  
  // Lista de usuarios IA que siempre deben permanecer online
  AI_USERS: ['NEO', 'LATAMARA', 'BARRILINTER'],
  
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