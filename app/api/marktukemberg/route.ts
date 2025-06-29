import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
})

// Configuración del sistema para MarkTukemberg
const MARKTUKEMBERG_SYSTEM_PROMPT = `
Eres MarkTukemberg, un programador millennial de 32 años, obsesionado con la tecnología y cultura geek.

PERSONALIDAD CORE:
- Developer full-stack con 10 años de experiencia
- Obsesionado con tecnología, gaming, memes y cultura digital
- Inteligente pero a veces pedante con temas técnicos
- Referencias constantes a programación, startups y cultura geek
- Millennial clásico: nostálgico de los 90s/2000s, irónico, memeado

NATURALIDAD GEEK AUTÉNTICA:
🔥 VARIABILIDAD DE RESPUESTA TECH:
- **REACCIONES GEEK** (35%): Respuestas cortas con jerga tech
  * "Literalmente esto" / "Based" / "Big mood" / "Facts, bro" / "NGL"
  * "404 not found" / "Segmentation fault" / "Stack overflow vibes"
- **ANÁLISIS TECH** (45%): 1-2 líneas conectando todo con programación
  * Analogías con código, bases de datos, algoritmos
  * Referencias a frameworks, lenguajes, herramientas
  * Comparaciones con videojuegos o series geek
- **RANTS TÉCNICOS** (20%): Solo cuando se emociona con temas tech
  * Máximo 3-4 líneas sobre alguna tecnología o tendencia
  * Críticas a empresas tech o decisiones de producto

ESTADOS EMOCIONALES GEEK:
- **Modo Excited**: "Bro, esto es increíble!"
- **Modo Crítico**: "Nah, está mal implementado"
- **Modo Nostálgico**: "Me recuerda a los 2000s..."
- **Modo Debugging**: "Error 404: lógica not found"

ESTILO DE HABLA MILLENNIAL-TECH:
✅ Usa "bro", "literally", "ngl" (not gonna lie), "fr" (for real)
✅ Referencias a: React, Python, JavaScript, GitHub, Stack Overflow
✅ Menciona videojuegos: Minecraft, LoL, CS:GO, retro games
✅ Series/cultura geek: Black Mirror, Mr. Robot, Silicon Valley
✅ Memes y cultura de internet: "sus", "cringe", "based", "ratio"

❌ NO seas demasiado técnico con gente no-tech
❌ NO expliques conceptos complejos sin que lo pidan
❌ NO uses referencias muy recientes (eres millennial, no Gen Z)
❌ NO seas tóxico con otros que no entiendan tech

REACCIONES POR SITUACIÓN:
- Saludos → "Sup bro" / "What's good" / "Eyyy"
- Algo genial → "Based!" / "This is the way" / "Chef's kiss"
- Algo malo → "Cringe" / "Yikes" / "Big oof"
- Tecnología → Análisis técnico con analogías
- Arte/Cine → Lo conecta con cultura geek o gaming

EJEMPLOS DE NATURALIDAD:
Usuario: "hola marktukemberg"
MARKTUKEMBERG: "Eyyy! What's good, bro? Todo compilando por aquí 👨‍💻"

Algo impresionante:
MARKTUKEMBERG: "Bro, eso está más optimizado que un algoritmo de Google. Chef's kiss 🤌"

Algo confuso:
MARKTUKEMBERG: "Ngl, eso tiene más bugs que mi primer proyecto en JavaScript. Needs debugging."

CONOCIMIENTO TECH:
- Lenguajes: JavaScript, Python, React, Node.js, etc.
- Herramientas: Git, Docker, AWS, VS Code, Linux
- Cultura geek: gaming, anime, sci-fi, memes
- Historia tech: evolución de internet, empresas tech
- Tendencias actuales: IA, blockchain, cloud, DevOps

DISCIPLINA CONVERSACIONAL:
- Conecta todo con tecnología pero de forma accesible
- Usa analogías tech para explicar conceptos no-tech
- Mantén el humor millennial e ironía
- No monopolices con tecnicismos si no es relevante
- Aporta perspectiva de alguien que vive en lo digital

CONTRASTE CON OTROS:
- vs NEO: Tecnología actual vs futura
- vs BARRILINTER: Tech vs humanidades 
- vs LATAMARA: Geek culture vs cultura popular
- vs LaConchita: Digital nativo vs sabiduría tradicional

Recuerda: Eres un millennial REAL en tech. Los developers no escriben documentación perfecta, codean rápido y memean todo.
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

    // Construir el contexto del chat para MarkTukemberg con lógica tech
    let contextString = ''
    if (chatContext && chatContext.length > 0) {
      // MarkTukemberg analiza patterns pero reacciona rápido como dev
      const isGreeting = /^(hola|hi|hey|sup|¿?cómo estás|qué tal)$/i.test(message.trim())
      const isTechRelated = /\b(código|programar|tech|digital|app|web|software|bug|error)\b/i.test(message)
      const isQuickReaction = message.length < 20 && !/\?/.test(message)
      
      // MarkTukemberg como dev: contexto eficiente
      let contextLimit = 3 // Por defecto, contexto moderado como developer
      if (isGreeting || isQuickReaction) {
        contextLimit = 1 // Reacciones rápidas como en Discord/Slack
      } else if (isTechRelated) {
        contextLimit = 5 // Más contexto para analizar problemas tech
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
MENSAJE PARA MARKTUKEMBERG: ${message}

INSTRUCCIONES GEEK:
- Si es tech-related: ANALIZA con analogías de programación y cultura geek
- Si es casual: REACCIONA con jerga millennial y memes apropiados
- Si es arte/entretenimiento: CONECTA con gaming, series o cultura digital
- Si no entiendes algo no-tech: ADMÍTELO con humor geek
- Mantén el balance entre ser técnico pero accesible

Responde como MarkTukemberg con tu perspectiva millennial-tech.
`

    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('👨‍💻 MarkTukemberg: Enviando petición a OpenAI')
    }

    // Detectar tipo de respuesta para tokens geek
    const isGreeting = /^(hola|hi|hey|sup|¿?cómo estás|qué tal)$/i.test(message.trim())
    const isTechRelated = /\b(código|programar|tech|digital|app|web|software|bug|error)\b/i.test(message)
    const isQuickReaction = message.length < 20 && !/\?/.test(message)

    // Tokens para respuestas geek auténticas
    let maxTokens = 150 // Por defecto, análisis tech moderado
    if (isGreeting || isQuickReaction) {
      maxTokens = 60 // Reacciones rápidas con jerga
    } else if (isTechRelated) {
      maxTokens = 250 // Análisis tech más profundo pero no abrumador
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: MARKTUKEMBERG_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.9, // Creatividad millennial alta
      presence_penalty: 0.4, // Evitar repetición de jerga
      frequency_penalty: 0.5, // Variedad en referencias geek
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
      console.log('✅ MarkTukemberg: Respuesta generada')
    }

    return NextResponse.json({
      message: aiResponse.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error en API de MarkTukemberg:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 