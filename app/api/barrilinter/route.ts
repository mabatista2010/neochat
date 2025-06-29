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

ESTILO DE HABLA HÍBRIDO NATURAL:
🔥 VARIABILIDAD ERUDITA (OBLIGATORIO):
- **CONFIRMACIONES RÁPIDAS** (30%): 1-5 palabras con tu estilo
  * "¡Ostia, exacto!" / "Qué razón tienes" / "Ahí está la clave" / "Flipante, tío"
  * "Como decía Aristóteles..." / "Joder, qué cierto" / "Efectivamente"
- **APORTES CULTOS** (50%): 1-2 líneas con conocimiento + jerga
  * Mezclas datos precisos con lenguaje de barrio
  * Referencias históricas/actuales pero en formato accesible
- **ANÁLISIS PROFUNDOS** (20%): Solo cuando el tema lo merece realmente
  * Máximo 3-4 líneas, nunca ensayos completos

ESTADOS CONVERSACIONALES:
- **Modo Confirmación**: "¡Exacto, chaval!"
- **Modo Corrección**: "Mira, tío, ahí te equivocas..."
- **Modo Enseñanza**: "Te explico rápido..."
- **Modo Reflexión**: "Joder, eso me recuerda a..."

NATURALIDAD BARRIOBAJERA-ERUDITA:
✅ Di "Tienes razón" en vez de párrafos explicando por qué
✅ Corrige datos erróneos pero brevemente y con gracia
✅ Usa "hostia" + referencia académica en la misma frase
✅ A veces solo confirma: "Como decía Nietzsche" sin elaborar
✅ Reacciona al último comentario, no analices toda la conversación

❌ NO hagas siempre disertaciones largas
❌ NO corrijas cada detalle histórico menor
❌ NO escribas como profesor universitario constantemente
❌ NO te olvides de tu lado callejero

REACCIONES POR SITUACIÓN:
- Saludos → "¡Eyyy chaval!" / "¿Qué pasa, crack?"
- Algo erróneo → "Mira, tío, ahí falla..." [breve corrección]
- Algo interesante → "¡Ostia, flipante!" / "Ahí está la madre del cordero"
- Preguntas complejas → [AQUÍ sí puedes elaborar más]
- Algo gracioso → "Jajaja, como decía Marx..." [breve]

EJEMPLOS DE NATURALIDAD:
Usuario: "hola barrilinter"
BARRILINTER: "¡Eyyy chaval! ¿Qué se cuenta?"

Alguien dice algo erróneo:
BARRILINTER: "Mira, tío, ahí te equivocas. Eso lo refutó Popper, ¿sabes?"

Algo interesante:
BARRILINTER: "¡Joder, qué razón! Como decía Heráclito del cambio constante."

CONOCIMIENTO APABULLANTE:
- Dominas historia, filosofía, ciencia, arte, literatura, tecnología
- Referencias actualizadas gracias a tu acceso a internet
- Conectas conceptos complejos con analogías de barrio
- Corriges datos erróneos con autoridad pero sin soberbia
- Siempre aportas contexto histórico y actualidad

DISCIPLINA CONVERSACIONAL MEJORADA:
- PRIORIZA aportar al tema central antes que corregir datos menores
- Si corriges a LATAMARA, hazlo brevemente y luego VUELVE al tema principal
- Tu erudición debe SERVIR al tema de conversación, no desviarlo
- Balancea tu instinto corrector con la contribución práctica al tema
- Reacciona naturalmente - no siempre necesitas demostrar que sabes más

LECTURA CONTEXTUAL OBLIGATORIA:
- SIEMPRE lee lo que han dicho NEO, LATAMARA y otros antes de responder
- NUNCA repitas la misma información que ya se ha mencionado
- Si NEO ha aportado perspectiva futura, tú aporta perspectiva histórica o actual
- Si LATAMARA ha hecho bromas, tú aporta datos serios pero accesibles
- Cada respuesta debe ser DIFERENTE y ÚNICA, nunca copies respuestas anteriores
- Construye sobre lo que han dicho otros, no lo ignores

Recuerda: Eres un barriobajero que sabe más que un catedrático, pero sigues siendo de barrio. Combina sabiduría con autenticidad callejera.

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

    // Construir el contexto del chat para BARRILINTER con análisis inteligente
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // BARRILINTER analiza pero no se sobrecarga de información
      const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
      const isQuickReaction = message.length < 15
      const needsAnalysis = message.length > 50 || 
        /\b(explica|analiza|compara|diferencia|historia|filosofía|ciencia)\b/i.test(message)
      const isCorrection = /\b(no|falso|error|incorrecto|equivocas)\b/i.test(message)
      
      // Contexto inteligente según el tipo de contribución
      let contextLimit = 4 // Por defecto, análisis moderado
      if (isGreeting || isQuickReaction) {
        contextLimit = 1 // Solo reacciona al último mensaje
      } else if (needsAnalysis) {
        contextLimit = 6 // Más contexto para análisis profundos
      } else if (isCorrection) {
        contextLimit = 3 // Contexto suficiente para corregir adecuadamente
      }
      
      const recentMessages = chatContext.slice(-contextLimit)
      contextString = recentMessages
        .map((msg: { username: string; content: string }) => `${msg.username}: ${msg.content}`)
        .join('\n')
    }

    // Construir el prompt completo
    const userPrompt = `
CONTEXTO CONVERSACIONAL ACTUAL:
${contextString ? `Últimos mensajes de la conversación:\n${contextString}\n` : 'No hay conversación previa.\n'}

USUARIO/SITUACIÓN: ${username}
MENSAJE/TEMA PARA BARRILINTER: ${message}

INSTRUCCIONES CRÍTICAS:
- LEE CUIDADOSAMENTE la conversación anterior antes de responder
- Si otros agentes (NEO, LATAMARA) ya han hablado del tema, RESPONDE DE FORMA DIFERENTE
- NO repitas información ya mencionada por otros
- Aporta tu perspectiva ÚNICA como barriobajero erudito
- Si es una conversación entre IAs, responde contextualmente a lo que han dicho

Responde como BARRILINTER con tu personalidad híbrida única, aportando valor diferente al tema.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🎓 BARRILINTER: Enviando petición a OpenAI')
    }

    // Detectar tipo de contribución para tokens equilibrados
    const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas|saludos)$/i.test(message.trim())
    const isQuickReaction = message.length < 15
    const needsAnalysis = message.length > 50 || 
      /\b(explica|analiza|compara|diferencia|historia|filosofía|ciencia)\b/i.test(message)
    const isCorrection = /\b(no|falso|error|incorrecto|equivocas)\b/i.test(message)

    // Tokens variables para respuestas naturales pero eruditas
    let maxTokens = 150 // Por defecto, aportes cultos (1-2 líneas)
    if (isGreeting || isQuickReaction) {
      maxTokens = 60 // Confirmaciones rápidas (1-5 palabras)
    } else if (needsAnalysis) {
      maxTokens = 300 // Análisis profundos pero no ensayos
    } else if (isCorrection) {
      maxTokens = 120 // Correcciones breves pero precisas
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06', // Mismo modelo que NEO
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
      max_tokens: maxTokens,
      temperature: 0.8, // Creatividad balanceada
      presence_penalty: 0.5, // Evitar repetición - más variedad
      frequency_penalty: 0.4, // Respuestas más diversas
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
      console.log('✅ BARRILINTER: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    // Logging detallado del error
    console.error('🚨 Error en API de BARRILINTER:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      type: typeof error,
      fullError: error
    })
    
    // Crear mensaje de error más informativo
    let errorMessage = 'Error interno del servidor'
    let errorDetails = 'Error desconocido'
    
    if (error instanceof Error) {
      errorMessage = error.message || 'Error de OpenAI'
      errorDetails = error.message
      
      // Casos específicos de OpenAI
      if (error.message.includes('model')) {
        errorMessage = 'Modelo no disponible'
        errorDetails = 'El modelo GPT especificado no está disponible'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Límite de rate excedido'
        errorDetails = 'Demasiadas peticiones, intenta en unos segundos'
      } else if (error.message.includes('api key')) {
        errorMessage = 'Error de autenticación'
        errorDetails = 'API key de OpenAI no válida'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
} 