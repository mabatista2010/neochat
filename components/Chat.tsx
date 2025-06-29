'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageWithUser, User } from '@/lib/supabase'

interface ChatProps {
  messages: MessageWithUser[]
  users: User[]
  currentUser: User
  onSendMessage: (message: string) => void
  onLogout: () => void
}

const Chat: React.FC<ChatProps> = ({ 
  messages, 
  users, 
  currentUser, 
  onSendMessage, 
  onLogout 
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cursor parpadeante
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Auto-focus al input (solo en desktop)
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (!isMobile) {
      inputRef.current?.focus()
    }
  }, [])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
      // En móvil, hacer focus después de enviar
      if (window.innerWidth < 768) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-ES', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUsernameColor = (color: string) => {
    return { color }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Función para truncar nombres de usuario en móvil
  const truncateUsernameForMobile = (username: string) => {
    if (username.length > 6) {
      return username.substring(0, 6) + '...'
    }
    return username
  }

  return (
    <div className="flex h-screen bg-black text-green-400 font-mono relative">
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Panel lateral de usuarios */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed md:relative md:translate-x-0
        w-72 md:w-64 h-full
        bg-gray-950 border-r border-green-500 
        transition-transform duration-300 ease-in-out
        z-50 md:z-auto
        overflow-y-auto
      `}>
        <div className="p-3 md:p-4">
          {/* Header del sidebar con botón cerrar en móvil */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-green-500 text-sm md:text-base mb-1">{'>'} USUARIOS ONLINE</h2>
              <div className="text-xs text-green-600">
                {users.length} conectado{users.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="md:hidden text-green-500 hover:text-green-400 p-1"
            >
              ✕
            </button>
          </div>
          
          {/* Lista de usuarios */}
          <div className="space-y-2 mb-6">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-1">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ backgroundColor: user.avatar_color }}
                />
                <span 
                  className={`text-sm flex-1 ${
                    user.id === currentUser.id ? 'font-bold' : ''
                  }`}
                  style={getUsernameColor(user.avatar_color)}
                >
                  {/* Versión móvil truncada */}
                  <span className="md:hidden">
                    {truncateUsernameForMobile(user.username)}
                    {user.id === currentUser.id && ' (tú)'}
                  </span>
                  {/* Versión desktop completa */}
                  <span className="hidden md:inline truncate">
                    {user.username}
                    {user.id === currentUser.id && ' (tú)'}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Botón desconectar */}
          <div className="mt-auto pt-4 border-t border-green-800">
            <button
              onClick={onLogout}
              className="w-full text-left text-xs md:text-sm text-green-600 hover:text-green-400 transition-colors p-2 rounded hover:bg-green-950"
            >
              {'>'} Desconectar
            </button>
          </div>
        </div>
      </div>

      {/* Panel principal del chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gray-950 border-b border-green-500 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Botón hamburguesa para móvil */}
              <button
                onClick={toggleSidebar}
                className="md:hidden text-green-500 hover:text-green-400 p-1 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-green-500 font-bold text-sm md:text-base truncate">
                  INTELICHAT - SALA GENERAL
                </h1>
                <div className="text-xs text-green-600 mt-1">
                  {'>'} Conectado como{' '}
                  {/* Versión móvil truncada */}
                  <span className="md:hidden">
                    {truncateUsernameForMobile(currentUser.username)}
                  </span>
                  {/* Versión desktop completa */}
                  <span className="hidden md:inline">
                    {currentUser.username}
                  </span>
                </div>
              </div>
            </div>
            
                         {/* Info IA - oculta en móvil pequeño */}
             <div className="hidden sm:block text-xs text-green-600 flex-shrink-0">
               {'>'} IA: @neo (futuro) | @latamara (barrio) | @barrilinter (culto)
             </div>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-green-600 mt-8">
              <div className="text-sm md:text-base">{'>'} No hay mensajes aún</div>
              <div className="text-xs md:text-sm mt-2">Sé el primero en escribir algo...</div>
            </div>
          ) : (
            messages.map((message) => {
              // Determinar qué IA es basándose en el username con debug
              const isNeo = message.message_type === 'ai' && (message.username === 'NEO' || message.username?.includes('NEO'))
              const isLatamara = message.message_type === 'ai' && (message.username === 'LATAMARA' || message.username?.includes('LATAMARA'))
              const isBarrilinter = message.message_type === 'ai' && (message.username === 'BARRILINTER' || message.username?.includes('BARRILINTER'))
              const isAI = isNeo || isLatamara || isBarrilinter
              
              // Debug para identificar el problema
              if (message.message_type === 'ai') {
                console.log('🤖 Mensaje IA detectado:', {
                  id: message.id,
                  username: message.username,
                  isNeo,
                  isLatamara,
                  isBarrilinter,
                  content: message.content.substring(0, 50) + '...'
                })
              }
              
              return (
                <div key={message.id} className={`group ${isAI ? 'ai-message' : ''}`}>
                  <div className={`flex items-start space-x-2 md:space-x-3 ${
                    isNeo 
                      ? 'bg-cyan-950 bg-opacity-20 p-2 rounded border-l-2 border-cyan-400'
                      : isLatamara
                      ? 'bg-pink-950 bg-opacity-20 p-2 rounded border-l-2 border-pink-400'
                      : isBarrilinter
                      ? 'bg-orange-950 bg-opacity-20 p-2 rounded border-l-2 border-orange-400'
                      : ''
                  }`}>
                    {/* Timestamp - más pequeño en móvil */}
                    <span className="text-xs text-green-600 min-w-[45px] md:min-w-[50px] flex-shrink-0">
                      [{formatTimestamp(message.created_at)}]
                    </span>
                    
                    {/* Username - adaptativo con indicador de IA */}
                    <span 
                      className={`font-semibold text-sm md:text-base min-w-[80px] md:min-w-[100px] flex-shrink-0 ${
                        isNeo ? 'text-cyan-400' : isLatamara ? 'text-pink-400' : isBarrilinter ? 'text-orange-400' : ''
                      }`}
                      style={!isAI ? getUsernameColor(message.avatar_color) : undefined}
                    >
                      {isNeo ? '🤖 NEO' : isLatamara ? '👱‍♀️ LATAMARA' : isBarrilinter ? '🎓 BARRILINTER' : (
                        <>
                          {/* Versión móvil truncada */}
                          <span className="md:hidden">
                            {truncateUsernameForMobile(message.username)}
                          </span>
                          {/* Versión desktop completa */}
                          <span className="hidden md:inline">
                            {message.username}
                          </span>
                        </>
                      )}:
                    </span>
                    
                    {/* Mensaje con estilo diferente para cada IA */}
                    <span className={`flex-1 break-words text-sm md:text-base ${
                      isNeo 
                        ? 'text-cyan-300 italic' 
                        : isLatamara
                        ? 'text-pink-300 font-normal'
                        : isBarrilinter
                        ? 'text-orange-300 italic'
                        : 'text-green-400'
                    }`}>
                      {message.content}
                    </span>
                  </div>
                  
                  {/* Indicadores adicionales para mensajes de IA */}
                  {isNeo && (
                    <div className="text-xs text-cyan-600 mt-1 ml-16 md:ml-20">
                      {'>'} Respuesta desde el año 2157
                    </div>
                  )}
                  {isLatamara && (
                    <div className="text-xs text-pink-600 mt-1 ml-16 md:ml-20">
                      {'>'} Respuesta desde el barrio de Vallecas
                    </div>
                  )}
                  {isBarrilinter && (
                    <div className="text-xs text-orange-600 mt-1 ml-16 md:ml-20">
                      {'>'} Sabiduría de barrio con acceso a internet
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensaje */}
        <div className="bg-gray-950 border-t border-green-500 p-3 md:p-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <span className="text-green-500 text-xs md:text-sm flex-shrink-0">
              [
              {/* Versión móvil truncada */}
              <span className="md:hidden">
                {truncateUsernameForMobile(currentUser.username)}
              </span>
              {/* Versión desktop completa */}
              <span className="hidden md:inline">
                {currentUser.username}
              </span>
              ]$
            </span>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-transparent text-green-400 placeholder-green-700 outline-none border-none text-sm md:text-base py-1"
                maxLength={500}
                autoComplete="off"
              />
              {showCursor && inputMessage === '' && (
                <div className="absolute left-0 top-1 text-green-400 pointer-events-none text-sm md:text-base">
                  _
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="text-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm px-2 py-1 border border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors flex-shrink-0"
            >
              ENVIAR
            </button>
          </div>
          
                     {/* Info del input */}
           <div className="text-xs text-green-600 mt-2 space-y-1">
             <div className="flex justify-between items-center">
               <span>{'>'} Presiona ENTER para enviar</span>
               <span className="text-right">{inputMessage.length}/500</span>
             </div>
             <div className="text-cyan-600">
               {'>'} Escribe &quot;@neo [mensaje]&quot; para la IA del futuro
             </div>
             <div className="text-pink-600">
               {'>'} Escribe &quot;@latamara [mensaje]&quot; para la choni del barrio
             </div>
             <div className="text-orange-600">
               {'>'} Escribe &quot;@barrilinter [mensaje]&quot; para el culto de barrio
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Chat 