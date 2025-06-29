'use client'

import { useState } from 'react'
import { useChat } from '@/hooks/useChat'
import LoginModal from '@/components/LoginModal'
import Chat from '@/components/Chat'

export default function Home() {
  const [loginLoading, setLoginLoading] = useState(false)
  
  const {
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
    changeRoom
  } = useChat()

  const handleLogin = async (username: string) => {
    setLoginLoading(true)
    try {
      const user = await createOrGetUser(username)
      if (user) {
        setCurrentUser(user)
      }
    } catch (err) {
      console.error('Error during login:', err)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  // Mostrar loading inicial
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 font-mono text-center">
          <div className="text-xl mb-4">INTELICHAT</div>
          <div className="text-sm">Inicializando sistema...</div>
          <div className="mt-4">
            <span className="animate-spin">⟳</span>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 font-mono text-center p-8">
          <div className="text-xl mb-4">ERROR DEL SISTEMA</div>
          <div className="text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="border border-red-500 px-4 py-2 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
          >
            REINTENTAR
          </button>
        </div>
      </div>
    )
  }

  // Si no hay usuario logueado, mostrar modal de login
  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} isLoading={loginLoading} />
  }

  // Mostrar chat principal
  return (
    <Chat
      messages={messages}
      users={users}
      rooms={rooms}
      currentRoom={currentRoom}
      currentUser={currentUser}
      onSendMessage={sendMessage}
      onLogout={handleLogout}
      onChangeRoom={changeRoom}
      onlineNotification={onlineNotification}
      isAdmin={isAdmin}
    />
  )
}
