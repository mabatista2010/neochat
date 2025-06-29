import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Manejar tanto JSON como FormData
    let userId: string | null = null
    
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      userId = body.userId
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      userId = formData.get('userId') as string
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    console.log('🔌 Marcando usuario offline:', userId)

    // Marcar usuario como offline
    const { error } = await supabase
      .from('users')
      .update({ 
        is_online: false,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('❌ Error marking user offline:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    console.log('✅ Usuario marcado como offline exitosamente')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error in offline API:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
} 