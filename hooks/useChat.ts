import { useState, useEffect, useCallback } from 'react'
import { supabase, MessageWithUser, User } from '@/lib/supabase'

export const useChat = () => {
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener mensajes iniciales
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages_with_user')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
      
      console.log('Messages fetched successfully:', data?.length || 0)
      setMessages(data || [])
      setError(null) // Limpiar errores previos
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Error al cargar mensajes. Verifica tu conexión.')
    }
  }, [])

  // Obtener usuarios online
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_online', true)
        .order('username')

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }
      
      console.log('Users fetched successfully:', data?.length || 0)
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      // No establecer error aquí para no interferir con el flujo principal
    }
  }, [])

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
      console.log('Invocando a BARRILINTER con:', userMessage)
      
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

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con BARRILINTER')
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
        console.error('Error inserting BARRILINTER message:', barrilinterError)
        throw barrilinterError
      }

      console.log('BARRILINTER respondió exitosamente')
    } catch (err) {
      console.error('Error invoking BARRILINTER:', err)
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
    if (!currentUser || !content.trim()) return

    try {
      // Obtener ID de sala general
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('is_general', true)
        .single()

      if (roomError) throw roomError

      // Insertar mensaje del usuario
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          user_id: currentUser.id,
          room_id: room.id,
          message_type: 'user'
        })

      if (error) throw error

      // Verificar si el mensaje invoca a alguna IA
      const trimmedContent = content.trim().toLowerCase()
      
      if (trimmedContent.startsWith('@neo ')) {
        const neoMessage = content.trim().substring(5) // Remover "@neo "
        
        if (neoMessage.length > 0) {
          console.log('Mensaje para NEO detectado:', neoMessage)
          
          // Pequeño delay para que el mensaje del usuario aparezca primero
          setTimeout(() => {
            invokeNEO(neoMessage, room.id)
          }, 500)
        }
      } else if (trimmedContent.startsWith('@latamara ')) {
        const latamaraMessage = content.trim().substring(10) // Remover "@latamara "
        
        if (latamaraMessage.length > 0) {
          console.log('Mensaje para LATAMARA detectado:', latamaraMessage)
          
          // Pequeño delay para que el mensaje del usuario aparezca primero
          setTimeout(() => {
            invokeLatamara(latamaraMessage, room.id)
          }, 800) // Un poco más de delay para diferenciarlo de NEO
        }
      } else if (trimmedContent.startsWith('@barrilinter ')) {
        const barrilinterMessage = content.trim().substring(13) // Remover "@barrilinter "
        
        if (barrilinterMessage.length > 0) {
          console.log('Mensaje para BARRILINTER detectado:', barrilinterMessage)
          
          // Delay diferente para cada IA
          setTimeout(() => {
            invokeBarrilinter(barrilinterMessage, room.id)
          }, 1000) // Mayor delay para diferenciarlo
        }
      }
      
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Error al enviar mensaje')
    }
  }, [currentUser, invokeNEO, invokeLatamara, invokeBarrilinter])

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
      await fetchMessages()
      await fetchUsers()
      setLoading(false)
    }

    initializeChat()
  }, [fetchMessages, fetchUsers])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (currentUser) {
        supabase
          .from('users')
          .update({ is_online: false })
          .eq('id', currentUser.id)
          .then()
      }
    }
  }, [currentUser])

  return {
    messages,
    users,
    currentUser,
    loading,
    error,
    createOrGetUser,
    sendMessage,
    setCurrentUser
  }
} 