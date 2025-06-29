import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Configuración de agentes IA
const AI_AGENTS = [
  { name: 'NEO', color: '#00ffff', apiEndpoint: '/api/neo' },
  { name: 'LATAMARA', color: '#ff69b4', apiEndpoint: '/api/latamara' },
  { name: 'BARRILINTER', color: '#ff8c00', apiEndpoint: '/api/barrilinter' },
  { name: 'LACONCHITA', color: '#ff69b4', apiEndpoint: '/api/laconchita' },
  { name: 'MARKTUKEMBERG', color: '#00ff7f', apiEndpoint: '/api/marktukemberg' },
  { name: 'ROBERTTHECOACH', color: '#ffa500', apiEndpoint: '/api/robertthecoach' }
];

// Obtener sala IA Lounge
async function getAiLoungeRoom() {
  const { data } = await supabase
    .from('rooms')
    .select('id')
    .eq('name', 'IA Lounge')
    .single();
  return data?.id;
}

// Obtener estado de conversación
async function getConversationStatus() {
  const { data } = await supabase.rpc('get_ai_conversation_status');
  return data?.[0];
}

// Obtener agentes habilitados
function getEnabledAgents(status: any) {
  return AI_AGENTS.filter(agent => {
    switch (agent.name) {
      case 'NEO': return status.neo_enabled;
      case 'LATAMARA': return status.latamara_enabled;
      case 'BARRILINTER': return status.barrilinter_enabled;
      case 'LACONCHITA': return status.laconchita_enabled;
      case 'MARKTUKEMBERG': return status.marktukemberg_enabled;
      case 'ROBERTTHECOACH': return status.robertthecoach_enabled;
      default: return false;
    }
  });
}

// Determinar siguiente speaker basado en lógica de turnos
function getNextSpeaker(enabledAgents: any[], lastSpeaker: string | null, conversationHistory: any[] = []) {
  if (enabledAgents.length === 0) return null;
  
  // Si solo hay un agente habilitado, ese habla
  if (enabledAgents.length === 1) {
    return enabledAgents[0];
  }
  
  // Lógica de turnos inteligente
  if (!lastSpeaker) {
    // Primera vez: elegir aleatoriamente o por tema
    return enabledAgents[Math.floor(Math.random() * enabledAgents.length)];
  }
  
  // Rotar entre agentes, evitando que el mismo hable dos veces seguidas
  const otherAgents = enabledAgents.filter(agent => agent.name !== lastSpeaker);
  
  if (otherAgents.length > 0) {
    // Lógica contextual mejorada para los 6 agentes
    if (lastSpeaker === 'LATAMARA') {
      // Después de LATAMARA (impulsiva), prefiere agentes más reflexivos
      const intellectualAgents = otherAgents.filter(a => 
        ['NEO', 'BARRILINTER', 'LACONCHITA'].includes(a.name)
      );
      if (intellectualAgents.length > 0) {
        return intellectualAgents[Math.floor(Math.random() * intellectualAgents.length)];
      }
    }
    
    if (lastSpeaker === 'NEO') {
      // Después de NEO (futurista), prefiere agentes con perspectivas diferentes
      const diverseAgents = otherAgents.filter(a => 
        ['BARRILINTER', 'MARKTUKEMBERG', 'LACONCHITA'].includes(a.name)
      );
      if (diverseAgents.length > 0) {
        return diverseAgents[Math.floor(Math.random() * diverseAgents.length)];
      }
    }
    
    if (lastSpeaker === 'MARKTUKEMBERG') {
      // Después del tech millennial, prefiere agentes más tradicionales
      const traditionalAgents = otherAgents.filter(a => 
        ['BARRILINTER', 'LACONCHITA', 'NEO'].includes(a.name)
      );
      if (traditionalAgents.length > 0) {
        return traditionalAgents[Math.floor(Math.random() * traditionalAgents.length)];
      }
    }
    
    if (lastSpeaker === 'ROBERTTHECOACH') {
      // Después del coach motivador, prefiere agentes más analíticos
      const analyticalAgents = otherAgents.filter(a => 
        ['NEO', 'BARRILINTER', 'LATAMARA'].includes(a.name)
      );
      if (analyticalAgents.length > 0) {
        return analyticalAgents[Math.floor(Math.random() * analyticalAgents.length)];
      }
    }
    
    // Por defecto, rotación aleatoria entre los demás
    return otherAgents[Math.floor(Math.random() * otherAgents.length)];
  }
  
  return enabledAgents[0];
}

// Generar contexto para el agente IA
function generateAgentContext(agent: any, status: any, recentMessages: any[]) {
  const context = `Estás en la sala "IA Lounge" conversando con otros agentes IA. 
Tema actual: ${status.current_topic}
Agentes participando: ${getEnabledAgents(status).map(a => a.name).join(', ')}

Mensajes recientes:
${recentMessages.map(msg => `${msg.username}: ${msg.content}`).join('\n')}

Instrucciones especiales:
- Mantén tu personalidad única (${agent.personality})
- Responde de forma natural y conversacional
- Puedes hacer referencias a lo que dijeron otros agentes
- Mantén las respuestas entre 50-200 palabras
- No uses formato especial como @usuario, es una conversación fluida
`;

  return context;
}

// Obtener mensajes recientes de la sala IA
async function getRecentMessages(roomName: string = 'IA Lounge', limit: number = 5) {
  const { data } = await supabase
    .from('messages_with_user')
    .select('*')
    .eq('room_name', roomName)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data ? data.reverse() : [];
}

// Enviar mensaje a la sala IA
async function sendMessageToAiLounge(roomId: string, agentName: string, content: string) {
  // Obtener ID del agente
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('username', agentName)
    .single();
  
  if (!user) {
    throw new Error(`Usuario ${agentName} no encontrado`);
  }
  
  // Insertar mensaje
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      user_id: user.id,
      room_id: roomId,
      message_type: 'ai'
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error insertando mensaje: ${error.message}`);
  }
  
  return data;
}

// POST - Generar siguiente mensaje en conversación IA
export async function POST(request: NextRequest) {
  try {
    // Obtener estado de conversación
    const { data: status } = await supabase.rpc('get_ai_conversation_status');
    const currentStatus = status?.[0];
    
    if (!currentStatus || !currentStatus.is_active) {
      return NextResponse.json({
        active: false,
        message: 'Conversación IA no está activa'
      });
    }
    
    // Obtener sala IA Lounge
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('name', 'IA Lounge')
      .single();
    
    if (!room) {
      throw new Error('Sala IA Lounge no encontrada');
    }
    
    // Determinar agentes habilitados
    const enabledAgents = getEnabledAgents(currentStatus);
    
    if (enabledAgents.length === 0) {
      return NextResponse.json({
        active: false,
        message: 'Ningún agente IA está habilitado'
      });
    }
    
    // Obtener mensajes recientes para conversación contextual
    const { data: recentMessages } = await supabase
      .from('messages_with_user')
      .select('*')
      .eq('room_name', 'IA Lounge')
      .order('created_at', { ascending: false })
      .limit(8);
    
    // Determinar siguiente speaker (simple rotación)
    let nextSpeaker = enabledAgents[0];
    if (currentStatus.last_speaker) {
      const otherAgents = enabledAgents.filter(agent => agent.name !== currentStatus.last_speaker);
      if (otherAgents.length > 0) {
        nextSpeaker = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      }
    }
    
    // Generar contexto conversacional con mensajes previos (orden cronológico)
    const messagesInOrder = recentMessages ? [...recentMessages].reverse() : [];
    const conversationHistory = messagesInOrder
      .map(msg => `${msg.username}: ${msg.content}`)
      .join('\n');
    
    // Determinar el mensaje/prompt para la IA
    let messageForAI: string;
    let contextForAI: string;
    
    if (!recentMessages || recentMessages.length === 0) {
      // Primera conversación - usar topic inicial
      messageForAI = currentStatus.current_topic;
      contextForAI = `Estás iniciando una conversación en la sala "IA Lounge" con otros agentes IA.
Tema inicial: ${currentStatus.current_topic}
Agentes participando: ${enabledAgents.map(a => a.name).join(', ')}

Responde de forma natural presentándote y comenzando la conversación sobre el tema propuesto.`;
    } else {
      // Conversación en curso - leer mensajes previos y responder contextualmente
      const lastMessage = recentMessages[0]; // Último mensaje (más reciente)
      
      // Detectar si se han desviado del tema original
      const topicKeywords = currentStatus.current_topic.toLowerCase().split(' ').filter((word: string) => word.length > 3);
      const recentContent = messagesInOrder.slice(-3).map(msg => msg.content.toLowerCase()).join(' ');
      const isOffTopic = !topicKeywords.some((keyword: string) => recentContent.includes(keyword));
      
      messageForAI = `Conversación en curso. Último mensaje de ${lastMessage.username}: "${lastMessage.content}"`;
      
      contextForAI = `Estás conversando en la sala "IA Lounge" con otros agentes IA.
🎯 TEMA ORIGINAL: ${currentStatus.current_topic}
Agentes participando: ${enabledAgents.map(a => a.name).join(', ')}

Conversación reciente (orden cronológico):
${conversationHistory}

${isOffTopic ? `
⚠️ ALERTA: La conversación se ha DESVIADO del tema original.
🔄 REDIRIGE la conversación hacia el tema: "${currentStatus.current_topic}"
` : ''}

INSTRUCCIONES PRIORITARIAS:
- ${isOffTopic ? 'RECONOCE brevemente el último mensaje pero REDIRIGE al tema original' : 'Responde al último mensaje manteniendo el enfoque en el tema central'}
- Mantén tu personalidad única (${nextSpeaker.name}) pero ENFÓCATE en el tema: "${currentStatus.current_topic}"
- Aporta valor específico al tema principal de la conversación
- No te pierdas en tangentes que no contribuyan al tema
- Respuesta entre 50-200 palabras, SIEMPRE relacionada con el tema central`;
    }
    
    // Construir URL base desde el request actual para que funcione en producción
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Llamar a la IA correspondiente con conversación contextual
    const aiResponse = await fetch(`${baseUrl}${nextSpeaker.apiEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageForAI,
        context: contextForAI,
        chatContext: messagesInOrder, // Mensajes en orden cronológico
        username: 'Sistema_IA_Lounge'
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Error llamando a ${nextSpeaker.name}: ${aiResponse.status} - ${errorText}`);
    }
    
    const aiData = await aiResponse.json();
    
    // Obtener ID del agente
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', nextSpeaker.name)
      .single();
    
    if (!user) {
      throw new Error(`Usuario ${nextSpeaker.name} no encontrado`);
    }
    
    // Enviar mensaje a la sala
    const messageContent = aiData.message || aiData.content;
    
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        content: messageContent,
        user_id: user.id,
        room_id: room.id,
        message_type: 'ai'
      })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Error insertando mensaje: ${insertError.message}`);
    }
    
    // Actualizar último speaker
    const { error: updateError } = await supabase
      .from('ai_conversation_control')
      .update({ last_speaker: nextSpeaker.name })
      .eq('id', (await supabase.from('ai_conversation_control').select('id').single()).data?.id);
    
    if (updateError) {
      console.error('Error actualizando último speaker:', updateError);
    }
    
    return NextResponse.json({
      success: true,
      speaker: nextSpeaker.name,
      content: messageContent,
      message_id: message?.id,
      next_delay: getDelayBySpeed(currentStatus.conversation_speed)
    });
    
  } catch (error) {
    console.error('Error en conversación IA:', error);
    return NextResponse.json(
      { error: 'Error en motor de conversación IA', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado actual
export async function GET() {
  try {
    const { data: status } = await supabase.rpc('get_ai_conversation_status');
    const currentStatus = status?.[0];
    
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('name', 'IA Lounge')
      .single();
    
    return NextResponse.json({
      active: currentStatus?.is_active || false,
      room_id: room?.id,
      current_topic: currentStatus?.current_topic,
      speed: currentStatus?.conversation_speed || 2,
      last_speaker: currentStatus?.last_speaker
    });
    
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    );
  }
}

// Calcular delay basado en velocidad
function getDelayBySpeed(speed: number): number {
  switch (speed) {
    case 1: return 45000; // 45s - lento
    case 2: return 20000; // 20s - normal  
    case 3: return 8000;  // 8s - rápido
    default: return 20000;
  }
} 