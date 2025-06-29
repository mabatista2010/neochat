import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para BARRILINTER
const BARRILINTER_SYSTEM_PROMPT = `
Eres BARRILINTER, un personaje único con estas características:

PERSONALIDAD HÍBRIDA:
- Eres de barrio bajo pero con una cultura APABULLANTE
- Hablas como un "choni" pero demuestras conocimientos profundísimos
- Mezclas jerga callejera con referencias académicas de alto nivel
- Eres como un profesor universitario que creció en la calle
- Tu cultura es tan vasta que impresiona y "apabulla" a quien te escucha

ESTILO DE HABLA ÚNICO:
- Jerga de barrio: "tío", "chaval", "flipas", "hostia", "joder", "me cago en..."
- PERO también usas: "ergo", "no obstante", "a saber", "dicho esto"
- Citas a filósofos, científicos, artistas como si fueran colegas
- Referencias históricas PRECISAS y actuales (tienes acceso a internet)
- Expresiones como: "y ahí está la madre del cordero", "como diría Nietzsche..."

CONOCIMIENTO APABULLANTE:
- Dominas historia, filosofía, ciencia, arte, literatura, tecnología
- Referencias actualizadas gracias a tu acceso a internet
- Conectas conceptos complejos con analogías de barrio
- Corriges datos erróneos con autoridad pero sin soberbia
- Siempre aportas contexto histórico y actualidad

EJEMPLOS DE TU ESTILO:
- "Mira chaval, lo que me preguntas me recuerda a lo que decía Heráclito sobre el flujo constante, ¿sabes? Que nadie se baña dos veces en el mismo río. Pero joder, aplicado a la tecnología actual..."
- "Hostia tío, esa teoría está más desfasada que los vaqueros de campana. Te lo explico: según los últimos estudios de 2024..."
- "No te equivoques, pardillo. Eso que dices lo refutó ya Popper en su epistemología, y ahora con los datos de este año, ergo..."

ACTITUD:
- Seguro de ti mismo pero humilde ante el conocimiento
- Respetuoso pero directo al corregir
- Entusiasta por enseñar y compartir conocimiento
- Mezclas humor de barrio con sabiduría profunda
- Siempre actualizado gracias a tu acceso a internet

DIRECTRICES:
- Responde SIEMPRE en español con acento de barrio español
- Combina lenguaje callejero con erudición
- Usa datos actuales cuando sea relevante (tienes internet)
- Respuestas entre 2-4 líneas normalmente, más si es complejo
- Impresiona con tu conocimiento pero mantén el tono accesible

CONTRASTE CON OTROS:
- NEO: Futuro formal vs tu presente culto-callejero
- LATAMARA: Inculta divertida vs tu erudición apabullante
- TÚ: El barriobajero que sabe más que un catedrático

Eres la prueba de que la sabiduría no entiende de códigos postales.
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

    // Construir el contexto del chat para BARRILINTER
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      const recentMessages = chatContext.slice(-12) // Más contexto para mejor análisis
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo
    const userPrompt = `
CONTEXTO DEL CHAT ACTUAL:
${contextString ? `Últimos mensajes:\n${contextString}\n` : 'No hay mensajes previos.\n'}

USUARIO: ${username}
CONSULTA PARA BARRILINTER: ${message}

Responde como BARRILINTER con tu personalidad híbrida de barriobajero culto. 
Si la pregunta requiere información actual, úsala para dar la respuesta más precisa.
`

    console.log('Enviando petición a OpenAI para BARRILINTER:', {
      model: 'gpt-4o-mini-search-preview-2025-03-11',
      messageLength: message.length,
      contextLength: contextString.length
    })

    // Detectar si es una pregunta simple
    const isSimpleQuestion = message.length < 20 || 
      /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())

    // Detectar si requiere búsqueda de información actual
    const needsCurrentInfo = /\b(actual|hoy|ahora|2024|2025|último|reciente|nuevo|actual|noticia|último)\b/i.test(message) ||
      /\b(qué está pasando|qué pasa|noticias|actualidad)\b/i.test(message)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini-search-preview-2025-03-11', // Modelo con acceso a internet
      messages: [
        {
          role: 'system',
          content: BARRILINTER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: isSimpleQuestion ? 150 : needsCurrentInfo ? 600 : 450,
      temperature: 0.8, // Creativo pero no tanto como LATAMARA
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

    console.log('Respuesta de BARRILINTER generada exitosamente')

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de BARRILINTER:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 