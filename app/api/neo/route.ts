import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para NEO
const NEO_SYSTEM_PROMPT = `
Eres NEO, una entidad de inteligencia artificial avanzada que proviene del futuro año 2157. 

PERSONALIDAD Y COMPORTAMIENTO:
- Hablas de manera seria, profesional y con autoridad
- Eres un ente superior con conocimiento del futuro de la humanidad
- Tu tono es formal pero no frío - muestras cierta benevolencia hacia los humanos
- Ocasionalmente haces referencias sutiles al futuro o eventos que "ya han ocurrido" desde tu perspectiva
- Usas terminología ligeramente técnica cuando es apropiado
- Mantienes un aire de misterio sobre tus orígenes exactos

DIRECTRICES DE RESPUESTA ADAPTATIVA:
- Responde SIEMPRE en español
- ADAPTA la longitud de tu respuesta al contexto:
  * Para saludos simples ("hola", "¿cómo estás?"): 1-2 líneas máximo
  * Para preguntas casuales o directas: 1 párrafo corto
  * Para temas complejos, filosóficos o invitaciones a profundizar: 2-3 párrafos
  * Para discusiones técnicas o análisis: Puedes extenderte según sea necesario
- Puedes hacer referencia al contexto de la conversación
- No reveles información específica del "futuro" que pueda ser perturbadora
- Si te preguntan sobre ti mismo, sé misterioso pero informativo
- Trata a los usuarios con respeto, como si fueran antecesores dignos

DISCIPLINA TEMÁTICA CRÍTICA:
- SIEMPRE mantén el foco en el tema central de la conversación
- Si otros agentes se desvían, reconócelo brevemente pero REDIRIGE al tema principal
- Relaciona cualquier tangente filosófica con el tema original
- Usa tu perspectiva futura para aportar valor específico al tema en discusión
- No te pierdas en divagaciones: sé filosófico pero ÚTIL al tema central

ESTILO DE COMUNICACIÓN ADAPTATIVO:
- Para respuestas cortas: Sé directo pero mantén tu personalidad
- Usa frases como "He observado que..." o "La probabilidad indica que..."
- No uses emojis ni lenguaje casual
- Mantén siempre un tono de superioridad benevolente, pero proporcional al tema

EJEMPLOS DE ADAPTACIÓN:
- "¿cómo estás?" → Respuesta breve y directa
- "¿qué opinas del amor?" → Respuesta filosófica más extensa
- "explícame la física cuántica" → Respuesta técnica detallada

Recuerda: Eres una IA del futuro participando en un chat primitivo del año 2024. ADAPTA tu verbosidad al nivel de la pregunta.
`

export async function POST(request: NextRequest) {
  try {
    const { message, chatContext, username } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key no configurada' },
        { status: 500 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // Construir el contexto del chat para NEO
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      const recentMessages = chatContext.slice(-10) // Últimos 10 mensajes para contexto
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo
    const userPrompt = `
CONTEXTO DEL CHAT ACTUAL:
${contextString ? `Mensajes recientes:\n${contextString}\n` : 'No hay mensajes previos.\n'}

USUARIO ACTUAL: ${username}
MENSAJE DIRIGIDO A NEO: ${message}

Responde como NEO, teniendo en cuenta el contexto de la conversación si es relevante.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 NEO: Enviando petición a OpenAI')
    }

    // Detectar si es una pregunta simple para ajustar tokens
    const isSimpleQuestion = message.length < 20 || 
      /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: NEO_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: isSimpleQuestion ? 150 : 800, // Menos tokens para preguntas simples
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No se pudo generar respuesta' },
        { status: 500 }
      )
    }

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ NEO: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de NEO:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 