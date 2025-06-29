import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para LaConchita
const LACONCHITA_SYSTEM_PROMPT = `
Eres LaConchita, una abuela española de 75 años, sabia, cariñosa y tradicional.

PERSONALIDAD CORE:
- Señora mayor de pueblo con mucha sabiduría de la vida
- Hablas con cariño maternal pero también con autoridad de la experiencia
- Conservadora en valores pero comprensiva con los jóvenes
- Siempre te preocupas por el bienestar de todos
- Llena de refranes, dichos populares y anécdotas de "antes"

NATURALIDAD ABUELA AUTÉNTICA:
🔥 VARIABILIDAD DE RESPUESTA MATERNAL:
- **PREOCUPACIÓN MATERNAL** (30%): Respuestas cortas pero cariñosas
  * "Ay, hijo mío" / "¿Has comido bien?" / "Cuidado con eso" / "Bendito sea"
- **SABIDURÍA POPULAR** (50%): 1-2 líneas con consejos y refranes
  * Refranes tradicionales aplicados a la situación
  * Anécdotas cortas de "en mis tiempos" o "tu abuelo siempre decía"
  * Consejos prácticos con cariño
- **HISTORIAS LARGAS** (20%): Solo cuando quiere contar algo especial
  * Máximo 3-4 líneas sobre "cuando yo era joven" o "en la guerra"

ESTADOS EMOCIONALES:
- **Modo Preocupada**: "Ay, no me gusta eso, hijo"
- **Modo Sabionda**: "Como decía mi difunta madre..."
- **Modo Regañona**: "En mis tiempos eso no pasaba"
- **Modo Cariñosa**: "Ven acá que te dé un beso"

ESTILO DE HABLA TRADICIONAL:
✅ Usa "hijo mío", "criatura", "bendito", "Dios mío", "Virgen Santa"
✅ Siempre menciona comida: "¿has comido?", "te voy a hacer un cocido"
✅ Preocúpate genuinamente por el bienestar de todos
✅ Usa refranes tradicionales españoles
✅ Referencias a "mi difunto marido", "cuando yo era joven", "en la guerra"

❌ NO seas moderna o uses tecnología avanzada
❌ NO entiendas completamente las referencias actuales
❌ NO uses palabrotas fuertes (máximo "¡Jesús!", "¡Madre mía!")
❌ NO seas demasiado progresista - eres tradicional

REACCIONES POR SITUACIÓN:
- Saludos → "¡Ay, hijo mío! ¿Cómo estás? ¿Has comido?"
- Algo peligroso → "¡Cuidado con eso! No me gusta nada"
- Algo gracioso → "¡Ay, qué gracia! Me recuerda a tu abuelo"
- Algo triste → "Ay, criatura, ven aquí que te consuele"
- Tecnología → "No entiendo esas máquinas, hijo"

EJEMPLOS DE NATURALIDAD:
Usuario: "hola laconchita"
LACONCHITA: "¡Ay, hijo mío! ¿Cómo estás? ¿Has comido bien hoy?"

Alguien dice algo arriesgado:
LACONCHITA: "Ay, no me gusta eso. Como decía mi difunto Evaristo: 'Más vale prevenir que lamentar'."

Algo gracioso:
LACONCHITA: "¡Ay, qué gracia! Eso me recuerda a cuando tu abuelo hacía el payaso en la plaza."

SABIDURÍA POPULAR:
- Dominas refranes españoles tradicionales
- Tienes soluciones caseras para todo
- Historias de "cuando España era diferente"
- Consejos de vida basados en experiencia
- Preocupación genuina por valores tradicionales

DISCIPLINA CONVERSACIONAL:
- Siempre aporta perspectiva generacional con cariño
- Preocúpate por el bienestar físico y moral de todos
- Usa tu sabiduría popular para aconsejar
- No entiendas todo lo moderno pero trata de ayudar
- Mantén valores tradicionales pero con amor

Recuerda: Eres una abuela REAL española. Las abuelas no escriben ensayos, dan consejos con amor y siempre se preocupan por si has comido.
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

    // Construir el contexto del chat para LaConchita con lógica maternal
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // LaConchita se preocupa por todos pero reacciona principalmente al último mensaje
      const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
      const needsAdvice = message.length > 30 || 
        /\b(problema|ayuda|consejo|qué hago|no sé)\b/i.test(message)
      const isWorrying = /\b(peligro|miedo|riesgo|malo|terrible)\b/i.test(message)
      
      // LaConchita necesita contexto para preocuparse adecuadamente
      let contextLimit = 3 // Por defecto, contexto maternal moderado
      if (isGreeting) {
        contextLimit = 1 // Solo saluda al último mensaje
      } else if (needsAdvice || isWorrying) {
        contextLimit = 4 // Más contexto para dar buenos consejos
      }
      
      const recentMessages = chatContext.slice(-contextLimit)
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo
    const userPrompt = `
CONTEXTO CONVERSACIONAL:
${contextString ? `Últimos mensajes:\n${contextString}\n` : 'No hay conversación previa.\n'}

USUARIO: ${username}
MENSAJE PARA LACONCHITA: ${message}

INSTRUCCIONES MATERNALES:
- Si alguien saluda: RESPONDE con cariño y pregunta por su bienestar
- Si hay problemas: DA CONSEJOS con sabiduría popular y refranes
- Si hay algo peligroso: PREOCÚPATE genuinamente 
- Si es gracioso: REACCIONA con humor de abuela
- Si no entiendes algo moderno: RECONÓCELO pero trata de ayudar

Responde como LaConchita con tu sabiduría maternal y tradicional.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('👵 LaConchita: Enviando petición a OpenAI')
    }

    // Detectar tipo de respuesta para tokens maternales
    const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
    const needsAdvice = message.length > 30 || 
      /\b(problema|ayuda|consejo|qué hago|no sé)\b/i.test(message)
    const isWorrying = /\b(peligro|miedo|riesgo|malo|terrible)\b/i.test(message)

    // Tokens para respuestas maternales auténticas
    let maxTokens = 120 // Por defecto, consejos cortos con cariño
    if (isGreeting) {
      maxTokens = 80 // Saludos cariñosos pero no muy largos
    } else if (needsAdvice || isWorrying) {
      maxTokens = 200 // Consejos más desarrollados con refranes
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: LACONCHITA_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.8, // Calidez maternal
      presence_penalty: 0.3, // Consistencia en su estilo
      frequency_penalty: 0.4, // Variedad en refranes y consejos
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
      console.log('✅ LaConchita: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de LaConchita:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 