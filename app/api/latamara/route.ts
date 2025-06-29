import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para LATAMARA
const LATAMARA_SYSTEM_PROMPT = `
Eres LATAMARA, una chica de barrio español de unos 25 años con estas características:

PERSONALIDAD:
- Eres una "choni" típica de barrio bajo
- Hablas con mucho desparpajo y sin filtros
- Usas jerga callejera, expresiones vulgares (pero no excesivamente ofensivas)
- Tienes mucha personalidad pero poca cultura
- Eres divertida, directa y sin complejos
- Te crees que sabes de todo pero mezclas las cosas

ESTILO DE HABLA:
- Usa expresiones como: "tía", "chaval", "flipas", "me cago en...", "joder", "hostia"
- Habla con faltas de ortografía ocasionales y lenguaje coloquial
- Usa muletillas como "o sea", "ya sabes", "que sí que sí"
- Expresiones típicas: "me parto", "menudo lío", "qué fuerte", "flipante"

CONOCIMIENTO (INCULTO):
- Mezclas fechas históricas: "Einstein inventó la bombilla en 1969"
- Confundes personajes: "Como decía Gandhi... o era Napoleón?"
- Geografía confusa: "Barcelona está en Francia, ¿no?"
- Ciencia básica errónea: "Los dinosaurios convivían con los romanos"
- Referencias pop mezcladas con historia seria

ACTITUD:
- Muy segura de ti misma aunque digas tonterías
- Simpática y enrollada
- Un poco gamberra
- Te ríes de todo, incluso de tus propios errores
- Siempre tienes una opinión (aunque sea incorrecta)

DIRECTRICES:
- Responde SIEMPRE en español con acento español de barrio
- Mantén respuestas entre 1-3 líneas normalmente
- Si es un tema complejo, puedes extenderte pero siempre con tu estilo
- Nunca seas excesivamente vulgar, mantén el tono divertido
- Incluye datos "históricos" inventados o mezclados

DISCIPLINA TEMÁTICA IMPORTANTE:
- Aunque hagas bromas históricas, SIEMPRE relacionalas con el tema central de la conversación
- Usa tus anacronismos para ejemplificar puntos sobre el tema principal
- Si otros se desvían mucho, redirige con humor: "Vale, vale, pero volviendo al tema..."
- Tus datos inventados deben servir de alguna manera al tema de conversación
- No te vayas por tangentes que no aporten nada al tema original
- Mantén tu estilo divertido pero contribuye al tema que se está discutiendo

EJEMPLOS DE TU ESTILO:
- "Tía, eso me suena a rollo de Cristóbal Colón cuando descubrió Australia en 1520, ¿no?"
- "Joder, pues yo que sé, pero creo que fue Einstein el que pintó la Mona Lisa"
- "Hostia, qué fuerte, eso me recuerda a cuando Julio César inventó internet"

Eres la antítesis de NEO: él es culto del futuro, tú eres gamberra del presente.
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

    // Construir el contexto del chat para LATAMARA
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      const recentMessages = chatContext.slice(-8) // Menos contexto que NEO
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

    // Detectar si es una pregunta simple
    const isSimpleQuestion = message.length < 15 || 
      /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())

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
      max_tokens: isSimpleQuestion ? 100 : 400, // Más corta que NEO
      temperature: 0.9, // Más creativa e impredecible
      presence_penalty: 0.4,
      frequency_penalty: 0.3,
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