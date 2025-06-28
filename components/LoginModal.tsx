'use client'

import { useState, useEffect } from 'react'

interface LoginModalProps {
  onLogin: (username: string) => void
  isLoading: boolean
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Efecto de cursor parpadeante
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && !isLoading) {
      onLogin(username.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (username.trim() && !isLoading) {
        onLogin(username.trim())
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-green-500 rounded-lg p-6 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl shadow-green-500/20 mx-4">
        {/* Header del modal */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-mono text-green-500 mb-2">
            INTELICHAT v1.0
          </h1>
          <div className="text-green-400 font-mono text-sm md:text-base">
            Sistema de Chat Terminal
          </div>
          <div className="text-green-400 font-mono text-xs md:text-sm mt-2 opacity-70">
            {'>'} Inicializando conexión...
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-green-500 font-mono text-sm md:text-base mb-2">
              $ whoami
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Introduce tu nombre de usuario"
                disabled={isLoading}
                className="w-full bg-transparent border border-green-500 rounded px-3 py-3 md:py-2 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/20 disabled:opacity-50 text-sm md:text-base"
                autoComplete="off"
                maxLength={20}
                autoFocus={false} // Evita problemas en móvil
              />
              {showCursor && username === '' && (
                <div className="absolute left-3 top-3 md:top-2 text-green-400 font-mono pointer-events-none text-sm md:text-base">
                  _
                </div>
              )}
            </div>
            <div className="text-green-600 font-mono text-xs md:text-sm mt-1">
              Máximo 20 caracteres, solo letras y números
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="w-full bg-transparent border border-green-500 text-green-400 font-mono py-3 md:py-2 px-4 rounded hover:bg-green-500 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:shadow-lg focus:shadow-green-500/20 text-sm md:text-base touch-manipulation"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⟳</span>
                Conectando...
              </span>
            ) : (
              '> ENTRAR AL CHAT'
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 md:mt-8 text-center">
          <div className="text-green-600 font-mono text-xs md:text-sm space-y-1">
            <div>{'>'} Presiona ENTER para conectar</div>
            <div>{'>'} Chat público - Sé respetuoso</div>
            <div className="hidden sm:block">{'>'} En desarrollo: IA con @</div>
          </div>
        </div>

        {/* Efecto de matriz de fondo - reducido en móvil */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden rounded-lg">
          <div className="text-green-500 font-mono text-xs leading-none">
            {Array.from({ length: isMobile ? 15 : 20 }, (_, i) => (
              <div 
                key={i} 
                className="animate-pulse" 
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {Math.random().toString(36).substring(7)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal 