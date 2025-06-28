import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tipos para la base de datos
export interface User {
  id: string
  username: string
  display_name?: string
  avatar_color: string
  created_at: string
  updated_at: string
  last_seen?: string
  is_online: boolean
}

export interface Room {
  id: string
  name: string
  description?: string
  is_general: boolean
  created_at: string
  created_by?: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  room_id: string
  message_type: 'user' | 'ai' | 'system'
  created_at: string
  updated_at: string
  is_edited: boolean
  reply_to?: string
}

export interface MessageWithUser extends Message {
  username: string
  display_name?: string
  avatar_color: string
  room_name: string
} 