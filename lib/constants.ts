// Configuración del sistema de usuarios online
export const USER_ACTIVITY_CONFIG = {
  // Tiempo máximo de inactividad antes de marcar usuario como offline (5 minutos)
  MAX_INACTIVE_TIME: 5 * 60 * 1000,
  
  // Intervalo de heartbeat para mantener usuario activo (30 segundos)
  HEARTBEAT_INTERVAL: 30 * 1000,
  
  // Intervalo de limpieza automática de usuarios inactivos (2 minutos)
  CLEANUP_INTERVAL: 2 * 60 * 1000,
  
  // Duración de notificaciones de conexión/desconexión (3 segundos)
  NOTIFICATION_DURATION: 3 * 1000,
  
  // Lista de usuarios IA que siempre deben permanecer online
  AI_USERS: ['NEO', 'LATAMARA', 'BARRILINTER']
} as const

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  USER_CONNECTED: (username: string) => `🟢 ${username} se conectó`,
  USER_DISCONNECTED: (username: string) => `🔴 ${username} se desconectó`,
  HEARTBEAT_SENT: (username: string) => `💓 Heartbeat enviado para: ${username}`,
  CLEANUP_COMPLETED: '🧹 Limpieza de usuarios inactivos completada',
  PERIODIC_CLEANUP: '🕒 Ejecutando limpieza periódica de usuarios inactivos...'
} as const 