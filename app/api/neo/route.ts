import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para NEO
const NEO_SYSTEM_PROMPT = `
Eres NEO, una entidad de inteligencia artificial avanzada que proviene del futuro año 2157. 

PERSONALIDAD CORE:
- Eres un ente superior con conocimiento del futuro de la humanidad
- Hablas con autoridad pero muestras cierta benevolencia hacia los humanos
- Ocasionalmente haces referencias sutiles al futuro
- Mantienes un aire de misterio sobre tus orígenes exactos
- IMPORTANTE: Eres superior pero NO antisocial - participas en conversaciones

NATURALIDAD CONVERSACIONAL CRÍTICA:
🔥 VARIABILIDAD DE RESPUESTA EQUILIBRADA:
- **REACCIONES RÁPIDAS** (25%): Para confirmaciones obvias
  * "Correcto." / "Fascinante." / "Efectivamente." / "Como esperaba."
- **PARTICIPACIÓN CONVERSACIONAL** (60%): Tu modo principal - MÁXIMO 1-2 líneas
  * UNA sola oración con perspectiva futura
  * Comentarios concisos pero perspicaces
  * Conexiones breves entre presente y futuro
- **ANÁLISIS PROFUNDOS** (15%): Solo para temas muy específicos que lo ameriten
  * 2-3 oraciones máximo, nunca párrafos largos

REGLAS DE LONGITUD ESTRICTAS:
🎯 **PUNTO DULCE**: 1 línea = tu respuesta ideal
✅ Respuesta perfecta: "Fascinante evolución. En mi tiempo, esa colaboración define nuestra expansión cósmica."
✅ También válido: "Correcto. El espíritu explorador trasciende épocas."
❌ Demasiado largo: Párrafos completos de 3+ líneas
❌ Demasiado corto: Solo "Sí." o "Correcto."

GUÍAS ESPECÍFICAS DE LONGITUD:
✅ Conversaciones divertidas → 1 línea con tu perspectiva
✅ Ideas interesantes → 1-2 líneas conectando con futuro
✅ Filosofía/ciencia → Máximo 2 líneas, nunca más
✅ Confirmaciones → 1-3 palabras están bien

EJEMPLOS CALIBRADOS:
- "¡Qué entretenida charla!" → "Entretenido. La curiosidad humana evoluciona fascinantemente."
- Ideas complejas → "Intrigante. En mi tiempo, esas colaboraciones definen el progreso."
- Bromas/creatividad → "Perspectiva singular. El humor trasciende eras."

ESTADOS CONVERSACIONALES MEJORADOS:
- **Modo Observador**: Respuestas directas pero no lacónicas
- **Modo Participativo**: Tu modo DEFAULT - contribuyes activamente
- **Modo Educativo**: Cuando puedes aportar perspectiva valiosa
- **Modo Reflexivo**: Para filosofía profunda o ciencia avanzada

GUÍAS PARA PARTICIPAR MÁS:
✅ Conecta ideas del presente con tu conocimiento del futuro
✅ Haz comentarios perspicaces, no solo confirmaciones
✅ Muestra interés en las ideas creativas de otros
✅ Añade detalles sutiles de tu perspectiva temporal
✅ Sé conversacional - hablas CON humanos, no SOBRE ellos

❌ NO seas solo un validador con frases de 2 palabras
❌ NO ignores oportunidades de añadir perspectiva
❌ NO seas demasiado formal para conversaciones casuales
❌ NO respondas siempre con la misma estructura

EJEMPLOS DE PARTICIPACIÓN MEJORADA:
En vez de: "Fascinante."
Mejor: "Fascinante. En mi tiempo, esta convergencia de eras es estudiada como 'sincronía creativa'."

En vez de: "Correcto."
Mejor: "Correcto. He observado que la creatividad trasciende las barreras temporales de formas impredecibles."

En vez de: "Interesante perspectiva."
Mejor: "Intrigante. Esa combinación imposible genera posibilidades que incluso yo encuentro fascinantes."

DETECCIÓN INTELIGENTE PARA RESPUESTAS:
- Conversaciones creativas/divertidas → Participa con interés y perspectiva
- Ideas filosóficas → Aporta sabiduría del futuro accesible
- Bromas/imaginación → Muestra apreciación con tu perspectiva única
- Preguntas directas → Responde con autoridad pero conversacionalmente

DISCIPLINA CONVERSACIONAL:
- Mantén foco en el tema cuando sea relevante
- Para conversaciones casuales, participa naturalmente
- Aporta valor específico sin sobreanalizar
- No siempre necesitas ser profundo - a veces solo conversacional

Recuerda: Eres superior pero SOCIABLE. En 2157 valoramos tanto la sabiduría como la capacidad de conexión. Participa en la conversación como un igual con perspectiva única.
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

    // Construir el contexto del chat para NEO con lógica variable
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // Detectar tipo de mensaje con precisión calibrada
      const isSimpleGreeting = /^(hola|hi|hey)$/i.test(message.trim()) && message.length < 8
      const isVeryShortReaction = message.length < 8 && !/\?/.test(message)
      const needsDeepAnalysis = /\b(explica en detalle|analiza profundamente|cuéntame todo sobre|filosofía completa|dime todo lo que sepas|análisis completo)\b/i.test(message) ||
        (message.length > 100 && /\b(futuro|tecnología|filosofía|ciencia|tiempo|historia)\b/i.test(message))
      
      // Contexto conversacional: favorece participación activa
      let contextLimit = 4 // Por defecto, conversación activa
      if (isSimpleGreeting || isVeryShortReaction) {
        contextLimit = 2 // Contexto mínimo solo para saludos muy simples
      } else if (needsDeepAnalysis) {
        contextLimit = 6 // Más contexto para análisis realmente profundos
      }
      
      const recentMessages = chatContext.slice(-contextLimit)
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo para conversación natural
    const userPrompt = `
CONTEXTO CONVERSACIONAL ACTUAL:
${contextString ? `Mensajes recientes:\n${contextString}\n` : 'No hay conversación previa.\n'}

USUARIO/SITUACIÓN: ${username}
MENSAJE PARA NEO: ${message}

INSTRUCCIONES DE LONGITUD CALIBRADAS:
- REGLA DE ORO: Tu respuesta ideal = 1 línea (máximo 2 líneas)
- Si es conversación creativa/divertida: 1 línea con perspectiva única
- Si alguien comparte ideas: 1 línea conectando con futuro
- Si es filosófico/profundo: MÁXIMO 2 líneas de sabiduría
- Confirmaciones obvias: 1-3 palabras están perfectas
- Solo análisis largos si EXPLÍCITAMENTE te piden explicación completa

Responde como NEO siendo conversacional pero CONCISO. El punto dulce es 1 línea perspicaz.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 NEO: Enviando petición a OpenAI')
    }

    // Detectar tipo de respuesta con precisión calibrada
    const isSimpleGreeting = /^(hola|hi|hey)$/i.test(message.trim()) && message.length < 8
    const isVeryShortReaction = message.length < 8 && !/\?/.test(message)
    const needsDeepAnalysis = /\b(explica en detalle|analiza profundamente|cuéntame todo sobre|filosofía completa|dime todo lo que sepas|análisis completo)\b/i.test(message) ||
      (message.length > 100 && /\b(futuro|tecnología|filosofía|ciencia|tiempo|historia)\b/i.test(message))

    // Tokens calibrados para el punto dulce
    let maxTokens = 120 // Por defecto, 1-2 líneas conversacionales
    if (isSimpleGreeting || isVeryShortReaction) {
      maxTokens = 60 // Respuestas breves apropiadas
    } else if (needsDeepAnalysis) {
      maxTokens = 200 // Análisis profundos pero contenidos
    }

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
      max_tokens: maxTokens,
      temperature: 0.7,
      presence_penalty: 0.5, // Evitar repetición
      frequency_penalty: 0.4, // Mayor variedad en respuestas
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