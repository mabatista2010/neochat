import { useState, useEffect, useCallback } from 'react'
import { supabase, MessageWithUser, User } from '@/lib/supabase'
import { USER_ACTIVITY_CONFIG, SYSTEM_MESSAGES } from '@/lib/constants'

// Tipos para salas
export interface Room {
  id: string
  name: string
  description: string | null
  is_general: boolean
}

export const useChat = () => {
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [allMessages, setAllMessages] = useState<MessageWithUser[]>([]) // Todos los mensajes
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlineNotification, setOnlineNotification] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Obtener salas disponibles
  const fetchRooms = useCallback(async () => {
    try {
      console.log('🏗️ Cargando salas disponibles...')
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('is_general', { ascending: false }) // Sala general primero

      if (error) {
        console.error('Error fetching rooms:', error)
        return
      }
      
      console.log('🏠 Salas obtenidas:', data?.map(r => ({ name: r.name, id: r.id, is_general: r.is_general })))
      setRooms(data || [])
      
      // Establecer sala inicial si no hay una seleccionada
      if (data && data.length > 0 && !currentRoom) {
        const generalRoom = data.find(room => room.is_general) || data[0]
        console.log('🎯 Estableciendo sala inicial:', generalRoom.name)
        setCurrentRoom(generalRoom)
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
    }
  }, [currentRoom])

  // Obtener todos los mensajes
  const fetchAllMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages_with_user')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
      
      console.log('Todos los mensajes obtenidos:', data?.length || 0)
      setAllMessages(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Error al cargar mensajes. Verifica tu conexión.')
    }
  }, [])

  // Filtrar mensajes por sala actual
  useEffect(() => {
    console.log('🔍 Filtro de mensajes ejecutándose:', {
      currentRoom: currentRoom?.name,
      totalMessages: allMessages.length,
      currentRoomId: currentRoom?.id
    })
    
    if (currentRoom) {
      const roomMessages = allMessages.filter(message => message.room_name === currentRoom.name)
      console.log(`📨 Mensajes filtrados para "${currentRoom.name}":`, {
        total: roomMessages.length,
        mensajes: roomMessages.map(m => ({ 
          id: m.id.slice(0, 8), 
          user: m.username, 
          preview: m.content.slice(0, 50) 
        }))
      })
      setMessages(roomMessages)
    } else {
      console.log('⚠️ No hay sala actual, mostrando todos los mensajes')
      setMessages(allMessages)
    }
  }, [currentRoom, allMessages])

  // Cambiar sala
  const changeRoom = useCallback((room: Room) => {
    console.log(`🏠 Cambiando a sala: "${room.name}" (ID: ${room.id})`)
    setCurrentRoom(room)
  }, [])

  // Obtener mensajes iniciales (renombrado para claridad)
  const fetchMessages = fetchAllMessages

  // Limpiar usuarios inactivos (función auxiliar)
  const cleanupInactiveUsers = useCallback(async () => {
    try {
      // Marcar como offline usuarios que no han estado activos según configuración
      const inactiveThreshold = new Date(Date.now() - USER_ACTIVITY_CONFIG.MAX_INACTIVE_TIME).toISOString()
      
      const { error } = await supabase
        .from('users')
        .update({ is_online: false })
        .eq('is_online', true)
        .lt('last_seen', inactiveThreshold)
        .not('username', 'in', `(${USER_ACTIVITY_CONFIG.AI_USERS.join(',')})`)
      
      if (error) {
        console.error('Error cleaning up inactive users:', error)
      } else {
        console.log('🧹 Limpieza manual de usuarios inactivos completada')
      }
    } catch (err) {
      console.error('Error in cleanup:', err)
    }
  }, [])

    // Obtener usuarios online en tiempo real (con debugging)
  const fetchUsers = useCallback(async () => {
    try {
      console.log('🔍 Iniciando fetchUsers...')
      
      // Filtrar usuarios activos directamente en la consulta
      const activeThreshold = new Date(Date.now() - USER_ACTIVITY_CONFIG.MAX_INACTIVE_TIME).toISOString()
      console.log('⏰ Threshold de actividad:', activeThreshold)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_online', true)
        .gte('last_seen', activeThreshold)
        .order('username')

      if (error) {
        console.error('❌ Error fetching users:', error)
        throw error
      }
      
      console.log('📊 Datos de usuarios obtenidos:', {
        total: data?.length || 0,
        usuarios: data?.map(u => ({
          username: u.username,
          last_seen: u.last_seen,
          minutes_ago: ((Date.now() - new Date(u.last_seen).getTime()) / 60000).toFixed(1)
        }))
      })
      
      // Detectar cambios en usuarios para notificaciones (solo si hay usuarios previos)
      if (data && currentUser && users.length > 0) {
        const newUsers = data.filter(user => user.username !== currentUser.username)
        const currentUsernames = users
          .filter(user => user.username !== currentUser.username)
          .map(user => user.username)
        const newUsernames = newUsers.map(user => user.username)
        
        console.log('🔄 Comparando usuarios:', {
          anteriores: currentUsernames,
          nuevos: newUsernames
        })
        
        // Detectar usuarios que se conectaron
        const justConnected = newUsernames.filter(username => !currentUsernames.includes(username))
        if (justConnected.length > 0) {
          justConnected.forEach(username => {
            console.log(SYSTEM_MESSAGES.USER_CONNECTED(username))
            setOnlineNotification(SYSTEM_MESSAGES.USER_CONNECTED(username))
            setTimeout(() => setOnlineNotification(null), USER_ACTIVITY_CONFIG.NOTIFICATION_DURATION)
          })
        }
        
        // Detectar usuarios que se desconectaron
        const justDisconnected = currentUsernames.filter(username => !newUsernames.includes(username))
        if (justDisconnected.length > 0) {
          justDisconnected.forEach(username => {
            console.log(SYSTEM_MESSAGES.USER_DISCONNECTED(username))
            setOnlineNotification(SYSTEM_MESSAGES.USER_DISCONNECTED(username))
            setTimeout(() => setOnlineNotification(null), USER_ACTIVITY_CONFIG.NOTIFICATION_DURATION)
          })
        }
      }
      
      console.log('⚡ Usuarios online finales:', data?.length || 0)
      setUsers(data || [])
    } catch (err) {
      console.error('❌ Error general en fetchUsers:', err)
      // No establecer error aquí para no interferir con el flujo principal
    }
  }, [users, currentUser])

  // Crear o obtener usuario
  const createOrGetUser = useCallback(async (username: string): Promise<User | null> => {
    try {
      // Primero intentar obtener el usuario existente
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)

      if (fetchError) {
        console.error('Error fetching user:', fetchError)
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0]
        
        // Actualizar como online
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_online: true, 
            last_seen: new Date().toISOString() 
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('Error updating user:', updateError)
          // Aunque falle la actualización, devolvemos el usuario existente
        }

        // Verificar si el usuario es administrador
        setIsAdmin(existingUser.is_admin || false)
        
        // Devolver el usuario existente con los datos actualizados
        return {
          ...existingUser,
          is_online: true,
          last_seen: new Date().toISOString()
        }
      }

      // Si no existe, crear nuevo usuario
      const colors = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff', '#ff6600']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          display_name: username,
          avatar_color: randomColor,
          is_online: true
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }
      
      // Verificar si el nuevo usuario es administrador
      setIsAdmin(newUser.is_admin || false)
      
      return newUser
    } catch (err) {
      console.error('Error creating/getting user:', err)
      setError('Error al crear/obtener usuario. Intenta con otro nombre.')
      return null
    }
  }, [])

  // Función para obtener ID de usuario NEO (versión simplificada)
  const getNeoUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'NEO')
        .single()

      if (error || !data) {
        console.error('Error getting NEO user ID:', error)
        return null
      }

      return data.id
    } catch (err) {
      console.error('Error in getNeoUserId:', err)
      return null
    }
  }, [])

  // Función para obtener ID de usuario LATAMARA
  const getLatamaraUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'LATAMARA')
        .single()

      if (error || !data) {
        console.error('Error getting LATAMARA user ID:', error)
        return null
      }

      return data.id
    } catch (err) {
      console.error('Error in getLatamaraUserId:', err)
      return null
    }
  }, [])

  // Función para obtener ID de usuario BARRILINTER
  const getBarrilinterUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'BARRILINTER')
        .single()

      if (error || !data) {
        console.error('Error getting BARRILINTER user ID:', error)
        return null
      }

      return data.id
    } catch (err) {
      console.error('Error in getBarrilinterUserId:', err)
      return null
    }
  }, [])

  // Función para invocar a NEO
  const invokeNEO = useCallback(async (userMessage: string, roomId: string) => {
    try {
      console.log('Invocando a NEO con:', userMessage)
      
      const response = await fetch('/api/neo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatContext: messages,
          username: currentUser?.username || 'Anónimo'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con NEO')
      }

      // Obtener ID de usuario NEO
      const neoUserId = await getNeoUserId()
      
      if (!neoUserId) {
        throw new Error('No se pudo obtener el ID de usuario NEO')
      }

      // Insertar respuesta de NEO en la base de datos
      const { error: neoError } = await supabase
        .from('messages')
        .insert({
          content: data.message,
          user_id: neoUserId,
          room_id: roomId,
          message_type: 'ai'
        })

      if (neoError) {
        console.error('Error inserting NEO message:', neoError)
        throw neoError
      }

      console.log('NEO respondió exitosamente')
    } catch (err) {
      console.error('Error invoking NEO:', err)
      setError('Error al invocar a NEO. Verifica tu conexión.')
      
      // Intentar insertar mensaje de error
      try {
        const neoUserId = await getNeoUserId()
        if (neoUserId) {
          await supabase
            .from('messages')
            .insert({
              content: 'ERROR: No pude procesar tu solicitud. Mis sistemas temporales están experimentando interferencias.',
              user_id: neoUserId,
              room_id: roomId,
              message_type: 'ai'
            })
        }
      } catch (errorInsertError) {
        console.error('Error inserting error message:', errorInsertError)
      }
    }
  }, [currentUser, messages, getNeoUserId])

  // Función para invocar a LATAMARA
  const invokeLatamara = useCallback(async (userMessage: string, roomId: string) => {
    try {
      console.log('Invocando a LATAMARA con:', userMessage)
      
      const response = await fetch('/api/latamara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatContext: messages,
          username: currentUser?.username || 'Anónimo'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con LATAMARA')
      }

      // Obtener ID de usuario LATAMARA
      const latamaraUserId = await getLatamaraUserId()
      
      if (!latamaraUserId) {
        throw new Error('No se pudo obtener el ID de usuario LATAMARA')
      }

      // Insertar respuesta de LATAMARA en la base de datos
      const { error: latamaraError } = await supabase
        .from('messages')
        .insert({
          content: data.message,
          user_id: latamaraUserId,
          room_id: roomId,
          message_type: 'ai'
        })

      if (latamaraError) {
        console.error('Error inserting LATAMARA message:', latamaraError)
        throw latamaraError
      }

      console.log('LATAMARA respondió exitosamente')
    } catch (err) {
      console.error('Error invoking LATAMARA:', err)
      setError('Error al invocar a LATAMARA. Verifica tu conexión.')
      
      // Intentar insertar mensaje de error
      try {
        const latamaraUserId = await getLatamaraUserId()
        if (latamaraUserId) {
          await supabase
            .from('messages')
            .insert({
              content: 'Joder tío, que se me ha petao el móvil y no puedo contestar, ¿me escribes otra vez?',
              user_id: latamaraUserId,
              room_id: roomId,
              message_type: 'ai'
            })
        }
      } catch (errorInsertError) {
        console.error('Error inserting error message:', errorInsertError)
      }
    }
  }, [currentUser, messages, getLatamaraUserId])

  // Función para invocar a BARRILINTER
  const invokeBarrilinter = useCallback(async (userMessage: string, roomId: string) => {
    try {
      console.log('🎓 Frontend: Invocando a BARRILINTER con:', userMessage)
      
      const response = await fetch('/api/barrilinter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatContext: messages,
          username: currentUser?.username || 'Anónimo'
        }),
      })

      const data = await response.json()
      console.log('🎓 Frontend: Respuesta recibida de BARRILINTER API:', { 
        ok: response.ok, 
        status: response.status,
        hasMessage: !!data.message 
      })

      if (!response.ok) {
        console.error('🚨 Frontend: Error en respuesta de BARRILINTER:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          hasError: !!data?.error,
          hasDetails: !!data?.details,
          errorMessage: data?.error,
          errorDetails: data?.details
        })
        
        const errorMsg = data?.error || data?.details || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMsg)
      }

      // Obtener ID de usuario BARRILINTER
      const barrilinterUserId = await getBarrilinterUserId()
      
      if (!barrilinterUserId) {
        throw new Error('No se pudo obtener el ID de usuario BARRILINTER')
      }

      // Insertar respuesta de BARRILINTER en la base de datos
      const { error: barrilinterError } = await supabase
        .from('messages')
        .insert({
          content: data.message,
          user_id: barrilinterUserId,
          room_id: roomId,
          message_type: 'ai'
        })

      if (barrilinterError) {
        console.error('🚨 Frontend: Error inserting BARRILINTER message:', barrilinterError)
        throw barrilinterError
      }

      console.log('✅ Frontend: BARRILINTER respondió exitosamente y se guardó en BD')
    } catch (err) {
      console.error('🚨 Frontend: Error general invocando BARRILINTER:', {
        error: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : undefined
      })
      setError('Error al invocar a BARRILINTER. Verifica tu conexión.')
      
      // Intentar insertar mensaje de error
      try {
        const barrilinterUserId = await getBarrilinterUserId()
        if (barrilinterUserId) {
          await supabase
            .from('messages')
            .insert({
              content: 'Joder chaval, que se me ha cascado el sistema y no puedo contestar. Como diría Murphy en su ley: "Si algo puede salir mal, saldrá mal". Inténtalo otra vez.',
              user_id: barrilinterUserId,
              room_id: roomId,
              message_type: 'ai'
            })
        }
      } catch (errorInsertError) {
        console.error('Error inserting error message:', errorInsertError)
      }
    }
  }, [currentUser, messages, getBarrilinterUserId])

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!currentUser || !currentRoom || !content.trim()) return

    try {
      // Insertar mensaje del usuario en la sala actual
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          user_id: currentUser.id,
          room_id: currentRoom.id,
          message_type: 'user'
        })

      if (error) throw error

      // Solo procesar comandos de IA en la sala general
      if (currentRoom.is_general) {
        // Verificar si el mensaje invoca a alguna IA
        const trimmedContent = content.trim().toLowerCase()
        
        if (trimmedContent.startsWith('@neo ')) {
          const neoMessage = content.trim().substring(5) // Remover "@neo "
          
          if (neoMessage.length > 0) {
            console.log('Mensaje para NEO detectado:', neoMessage)
            
            // Pequeño delay para que el mensaje del usuario aparezca primero
            setTimeout(() => {
              invokeNEO(neoMessage, currentRoom.id)
            }, 500)
          }
        } else if (trimmedContent.startsWith('@latamara ')) {
          const latamaraMessage = content.trim().substring(10) // Remover "@latamara "
          
          if (latamaraMessage.length > 0) {
            console.log('Mensaje para LATAMARA detectado:', latamaraMessage)
            
            // Pequeño delay para que el mensaje del usuario aparezca primero
            setTimeout(() => {
              invokeLatamara(latamaraMessage, currentRoom.id)
            }, 800) // Un poco más de delay para diferenciarlo de NEO
          }
        } else if (trimmedContent.startsWith('@barrilinter ')) {
          const barrilinterMessage = content.trim().substring(13) // Remover "@barrilinter "
          
          if (barrilinterMessage.length > 0) {
            console.log('Mensaje para BARRILINTER detectado:', barrilinterMessage)
            
            // Delay diferente para cada IA
            setTimeout(() => {
              invokeBarrilinter(barrilinterMessage, currentRoom.id)
            }, 1000) // Mayor delay para diferenciarlo
          }
        }
      }
      
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Error al enviar mensaje')
    }
  }, [currentUser, currentRoom, invokeNEO, invokeLatamara, invokeBarrilinter])

  // Configurar subscripciones en tiempo real
  useEffect(() => {
    if (!currentUser) return

    // Suscripción a nuevos mensajes
    const messagesChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    // Suscripción a cambios de usuarios
    const usersChannel = supabase
      .channel('users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(usersChannel)
    }
  }, [currentUser, fetchMessages, fetchUsers])

  // Inicializar datos
  useEffect(() => {
    const initializeChat = async () => {
      await fetchRooms() // Cargar salas primero
      await fetchMessages()
      await fetchUsers()
      setLoading(false)
    }

    initializeChat()
  }, [fetchRooms, fetchMessages, fetchUsers])

  // Sistema de actividad optimizado con throttling
  useEffect(() => {
    if (!currentUser) return

    console.log('⚡ Iniciando sistema de actividad optimizado para:', currentUser.username)

    let lastUpdateTime = 0
    const THROTTLE_MS = 5000 // Actualizar máximo cada 5 segundos

    const updateLastSeen = async () => {
      const now = Date.now()
      if (now - lastUpdateTime < THROTTLE_MS) {
        console.log('⏭️ Skip update - muy reciente para:', currentUser.username)
        return
      }
      lastUpdateTime = now

      try {
        console.log('🔄 Actualizando last_seen para:', currentUser.username)
        const { data, error } = await supabase
          .from('users')
          .update({ 
            last_seen: new Date().toISOString(),
            is_online: true 
          })
          .eq('id', currentUser.id)
          .select()
        
        if (error) {
          console.error('❌ Error updating last_seen:', error)
        } else {
          console.log('✅ Actividad actualizada exitosamente para:', currentUser.username, data)
        }
      } catch (err) {
        console.error('❌ Error general updating last_seen:', err)
      }
    }

    // Throttled activity handler
    const handleActivity = () => {
      console.log('🎯 Evento de actividad detectado para:', currentUser.username)
      updateLastSeen()
    }

    // Solo eventos esenciales para reducir carga
    window.addEventListener('keydown', handleActivity, { passive: true })
    window.addEventListener('click', handleActivity, { passive: true })
    window.addEventListener('focus', handleActivity, { passive: true })

    // Actualización inicial
    console.log('🚀 Actualización inicial para:', currentUser.username)
    updateLastSeen()

    // Heartbeat de seguridad cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      console.log('💓 Heartbeat para:', currentUser.username)
      updateLastSeen()
    }, 30000)

    // Cleanup
    return () => {
      console.log('🔴 Limpiando sistema de actividad para:', currentUser.username)
      clearInterval(heartbeatInterval)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('focus', handleActivity)
    }
  }, [currentUser])

  // Mejorar la lógica de desconexión para eventos del navegador
  useEffect(() => {
    if (!currentUser) return

    console.log('🔌 Configurando eventos de desconexión para:', currentUser.username)

    const handleBeforeUnload = () => {
      console.log('🚪 Usuario cerrando ventana/pestaña:', currentUser.username)
      
      // Usar sendBeacon para envío confiable al cerrar ventana
      const data = new FormData()
      data.append('userId', currentUser.id)
      
      try {
        navigator.sendBeacon('/api/user/offline', data)
      } catch (err) {
        console.error('Error con sendBeacon:', err)
        // Fallback con fetch síncrono
        fetch('/api/user/offline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id }),
          keepalive: true
        }).catch(e => console.error('Error fallback:', e))
      }
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        console.log('👁️ Usuario cambió de pestaña/minimizó:', currentUser.username)
        // Usuario cambió de pestaña o minimizó ventana
        try {
          await supabase
            .from('users')
            .update({ is_online: false })
            .eq('id', currentUser.id)
          console.log('✅ Usuario marcado offline por visibilidad')
        } catch (err) {
          console.error('❌ Error marcando offline:', err)
        }
      } else if (document.visibilityState === 'visible') {
        console.log('👁️ Usuario regresó a la pestaña:', currentUser.username)
        // Usuario regresó a la pestaña
        try {
          await supabase
            .from('users')
            .update({ 
              is_online: true,
              last_seen: new Date().toISOString()
            })
            .eq('id', currentUser.id)
          console.log('✅ Usuario marcado online por visibilidad')
        } catch (err) {
          console.error('❌ Error marcando online:', err)
        }
      }
    }

    // Eventos del navegador
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('🧹 Limpiando eventos de desconexión para:', currentUser.username)
      
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Marcar como offline al limpiar
      const markOfflineOnCleanup = async () => {
        try {
          await supabase
            .from('users')
            .update({ is_online: false })
            .eq('id', currentUser.id)
          console.log('✅ Usuario marcado offline al desmontar')
        } catch (err) {
          console.error('❌ Error marcando offline al desmontar:', err)
        }
      }
      
      markOfflineOnCleanup()
    }
  }, [currentUser])

  return {
    messages,
    users,
    rooms,
    currentRoom,
    currentUser,
    loading,
    error,
    onlineNotification,
    isAdmin,
    createOrGetUser,
    sendMessage,
    setCurrentUser,
    cleanupInactiveUsers,
    changeRoom
  }
} 