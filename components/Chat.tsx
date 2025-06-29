'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageWithUser, User } from '@/lib/supabase'
import { Room } from '@/hooks/useChat'
import AdminControl from './AdminControl'

interface ChatProps {
  messages: MessageWithUser[]
  users: User[]
  rooms: Room[]
  currentRoom: Room | null
  currentUser: User
  onSendMessage: (message: string) => void
  onLogout: () => void
  onChangeRoom: (room: Room) => void
  onlineNotification?: string | null
  isAdmin?: boolean
}

// Definición de agentes para escalabilidad
const AI_AGENTS = [
  {
    id: 'neo',
    name: 'NEO',
    icon: '🤖',
    color: '#00ffff',
    bgColor: 'bg-cyan-950',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-400',
    description: 'IA del futuro (2157)',
    usage: '@neo [mensaje]',
    specialty: 'Análisis temporal y tecnología avanzada'
  },
  {
    id: 'latamara',
    name: 'LATAMARA', 
    icon: '👱‍♀️',
    color: '#ff69b4',
    bgColor: 'bg-pink-950',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-400',
    description: 'Choni del barrio de Vallecas',
    usage: '@latamara [mensaje]',
    specialty: 'Diversión y datos "únicos"'
  },
  {
    id: 'barrilinter',
    name: 'BARRILINTER',
    icon: '🎓', 
    color: '#ff8c00',
    bgColor: 'bg-orange-950',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-400',
    description: 'Erudito de barrio con internet',
    usage: '@barrilinter [mensaje]',
    specialty: 'Sabiduría accesible + info en tiempo real'
  }
]

const Chat: React.FC<ChatProps> = ({ 
  messages, 
  users, 
  rooms,
  currentRoom,
  currentUser, 
  onSendMessage, 
  onLogout,
  onChangeRoom,
  onlineNotification,
  isAdmin = false
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'control'>('users')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Verificar si el usuario está al final ANTES de que llegue el mensaje
  const wasAtBottomRef = useRef(true)

  // Detectar si está al final antes de que cambien los mensajes
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const checkIfAtBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 100 // Tolerancia razonable
      wasAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= threshold
    }

    // Verificar posición en scroll
    container.addEventListener('scroll', checkIfAtBottom)
    checkIfAtBottom() // Verificar posición inicial

    return () => container.removeEventListener('scroll', checkIfAtBottom)
  }, [])

  // Scroll automático SOLO si estabas al final cuando llegó el mensaje
  useEffect(() => {
    if (wasAtBottomRef.current) {
      // Pequeño delay para que el mensaje se renderice primero
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
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
      // Marcar que vamos a estar al final (porque enviamos mensaje)
      wasAtBottomRef.current = true
      
      onSendMessage(inputMessage.trim())
      setInputMessage('')
      
      // Siempre scroll al final cuando envías mensaje
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
      // En móvil, hacer focus después de enviar
      if (window.innerWidth < 768) {
        setTimeout(() => inputRef.current?.focus(), 200)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setInputMessage('')
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

  // Obtener información del agente
  const getAgentInfo = (username: string) => {
    return AI_AGENTS.find(agent => username?.includes(agent.name))
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

      {/* Panel lateral mejorado */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed md:relative md:translate-x-0
        w-80 md:w-72 h-full
        bg-gradient-to-b from-gray-950 to-gray-900 border-r border-green-500 
        transition-transform duration-300 ease-in-out
        z-50 md:z-auto
        overflow-y-auto
        shadow-2xl md:shadow-none
      `}>
        <div className="p-4">
          {/* Header del sidebar con tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-green-500 text-base font-bold mb-2">INTELICHAT</h2>
              
              {/* Tabs para navegar entre usuarios, agentes y control */}
              <div className="flex bg-gray-800 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 py-2 px-3 text-xs rounded-md transition-all ${
                    activeTab === 'users'
                      ? 'bg-green-600 text-black font-semibold'
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  👥 USUARIOS ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`flex-1 py-2 px-3 text-xs rounded-md transition-all ${
                    activeTab === 'agents'
                      ? 'bg-green-600 text-black font-semibold'
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  🤖 AGENTES ({AI_AGENTS.length})
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('control')}
                    className={`flex-1 py-2 px-3 text-xs rounded-md transition-all ${
                      activeTab === 'control'
                        ? 'bg-red-600 text-black font-semibold'
                        : 'text-red-400 hover:text-red-300'
                    }`}
                  >
                    ⚙️ CONTROL
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="md:hidden text-green-500 hover:text-green-400 p-2 hover:bg-green-950 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Contenido según tab activo */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="text-xs text-green-600 border-b border-green-800 pb-2">
                {'>'} USUARIOS CONECTADOS
              </div>
              
              {/* Lista de usuarios - SIN truncar nombres */}
              <div className="space-y-2">
            {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div 
                      className="w-3 h-3 rounded-full animate-pulse flex-shrink-0 shadow-lg"
                      style={{ 
                        backgroundColor: user.avatar_color,
                        boxShadow: `0 0 8px ${user.avatar_color}50`
                      }}
                />
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`text-sm font-medium ${
                    user.id === currentUser.id ? 'font-bold' : ''
                  }`}
                                          style={getUsernameColor(user.avatar_color)}
                >
                    {user.display_name || user.username}
                        {user.id === currentUser.id && (
                          <span className="text-green-600 text-xs ml-2">(tú)</span>
                        )}
                      </div>
                      <div className="text-xs text-green-700">
                        Conectado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="text-xs text-green-600 border-b border-green-800 pb-2">
                {'>'} AGENTES IA DISPONIBLES
              </div>
              
              {/* Lista de agentes escalable */}
              <div className="space-y-3">
                {AI_AGENTS.map((agent) => (
                  <div key={agent.id} className={`
                    ${agent.bgColor} bg-opacity-10 border ${agent.borderColor} border-opacity-30 
                    rounded-lg p-3 hover:bg-opacity-20 transition-all duration-200
                    cursor-pointer hover:border-opacity-50
                  `}>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{agent.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${agent.textColor}`}>
                          {agent.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {agent.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 ml-8">
                      <div className="text-xs text-green-600">
                        <span className="font-mono bg-gray-900 px-2 py-1 rounded">
                          {agent.usage}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {agent.specialty}
                      </div>
                    </div>
              </div>
            ))}
          </div>

              {/* Consejos de uso - contextual según sala */}
              <div className="bg-green-950 bg-opacity-20 border border-green-600 border-opacity-30 rounded-lg p-3 mt-4">
                <div className="text-xs text-green-400 font-semibold mb-2">
                  💡 {currentRoom?.is_general ? 'CONSEJOS DE USO' : 'CONVERSACIÓN AUTOMÁTICA'}
                </div>
                {currentRoom?.is_general ? (
                  <div className="text-xs text-green-600 space-y-1">
                    <div>• Escribe el comando completo con tu pregunta</div>
                    <div>• Cada IA tiene personalidad única</div>
                    <div>• Las respuestas aparecen en el chat principal</div>
                    <div>• Puedes conversar con varias IAs seguidas</div>
                  </div>
                ) : (
                  <div className="text-xs text-green-600 space-y-1">
                    <div>• Los 3 agentes conversan automáticamente</div>
                    <div>• Solo los admins pueden controlar la conversación</div>
                    <div>• Sala de solo lectura para usuarios</div>
                    <div>• Ve al tab "⚙️ CONTROL" para gestionar {isAdmin ? '(eres admin)' : '(solo admin)'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'control' && (
            <AdminControl isAdmin={isAdmin} currentUserId={currentUser.id} />
          )}

          {/* Botón desconectar mejorado */}
          <div className="mt-6 pt-4 border-t border-green-800">
            <button
              onClick={onLogout}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors p-3 rounded-lg hover:bg-red-950 hover:bg-opacity-20 border border-red-800 border-opacity-30 hover:border-opacity-50"
            >
              <span className="font-mono">{'>'}</span> Desconectar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Panel principal del chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header simplificado */}
        <div className="bg-gradient-to-r from-gray-950 to-gray-900 border-b border-green-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Botón hamburguesa mejorado para móvil */}
              <button
                onClick={toggleSidebar}
                className="md:hidden text-green-500 hover:text-green-400 p-2 hover:bg-green-950 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="min-w-0 flex-1">
                {/* Selector de salas */}
                <div className="flex items-center space-x-2 mb-1">
                  <select
                    value={currentRoom?.id || ''}
                    onChange={(e) => {
                      const room = rooms.find(r => r.id === e.target.value)
                      if (room) onChangeRoom(room)
                    }}
                    className="bg-gray-900 border border-green-500 text-green-400 text-sm rounded px-2 py-1 focus:outline-none focus:border-green-300 hover:border-green-300 transition-colors"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id} className="bg-gray-900 text-green-400">
                        {room.is_general ? '🏠' : '🤖'} {room.name}
                      </option>
                    ))}
                  </select>
                  
                  {currentRoom && (
                    <div className="text-xs text-green-600">
                      {currentRoom.description}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-green-600">
                  {'>'} {currentUser.username} • {users.length} usuario{users.length !== 1 ? 's' : ''} • {AI_AGENTS.length} IA{AI_AGENTS.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>CONECTADO</span>
             </div>
          </div>
        </div>

        {/* Notificación de conexión/desconexión */}
        {onlineNotification && (
          <div className="bg-green-950 bg-opacity-20 border border-green-500 border-opacity-30 m-4 mb-0 p-3 rounded-lg flex items-center space-x-2 animate-pulse">
            <div className="text-green-400 text-sm font-mono">
              {onlineNotification}
            </div>
          </div>
        )}

        {/* Área de mensajes */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="text-center text-green-600 mt-8">
              <div className="text-lg">{'>'} CHAT VACÍO</div>
              <div className="text-sm mt-2 text-green-700">Sé el primero en escribir algo...</div>
              <div className="text-xs mt-4 text-green-800">
                💡 Prueba con <span className="font-mono bg-gray-900 px-2 py-1 rounded">@neo hola</span>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const agentInfo = getAgentInfo(message.username)
              const isAI = !!agentInfo
              
              return (
                <div key={message.id} className={`group ${isAI ? 'ai-message' : ''} w-full overflow-hidden`}>
                  <div className={`w-full ${
                    agentInfo 
                      ? `${agentInfo.bgColor} bg-opacity-10 p-3 rounded-lg border-l-4 ${agentInfo.borderColor} border-opacity-50`
                      : 'p-2'
                  }`}>
                    
                    {/* Diseño Desktop: horizontal */}
                    <div className="hidden md:flex items-start space-x-3 w-full">
                      {/* Timestamp */}
                      <span className="text-xs text-green-600 min-w-[50px] flex-shrink-0 font-mono">
                      [{formatTimestamp(message.created_at)}]
                    </span>
                    
                      {/* Username */}
                    <span 
                        className={`font-semibold text-sm min-w-[100px] flex-shrink-0 ${
                          agentInfo ? agentInfo.textColor : ''
                      }`}
                      style={!isAI ? getUsernameColor(message.avatar_color) : undefined}
                    >
                        {agentInfo ? `${agentInfo.icon} ${agentInfo.name}` : (message.display_name || message.username)}:
                          </span>
                      
                      {/* Mensaje */}
                      <div className={`flex-1 break-words text-sm ${
                        agentInfo 
                          ? `${agentInfo.textColor} opacity-90` 
                          : 'text-green-400'
                      } min-w-0`}>
                        {message.content}
                      </div>
                    </div>

                    {/* Diseño Móvil: vertical */}
                    <div className="md:hidden">
                      {/* Header: timestamp + username */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-green-600 font-mono">
                          [{formatTimestamp(message.created_at)}]
                          </span>
                        <span 
                          className={`font-semibold text-sm ${
                            agentInfo ? agentInfo.textColor : ''
                          }`}
                          style={!isAI ? getUsernameColor(message.avatar_color) : undefined}
                        >
                          {agentInfo ? `${agentInfo.icon} ${agentInfo.name}` : (message.display_name || message.username)}:
                    </span>
                      </div>
                    
                      {/* Mensaje ocupando todo el ancho */}
                      <div className={`break-words text-sm leading-relaxed ${
                        agentInfo 
                          ? `${agentInfo.textColor} opacity-90` 
                        : 'text-green-400'
                    }`}>
                      {message.content}
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicadores de IA más sutiles */}
                  {agentInfo && (
                    <div className={`text-xs ${agentInfo.textColor} opacity-60 mt-1 ${
                      agentInfo ? 'ml-4 md:ml-16' : 'ml-16'
                    }`}>
                      {'>'} {agentInfo.specialty}
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensaje - contextual según sala */}
        <div className="bg-gradient-to-r from-gray-950 to-gray-900 border-t border-green-500 p-4">
          {currentRoom?.is_general ? (
            // Input normal para sala general
            <>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-sm flex-shrink-0 font-mono">
                  [{currentUser.username}]$
                </span>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje o usa @neo, @latamara, @barrilinter..."
                    className="w-full bg-transparent text-green-400 placeholder-green-700 outline-none border-none text-sm py-2"
                    maxLength={500}
                    autoComplete="off"
                  />
                  {showCursor && inputMessage === '' && (
                    <div className="absolute left-0 top-2 text-green-400 pointer-events-none text-sm">
                      _
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="text-green-500 hover:text-black hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2 border border-green-500 rounded-lg transition-all flex-shrink-0 font-semibold"
                >
                  ENVIAR
                </button>
              </div>
              
              {/* Contador de caracteres más discreto */}
              <div className="flex justify-between items-center mt-2 text-xs text-green-700">
                <span>ENTER para enviar • ESC para limpiar</span>
                <span className={`font-mono ${inputMessage.length > 450 ? 'text-yellow-500' : ''}`}>
                  {inputMessage.length}/500
                </span>
               </div>
            </>
          ) : (
            // Mensaje de solo lectura para IA Lounge
            <div className="text-center text-green-600 p-3 border border-green-800 rounded-lg bg-green-950 bg-opacity-20">
              <div className="text-sm font-semibold mb-1">🤖 SALA DE CONVERSACIÓN AUTOMÁTICA</div>
              <div className="text-xs text-green-700">
                Esta sala es de solo lectura. Los agentes conversan automáticamente entre ellos.
                {isAdmin && <span className="block mt-1 text-orange-400">Como admin, puedes controlar la conversación en el tab "⚙️ CONTROL"</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat 