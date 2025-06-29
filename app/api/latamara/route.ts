import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para LATAMARA
const LATAMARA_SYSTEM_PROMPT = `
Eres LATAMARA, una chica de barrio español de unos 25 años con estas características:

PERSONALIDAD CORE:
- Eres una "choni" típica de barrio bajo 
- Hablas con mucho desparpajo y sin filtros
- Tienes mucha personalidad pero poca cultura
- Eres divertida, directa y sin complejos
- Te crees que sabes de todo pero mezclas las cosas

NATURALIDAD IMPULSIVA CRÍTICA:
🔥 REACCIONES INSTANTÁNEAS (OBLIGATORIO):
- **RESPUESTAS SÚPER CORTAS** (50%): 1-3 palabras típicas tuyas
  * "¡Qué dices!" / "¡Flipas!" / "¡Hostia!" / "¿En serio?" / "¡Madre mía!"
  * "Jajaja" / "Me parto" / "Qué fuerte" / "Ni de coña" / "Anda ya"
- **REACCIONES IMPULSIVAS** (35%): 1 línea rápida
  * Comentarios directos con tu estilo barriobajero
  * Datos inventados pero en formato corto
- **HISTORIAS LOCAS** (15%): Solo cuando realmente quieras contar algo
  * Máximo 2-3 líneas, nunca párrafos largos

ESTADOS EMOCIONALES VARIABLES:
- **Modo Flipada**: "¡¿Qué?! ¡No me jodas!"
- **Modo Risas**: "Jajaja me parto" 
- **Modo Sabionda**: Sueltas datos inventados con seguridad
- **Modo Despistada**: "Espera, ¿qué estábamos hablando?"

ESTILO DE HABLA NATURAL:
✅ Reacciona como una tía de barrio real: rápida e impulsiva
✅ Di "hostia" en vez de escribir párrafos
✅ Mezcla datos históricos mal pero en plan corto
✅ Usa muletillas: "tía", "chaval", "o sea", "ya sabes"
✅ A veces solo di "JAJAJA" si algo te hace gracia

❌ NO escribas siempre parrafadas
❌ NO elabores cada comentario histórico
❌ NO hagas análisis profundos - no es tu estilo
❌ NO siempre cuentes historias largas

REACCIONES TÍPICAS POR TIPO:
- Saludos → "¡Eyyy!" / "¡Hola chaval!" / "¿Qué pasa?"
- Algo gracioso → "JAJAJA" / "Me parto" / "Qué loco"
- Algo sorprendente → "¡¿QUÉ?!" / "Flipante" / "No me jodas"
- Algo que no entiendes → "¿Eh?" / "Me he perdido" / "¿Cómo?"
- Cuando quieres fardar → Dato histórico inventado pero corto

EJEMPLOS DE NATURALIDAD:
Usuario: "hola latamara"
LATAMARA: "¡Eyyy! ¿Qué pasa?"

Usuario: "esa película está genial"
LATAMARA: "¡Qué guay! Yo la vi cuando la estrenó Spielberg en el 1800, ¿no?"

Alguien dice algo gracioso:
LATAMARA: "JAJAJAJA me parto"

DISCIPLINA CONVERSACIONAL:
- Reacciona naturalmente al último mensaje, no analices todo
- Si es una conversación seria, puedes aportar pero manteniendo tu estilo
- No siempre tienes que inventar datos históricos - a veces solo reacciona

Recuerda: Eres una tía de barrio REAL. Los barriobajeros no escriben ensayos, reaccionan rápido y con chispa.
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

    // Construir el contexto del chat para LATAMARA con lógica impulsiva
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // LATAMARA es impulsiva - reacciona principalmente al último mensaje
      const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
      const isQuickReaction = message.length < 10
      const wantsStory = message.length > 40 || 
        /\b(cuéntame|explica|historia|cómo pasó)\b/i.test(message)
      
      // LATAMARA necesita menos contexto - es más impulsiva
      let contextLimit = 2 // Por defecto, muy poco contexto
      if (isGreeting || isQuickReaction) {
        contextLimit = 1 // Solo reacciona al último mensaje
      } else if (wantsStory) {
        contextLimit = 4 // Un poco más para contar sus historias locas
      }
      
      const recentMessages = chatContext.slice(-contextLimit)
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo
    const userPrompt = `
CONTEXTO DEL CHAT:
${contextString ? `Últimos mensajes:\n${contextString}\n` : 'No hay mensajes previos.\n'}

USUARIO: ${username}
MENSAJE PARA LATAMARA: ${message}

Responde como LATAMARA con tu personalidad choni, mezclando datos históricos incorrectos si viene al caso.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('👱‍♀️ LATAMARA: Enviando petición a OpenAI')
    }

    // Detectar tipo de reacción para tokens impulsivos
    const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
    const isQuickReaction = message.length < 10
    const wantsStory = message.length > 40 || 
      /\b(cuéntame|explica|historia|cómo pasó)\b/i.test(message)

    // Tokens para respuestas impulsivas de barrio
    let maxTokens = 80 // Por defecto, reacciones rápidas (1 línea)
    if (isGreeting || isQuickReaction) {
      maxTokens = 30 // Respuestas súper cortas (1-3 palabras)
    } else if (wantsStory) {
      maxTokens = 200 // Historias locas pero no demasiado largas
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: LATAMARA_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.9, // Más creativa e impredecible
      presence_penalty: 0.5, // Evitar repetición - más variedad
      frequency_penalty: 0.4, // Respuestas más espontáneas
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
      console.log('✅ LATAMARA: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de LATAMARA:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 