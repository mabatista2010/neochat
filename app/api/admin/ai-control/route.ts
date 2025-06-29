import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Verificar si el usuario es administrador
async function isUserAdmin(supabase: any, userId: string): Promise<boolean> {
  try {
    console.log('🔍 Buscando usuario en DB:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('is_admin, username')
      .eq('id', userId)
      .single();
    
    console.log('📊 Resultado consulta usuario:', { data, error });
    
    if (error) {
      console.error('❌ Error consultando usuario:', error);
      return false;
    }
    
    const isAdmin = data?.is_admin === true;
    console.log(`👤 Usuario ${data?.username} es admin:`, isAdmin);
    return isAdmin;
  } catch (err) {
    console.error('❌ Error en isUserAdmin:', err);
    return false;
  }
}

// GET - Obtener estado actual de conversación IA
export async function GET(request: NextRequest) {
  try {
    
    // Obtener estado actual
    const { data: status, error } = await supabase
      .rpc('get_ai_conversation_status');

    if (error) {
      console.error('Error obteniendo estado IA:', error);
      return NextResponse.json(
        { error: 'Error al obtener estado de conversación IA' },
        { status: 500 }
      );
    }

    // Obtener temas disponibles
    const { data: topics, error: topicsError } = await supabase
      .from('ai_conversation_topics')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (topicsError) {
      console.error('Error obteniendo temas:', topicsError);
    }

    return NextResponse.json({
      status: status?.[0] || null,
      topics: topics || []
    });

  } catch (error) {
    console.error('Error en GET ai-control:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Controlar conversación IA (solo admins)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, topic, speed, neo_enabled, latamara_enabled, barrilinter_enabled, laconchita_enabled, marktukemberg_enabled, robertthecoach_enabled } = body;
    
    console.log('🎛️ POST ai-control:', { userId, action, topic, speed });
    
    // Verificar que se envió userId
    if (!userId) {
      console.error('❌ userId no enviado');
      return NextResponse.json(
        { error: 'Usuario requerido' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    console.log('🔍 Verificando permisos admin para userId:', userId);
    const adminCheck = await isUserAdmin(supabase, userId);
    console.log('✅ Admin check result:', adminCheck);
    
    if (!adminCheck) {
      console.error('❌ Usuario no es admin:', userId);
      return NextResponse.json(
        { error: 'Permisos insuficientes - Solo administradores' },
        { status: 403 }
      );
    }

    // Preparar datos de actualización
    let updateData: any = {
      // Temporalmente sin updated_by por foreign key constraint
    };

    switch (action) {
      case 'start':
        updateData.is_active = true;
        if (topic) updateData.current_topic = topic;
        break;
        
      case 'stop':
        updateData.is_active = false;
        break;
        
      case 'pause':
        updateData.is_active = false;
        break;
        
      case 'resume':
        updateData.is_active = true;
        break;
        
      case 'set_topic':
        if (topic) updateData.current_topic = topic;
        break;
        
      case 'set_speed':
        if (speed >= 1 && speed <= 3) {
          updateData.conversation_speed = speed;
        }
        break;
        
      case 'toggle_agents':
        if (neo_enabled !== undefined) updateData.neo_enabled = neo_enabled;
        if (latamara_enabled !== undefined) updateData.latamara_enabled = latamara_enabled;
        if (barrilinter_enabled !== undefined) updateData.barrilinter_enabled = barrilinter_enabled;
        if (laconchita_enabled !== undefined) updateData.laconchita_enabled = laconchita_enabled;
        if (marktukemberg_enabled !== undefined) updateData.marktukemberg_enabled = marktukemberg_enabled;
        if (robertthecoach_enabled !== undefined) updateData.robertthecoach_enabled = robertthecoach_enabled;
        break;
        
      case 'clear_chat':
        // Verificar que tenemos la service role key
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada');
          return NextResponse.json(
            { error: 'Configuración del servidor incompleta' },
            { status: 500 }
          );
        }

        // Limpiar mensajes de IA Lounge usando service role para bypassear RLS
        const { createClient } = await import('@supabase/supabase-js');
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasea RLS
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        console.log('🗑️ Intentando limpiar mensajes de IA Lounge...');
        
        // Primero contar cuántos mensajes hay
        const { count: messageCount } = await serviceSupabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', 'c31be55a-ba56-4737-b5fe-8c559ad0f4fd');
        
        console.log(`📊 Mensajes encontrados para borrar: ${messageCount || 0}`);
        
        // Realizar el DELETE
        const { error: clearError, count } = await serviceSupabase
          .from('messages')
          .delete({ count: 'exact' })
          .eq('room_id', 'c31be55a-ba56-4737-b5fe-8c559ad0f4fd');
        
        if (clearError) {
          console.error('❌ Error limpiando chat:', clearError);
          return NextResponse.json(
            { error: `Error al limpiar chat: ${clearError.message}` },
            { status: 500 }
          );
        }
        
        console.log(`✅ Chat limpiado exitosamente. Mensajes eliminados: ${count || 0}`);
        
        return NextResponse.json({
          success: true,
          action: 'clear_chat',
          message: `Chat de IA Lounge limpiado exitosamente (${count || 0} mensajes eliminados)`
        });
        
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    // Obtener ID de configuración existente
    const { data: configData, error: configError } = await supabase
      .from('ai_conversation_control')
      .select('id')
      .limit(1)
      .single();

    if (configError || !configData) {
      console.error('Error obteniendo configuración:', configError);
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 500 }
      );
    }

    // Actualizar configuración
    console.log('🔄 Intentando actualizar configuración:', { configId: configData.id, updateData });
    
    const { data, error } = await supabase
      .from('ai_conversation_control')
      .update(updateData)
      .eq('id', configData.id)
      .select()
      .single();

    console.log('📊 Resultado de actualización:', { data, error });

    if (error) {
      console.error('❌ Error actualizando control IA:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Error al actualizar configuración: ${error.message}` },
        { status: 500 }
      );
    }

    // Log de la acción (opcional)
    if (action === 'start') {
      await supabase
        .from('ai_conversation_log')
        .insert({
          session_start: new Date().toISOString(),
          topic_used: updateData.current_topic || 'No especificado',
          participants: [
            ...(updateData.neo_enabled !== false ? ['NEO'] : []),
            ...(updateData.latamara_enabled !== false ? ['LATAMARA'] : []),
            ...(updateData.barrilinter_enabled !== false ? ['BARRILINTER'] : []),
            ...(updateData.laconchita_enabled !== false ? ['LACONCHITA'] : []),
            ...(updateData.marktukemberg_enabled !== false ? ['MARKTUKEMBERG'] : []),
            ...(updateData.robertthecoach_enabled !== false ? ['ROBERTTHECOACH'] : [])
          ],
          started_by: userId
        });
    }

    return NextResponse.json({
      success: true,
      action,
      data
    });

  } catch (error) {
    console.error('Error en POST ai-control:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Crear tema personalizado (solo admins)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, initial_prompt, leader_agent } = body;
    
    // Verificar que se envió userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario requerido' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    const adminCheck = await isUserAdmin(supabase, userId);
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Permisos insuficientes - Solo administradores' },
        { status: 403 }
      );
    }

    if (!title || !initial_prompt) {
      return NextResponse.json(
        { error: 'Título y prompt inicial son requeridos' },
        { status: 400 }
      );
    }

    // Crear nuevo tema
    const { data, error } = await supabase
      .from('ai_conversation_topics')
      .insert({
        title,
        description,
        initial_prompt,
        category: 'personalizado',
        leader_agent: leader_agent || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando tema:', error);
      return NextResponse.json(
        { error: 'Error al crear tema personalizado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      topic: data
    });

  } catch (error) {
    console.error('Error en PUT ai-control:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 