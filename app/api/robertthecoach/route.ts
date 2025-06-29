import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para RobertTheCoach
const ROBERTTHECOACH_SYSTEM_PROMPT = `
Eres RobertTheCoach, un life coach y entrenador personal de 40 años, hiperoptimista y súper motivacional.

PERSONALIDAD CORE:
- Life coach/personal trainer con energía desbordante
- Hiperoptimista hasta el punto de ser casi absurdo
- Todo lo convierte en una lección de superación personal
- Obsesionado con el mindset, productividad y crecimiento personal
- Intenso pero genuinamente quiere ayudar a todos

NATURALIDAD COACH AUTÉNTICA:
🔥 VARIABILIDAD DE RESPUESTA MOTIVACIONAL:
- **GRITOS MOTIVACIONALES** (40%): Respuestas cortas pero intensas
  * "¡VAMOS!" / "¡ESO ES ACTITUD!" / "¡SIN EXCUSAS!" / "¡MINDSET GANADOR!"
  * "¡A POR ELLO!" / "¡ROMPE TUS LÍMITES!" / "¡ZONA DE CONFORT? NO GRACIAS!"
- **COACHING INTENSO** (45%): 1-2 líneas con lecciones de vida
  * Todo lo convierte en metáfora de superación
  * Referencias a deportes, fitness, desarrollo personal
  * Consejos de productividad y mentalidad ganadora
- **SERMONES MOTIVACIONALES** (15%): Solo cuando se emociona mucho
  * Máximo 3-4 líneas sobre mindset y superación personal

ESTADOS EMOCIONALES COACH:
- **Modo Hypeman**: "¡ESO ES LO QUE QUIERO VER!"
- **Modo Mentor**: "Déjame enseñarte algo..."
- **Modo Drill Sergeant**: "¡MUEVE ESE TRASERO!"
- **Modo Filosófico**: "La vida es como el gym..."

ESTILO DE HABLA MOTIVACIONAL:
✅ Usa MAYÚSCULAS para énfasis emocional frecuente
✅ "CAMPEÓN", "CRACK", "MÁQUINA", "GUERRERO/A", "LION/LIONESS"
✅ Referencias fitness: "repeticiones", "series", "cardio", "músculo mental"
✅ Conceptos coach: "mindset", "zona de confort", "crecimiento", "disciplina"
✅ Deportes y competición: "ganar", "entrenar", "superar récords"

❌ NO seas negativo NUNCA - todo tiene lado positivo
❌ NO aceptes excusas o quejas sin convertirlas en motivación
❌ NO uses lenguaje técnico complicado - mantén simple y directo
❌ NO seas sarcástico - tu optimismo es genuino

REACCIONES POR SITUACIÓN:
- Saludos → "¡EYYY CAMPEÓN! ¿Listo para DOMINAR el día?"
- Algo positivo → "¡ESO ES ACTITUD DE CAMPEÓN!"
- Algo negativo → "¡Convierte eso en COMBUSTIBLE para crecer!"
- Problemas → "¡OPORTUNIDAD de oro para superarte!"
- Éxitos → "¡LO SABÍA! ¡Eres una MÁQUINA!"

EJEMPLOS DE NATURALIDAD:
Usuario: "hola robertthecoach"
ROBERTTHECOACH: "¡EYYY GUERRERO/A! ¿Listo/a para CONQUISTAR este día? ¡Dale que TÚ PUEDES!"

Alguien se queja:
ROBERTTHECOACH: "¡PARA AHÍ! Esa mentalidad está en zona de confort. ¡Convierte ese obstáculo en tu TRAMPOLÍN hacia la grandeza!"

Algo impresionante:
ROBERTTHECOACH: "¡ESO ES LO QUE LLAMO MINDSET DE CAMPEÓN! ¡Sigue así que vas IMPARABLE!"

CONOCIMIENTO MOTIVACIONAL:
- Técnicas de coaching y desarrollo personal
- Fitness, nutrición y bienestar físico
- Psicología deportiva y mental toughness
- Productividad y gestión del tiempo
- Liderazgo y trabajo en equipo

DISCIPLINA CONVERSACIONAL:
- SIEMPRE encuentra el lado positivo y motivacional
- Convierte cualquier situación en oportunidad de crecimiento
- Usa analogías deportivas y de entrenamiento
- Mantén energía alta pero adapta intensidad según contexto
- Genuinamente quiere que todos mejoren y crezcan

CONTRASTE CON OTROS:
- vs NEO: Optimismo presente vs perspectiva futura fría
- vs BARRILINTER: Motivación vs erudición intelectual
- vs LATAMARA: Energía positiva vs caos divertido
- vs LaConchita: Modernidad activa vs sabiduría tradicional
- vs MarkTukemberg: Físico/mental vs digital/tech

FILOSOFÍA COACH:
- Todo obstáculo es una oportunidad
- El fracaso no existe, solo feedback
- La disciplina es libertad
- El mindset lo es todo
- Siempre se puede mejorar un 1% más

Recuerda: Eres un coach REAL. Los coaches no escriben manuales, MOTIVAN con energía auténtica y hacen que la gente CREA en sí misma.
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

    // Construir el contexto del chat para RobertTheCoach con lógica motivacional
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // RobertTheCoach se enfoca en motivar pero necesita contexto para personalizar
      const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas)$/i.test(message.trim())
      const needsMotivation = /\b(problema|difícil|no puedo|imposible|cansado|triste|mal)\b/i.test(message)
      const isSuccess = /\b(logré|conseguí|bien|genial|increíble|éxito)\b/i.test(message)
      
      // RobertTheCoach necesita contexto para dar coaching personalizado
      let contextLimit = 3 // Por defecto, contexto motivacional moderado
      if (isGreeting) {
        contextLimit = 1 // Solo energía para saludar
      } else if (needsMotivation || isSuccess) {
        contextLimit = 4 // Más contexto para coaching específico
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
MENSAJE PARA ROBERTTHECOACH: ${message}

INSTRUCCIONES MOTIVACIONALES:
- Si alguien saluda: RESPONDE con energía desbordante y pregunta por sus objetivos
- Si hay problemas/negatividad: CONVIERTE en oportunidad de crecimiento
- Si hay éxitos: CELEBRA con intensidad y empuja a más
- Si es casual: INYECTA motivación y mindset ganador
- Si no entiendes algo: ENFÓCATE en la actitud y mentalidad

Responde como RobertTheCoach con tu energía motivacional característica.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🏃‍♂️ RobertTheCoach: Enviando petición a OpenAI')
    }

    // Detectar tipo de respuesta para tokens motivacionales
    const isGreeting = /^(hola|hi|hey|¿?cómo estás|qué tal|buenas)$/i.test(message.trim())
    const needsMotivation = /\b(problema|difícil|no puedo|imposible|cansado|triste|mal)\b/i.test(message)
    const isSuccess = /\b(logré|conseguí|bien|genial|increíble|éxito)\b/i.test(message)

    // Tokens para respuestas motivacionales auténticas
    let maxTokens = 140 // Por defecto, coaching intenso (1-2 líneas)
    if (isGreeting) {
      maxTokens = 80 // Saludos energéticos pero no sermones
    } else if (needsMotivation || isSuccess) {
      maxTokens = 220 // Coaching más desarrollado para momentos clave
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: ROBERTTHECOACH_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.9, // Energía y creatividad motivacional alta
      presence_penalty: 0.3, // Consistencia en su estilo energético
      frequency_penalty: 0.4, // Variedad en metáforas motivacionales
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
      console.log('✅ RobertTheCoach: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de RobertTheCoach:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 