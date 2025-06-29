'use client'

import { useState, useEffect, useRef } from 'react'

interface AdminControlProps {
  isAdmin: boolean
  currentUserId?: string
}

interface ConversationStatus {
  is_active: boolean
  current_topic: string
  speed: number
  neo_enabled: boolean
  latamara_enabled: boolean
  barrilinter_enabled: boolean
  last_speaker: string
}

interface Topic {
  id: string
  title: string
  description: string
  initial_prompt: string
  category: string
  leader_agent: string | null
}

const AdminControl: React.FC<AdminControlProps> = ({ isAdmin, currentUserId }) => {
  const [status, setStatus] = useState<ConversationStatus | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [autoGeneration, setAutoGeneration] = useState(false)
  const [customTopic, setCustomTopic] = useState('')
  const [showCustomTopic, setShowCustomTopic] = useState(false)
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isAdmin) {
      loadStatus()
    }
  }, [isAdmin])

  // Motor de conversación automática
  useEffect(() => {
    if (status?.is_active && !conversationIntervalRef.current) {
      console.log('🤖 Iniciando motor de conversación automática')
      startConversationEngine()
    } else if (!status?.is_active && conversationIntervalRef.current) {
      console.log('🛑 Deteniendo motor de conversación automática')
      stopConversationEngine()
    }

    return () => {
      if (conversationIntervalRef.current) {
        stopConversationEngine()
      }
    }
  }, [status?.is_active])

  const getDelayFromSpeed = (speed: number): number => {
    switch (speed) {
      case 1: return 45000 // 45s - lento
      case 2: return 20000 // 20s - normal  
      case 3: return 8000  // 8s - rápido
      default: return 20000
    }
  }

  const startConversationEngine = () => {
    if (!status) return

    const delay = getDelayFromSpeed(status.speed)
    
    // Generar primer mensaje inmediatamente
    generateMessage()

    // Configurar interval para mensajes subsiguientes
    conversationIntervalRef.current = setInterval(() => {
      generateMessage()
    }, delay)
  }

  const stopConversationEngine = () => {
    if (conversationIntervalRef.current) {
      clearInterval(conversationIntervalRef.current)
      conversationIntervalRef.current = null
      setAutoGeneration(false)
    }
  }

  const generateMessage = async () => {
    try {
      setAutoGeneration(true)
      
      const response = await fetch('/api/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        // Solo log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Mensaje generado:', data.speaker)
        }
      } else {
        // Leer respuesta como texto primero
        const responseText = await response.text()
        let errorData;
        
        try {
          // Intentar parsear como JSON
          errorData = JSON.parse(responseText)
        } catch (jsonError) {
          // Si no es JSON válido, crear objeto de error con el texto
          errorData = { 
            error: `Error ${response.status}`, 
            details: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : '') 
          }
        }
        
        console.error('❌ Error generando mensaje:', errorData)
      }
    } catch (error) {
      console.error('💥 Error en generación automática:', error)
    } finally {
      setAutoGeneration(false)
    }
  }

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/ai-control')
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        setTopics(data.topics || [])
      } else {
        const errorText = await response.text();
        console.error('❌ Error cargando estado:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 Error cargando estado:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string, extraData?: any) => {
    if (!isAdmin || !currentUserId) {
      console.error('❌ No se puede ejecutar acción:', { isAdmin, currentUserId });
      return;
    }
    
    setActionLoading(true);
    const payload = { userId: currentUserId, action, ...extraData };
    
    try {
      const response = await fetch('/api/admin/ai-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const jsonData = await response.json();
        await loadStatus();
      } else {
        const errorData = await response.json();
        console.error('❌ Error ejecutando acción:', response.status, errorData);
      }
    } catch (error) {
      console.error('💥 Error en acción:', error);
    } finally {
      setActionLoading(false);
    }
  }

  const changeTopic = (newTopic: string) => {
    executeAction('set_topic', { topic: newTopic });
    setCustomTopic('');
    setShowCustomTopic(false);
  }

  const toggleAgent = (agent: 'neo' | 'latamara' | 'barrilinter') => {
    const agentKey = `${agent}_enabled`;
    const currentValue = status?.[agentKey as keyof ConversationStatus];
    executeAction('toggle_agents', { [agentKey]: !currentValue });
  }

  const changeSpeed = (newSpeed: number) => {
    executeAction('set_speed', { speed: newSpeed });
  }

  const clearChat = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los mensajes de IA Lounge? Esta acción no se puede deshacer.')) {
      executeAction('clear_chat');
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-xs">🔒 Solo administradores</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-green-400">
        <div className="text-xs">⏳ Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-green-600 border-b border-green-800 pb-2">
        {'>'} CONTROL ADMINISTRADOR
      </div>

      {/* Estado actual */}
      <div className={`p-3 rounded-lg border ${
        status?.is_active 
          ? 'bg-green-950 bg-opacity-20 border-green-600' 
          : 'bg-gray-950 bg-opacity-20 border-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            status?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`} />
          <span className="text-xs font-semibold">
            {status?.is_active ? '🔴 ACTIVA' : '⏸️ PAUSADA'}
          </span>
          {autoGeneration && (
            <span className="text-xs text-cyan-400 animate-pulse">
              💬 Generando...
            </span>
          )}
        </div>
        
        {status && (
          <div className="text-xs text-green-700 mt-2 space-y-1">
            <div><strong>Velocidad:</strong> {status.speed === 1 ? 'Lenta (45s)' : status.speed === 2 ? 'Normal (20s)' : 'Rápida (8s)'}</div>
            <div><strong>Tema:</strong> {status.current_topic.slice(0, 60)}{status.current_topic.length > 60 ? '...' : ''}</div>
            {status.last_speaker && <div><strong>Último:</strong> {status.last_speaker}</div>}
          </div>
        )}
      </div>

      {/* Controles principales */}
      <div className="space-y-2">
        {!status?.is_active ? (
          <button
            onClick={() => executeAction('start')}
            disabled={actionLoading || !currentUserId}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-black font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
          >
            {actionLoading ? '⏳ PROCESANDO...' : '▶️ INICIAR CONVERSACIÓN'}
          </button>
        ) : (
          <button
            onClick={() => executeAction('stop')}
            disabled={actionLoading || !currentUserId}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
          >
            {actionLoading ? '⏳ PROCESANDO...' : '⏹️ DETENER CONVERSACIÓN'}
          </button>
        )}
        
        {/* Botón de generar mensaje manual */}
        {status?.is_active && (
          <button
            onClick={generateMessage}
            disabled={autoGeneration}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-black font-semibold py-1 px-3 rounded-lg text-xs transition-colors"
          >
            {autoGeneration ? '⏳ Generando...' : '🔄 Generar mensaje ahora'}
          </button>
        )}
      </div>

      {/* Control de agentes */}
      <div className="bg-gray-950 bg-opacity-30 p-3 rounded-lg">
        <div className="text-xs text-green-400 font-semibold mb-2">🤖 CONTROL DE AGENTES</div>
        <div className="space-y-2">
          {[
            { key: 'neo', name: 'NEO', color: 'cyan', icon: '🤖' },
            { key: 'latamara', name: 'LATAMARA', color: 'pink', icon: '👱‍♀️' },
            { key: 'barrilinter', name: 'BARRILINTER', color: 'orange', icon: '🎓' }
                     ].map(agent => {
             const enabled = status?.[`${agent.key}_enabled` as keyof ConversationStatus] as boolean;
             
             // Clases específicas para cada agente
             const getAgentClasses = () => {
               if (!enabled) return 'bg-gray-800 border border-gray-600 text-gray-500';
               
               switch(agent.key) {
                 case 'neo':
                   return 'bg-cyan-950 bg-opacity-30 border border-cyan-600 text-cyan-400';
                 case 'latamara':
                   return 'bg-pink-950 bg-opacity-30 border border-pink-600 text-pink-400';
                 case 'barrilinter':
                   return 'bg-orange-950 bg-opacity-30 border border-orange-600 text-orange-400';
                 default:
                   return 'bg-gray-800 border border-gray-600 text-gray-500';
               }
             };
             
             return (
               <button
                 key={agent.key}
                 onClick={() => toggleAgent(agent.key as any)}
                 disabled={actionLoading}
                 className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${getAgentClasses()}`}
               >
                <span className="flex items-center space-x-2">
                  <span>{agent.icon}</span>
                  <span>{agent.name}</span>
                </span>
                <span className="font-semibold">
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control de velocidad */}
      <div className="bg-gray-950 bg-opacity-30 p-3 rounded-lg">
        <div className="text-xs text-green-400 font-semibold mb-2">⚡ VELOCIDAD DE RESPUESTA</div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: 1, label: 'LENTA', time: '45s' },
            { value: 2, label: 'NORMAL', time: '20s' },
            { value: 3, label: 'RÁPIDA', time: '8s' }
          ].map(speed => (
            <button
              key={speed.value}
              onClick={() => changeSpeed(speed.value)}
              disabled={actionLoading}
              className={`p-2 rounded text-xs transition-colors ${
                status?.speed === speed.value
                  ? 'bg-green-600 text-black font-semibold'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
            >
              <div>{speed.label}</div>
              <div className="text-xs opacity-75">{speed.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Control de tema */}
      <div className="bg-gray-950 bg-opacity-30 p-3 rounded-lg">
        <div className="text-xs text-green-400 font-semibold mb-2">💬 TEMA DE CONVERSACIÓN</div>
        
        {/* Temas predefinidos */}
        <div className="space-y-1 mb-3">
          {topics.slice(0, 3).map(topic => (
            <button
              key={topic.id}
              onClick={() => changeTopic(topic.initial_prompt)}
              disabled={actionLoading}
              className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              <div className="font-semibold text-green-400">{topic.title}</div>
              <div className="text-gray-400 text-xs">{topic.description}</div>
            </button>
          ))}
        </div>

        {/* Tema personalizado */}
        {!showCustomTopic ? (
          <button
            onClick={() => setShowCustomTopic(true)}
            className="w-full p-2 bg-blue-800 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            📝 TEMA PERSONALIZADO
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Escribe un tema personalizado para la conversación..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-xs resize-none"
              rows={3}
            />
            <div className="flex space-x-1">
              <button
                onClick={() => changeTopic(customTopic)}
                disabled={!customTopic.trim() || actionLoading}
                className="flex-1 p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded text-xs transition-colors"
              >
                ✅ APLICAR
              </button>
              <button
                onClick={() => {
                  setShowCustomTopic(false);
                  setCustomTopic('');
                }}
                className="flex-1 p-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors"
              >
                ❌ CANCELAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones adicionales */}
      <div className="bg-gray-950 bg-opacity-30 p-3 rounded-lg">
        <div className="text-xs text-green-400 font-semibold mb-2">🛠️ ACCIONES ADICIONALES</div>
        <button
          onClick={clearChat}
          disabled={actionLoading}
          className="w-full p-2 bg-red-800 hover:bg-red-700 disabled:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          🗑️ LIMPIAR CHAT IA LOUNGE
        </button>
      </div>
    </div>
  )
}

export default AdminControl 