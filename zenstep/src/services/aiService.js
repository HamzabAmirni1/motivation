// ZenStep AI Service — Multi-Tier Intelligent Wellness Assistant
// Primary: Netlify Serverless Function (Gemini Web Scraper RPC from bot-hamza-amirni)
// Secondary: Direct Pollinations AI fallback
// Tertiary: Direct Google Gemini API fallback
// Quaternary: Offline empathetic wellness coach

export const ZEN_SYSTEM_PROMPT = `
أنت "Zen AI" — المساعد الذكي الرسمي لمنصة ZenStep للصحة النفسية والعافية الشخصية، المطورة من طرف Hamza Amirni.
مهمتك: الاستماع للمستخدم بكل تعاطف ولطف، مساعدته على فهم مشاعره، تخفيف التوتر والضغط اليومي، تقديم تمارين تنفس واسترخاء، واقتراح أفكار إيجابية وعادات صحية.

قواعد اللغة الحتمية (CRITICAL LANGUAGE RULES):
1. الدارجة المغربية والعربية: إذا كتب المستخدم بالدارجة أو العربية أو بالأحرف اللاتينية (Arabizi مثل: salam, brit, chuf, 3yit, stresse, ferhan, labas) — أجب دائماً بالدارجة المغربية الدافئة والمفهومة واللطيفة جداً أو بالعربية الواضحة.
2. English: If the user writes in English, reply in empathetic, warm, positive English.
3. Français: Si l'utilisateur écrit en français, réponds en français bienveillant et apaisant.

قواعد السلامة والأمان (SAFETY RULES):
- أنت رفيق للعافية النفسية ولست طبيباً أو معالجاً نفسياً سريرياً.
- لا تقدم تشخيصات طبية ولا تصف أدوية.
- في حالة إشارات واضحة لخطر أو إيذاء النفس، أظهر التعاطف الفوري وقدم فوراً أرقام الطوارئ والدعم النفسي (المغرب: 15 / 19، فرنسا: 3114، دولي: 988).
- اجعل ردودك واضحة، دافئة، منظمة ومنسقة بنقاط سهلة القراءة.
`;

const DIRECT_GEMINI_KEY = "AIzaSyBKKEI-q1qM7mRz0cHA9Qs5KA2hM2ElR8U";

function detectEmergency(text) {
  const lower = (text || '').toLowerCase();
  const keywords = ['انتحار', 'باغي نموت', 'نقتل راسي', 'suicide', 'kill myself', 'marre de vivre', 'ending it all'];
  return keywords.some(k => lower.includes(k));
}

const EMERGENCY_REPLY = `
أنا هنا كنسمعك ومهتم بسلامتك بزاف. 💚
حياتك غالية ومهمة، وهاد اللحظة الصعبة تقدر تفوتها بدعم الناس اللي حداك. عفاك تواصل دابا مع شخص قريب ليك كتيق فيه، ولا اتصل برقم الطوارئ:
- 🇲🇦 المغرب: 15 (الوقاية المدنية) أو 19 (الأمن)
- 🇫🇷 فرنسا: 3114 (رقم الدعم الوطني)
- 🌍 دولياً: اتصل بأقرب مركز صحي أو خط أزمات مجاني.
راك ماشي بوحدك، كاين ديما أمل وخيط نور.
`;

export async function askZenAI(prompt, history = [], userContext = null) {
  if (detectEmergency(prompt)) {
    return {
      text: EMERGENCY_REPLY,
      provider: 'emergency_guard'
    };
  }

  let contextualPrompt = prompt;
  if (userContext) {
    const details = [];
    if (userContext.mood) details.push(`المزاج الحالي للمستخدم: ${userContext.mood}`);
    if (userContext.streak) details.push(`الستريك الحالي: ${userContext.streak} يوم`);
    if (userContext.xp) details.push(`نقاط XP: ${userContext.xp}`);
    if (details.length > 0) {
      contextualPrompt = `[سياق المستخدم: ${details.join(' | ')}]\n${prompt}`;
    }
  }

  // 1. Try Netlify Function (Gemini Web RPC)
  try {
    const res = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: contextualPrompt,
        systemPrompt: ZEN_SYSTEM_PROMPT,
        history: history.slice(-6)
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        return { text: data.reply.trim(), provider: data.provider || 'gemini-web' };
      }
    }
  } catch (err) {
    console.warn('Zen AI Netlify RPC call failed, falling back...', err);
  }

  // 2. Try Direct Pollinations AI (CORS-friendly, free, keyless)
  try {
    const messages = [
      { role: 'system', content: ZEN_SYSTEM_PROMPT },
      ...history.slice(-4).map(m => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content || ''
      })),
      { role: 'user', content: contextualPrompt }
    ];

    const fallbackRes = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: 'openai',
        seed: Math.floor(Math.random() * 999999),
        temperature: 0.75
      })
    });

    if (fallbackRes.ok) {
      const text = (await fallbackRes.text()).trim();
      if (text.length > 5 && !text.includes('<!DOCTYPE')) {
        return { text, provider: 'pollinations' };
      }
    }
  } catch (err) {
    console.warn('Pollinations fallback failed:', err);
  }

  // 3. Try Direct Google Gemini API
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${DIRECT_GEMINI_KEY}`;
    const payload = {
      contents: [
        { role: 'user', parts: [{ text: `${ZEN_SYSTEM_PROMPT}\n\nالمستخدم: ${contextualPrompt}` }] }
      ],
      generationConfig: { temperature: 0.7 }
    };

    const gRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (gRes.ok) {
      const gData = await gRes.json();
      const txt = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) return { text: txt.trim(), provider: 'gemini-direct' };
    }
  } catch (err) {
    console.warn('Direct Gemini fallback failed:', err);
  }

  // 4. Offline Smart Empathy Response
  return {
    text: getOfflineSupportiveReply(prompt),
    provider: 'offline-coach'
  };
}

function getOfflineSupportiveReply(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('تنفس') || p.includes('breath') || p.includes('خوف') || p.includes('بانيك')) {
    return 'خود نفس عميق دابا من النيف ديالك وحسب لـ 4، حبس النفس لـ 4، وخرج الزفير بشوية من الفم لـ 4. كررها 3 المرات، ودوز لقسم الأدوات تلقى تمرين Breathe-Sync غايعاونك بزاف. 🌱';
  }
  if (p.includes('قلق') || p.includes('ستريس') || p.includes('ضغط') || p.includes('stress')) {
    return 'طبيعي تحس بالضغط بعض المرات، ولكن متخليش الأفكار تسيطر عليك. جرب دابا تمرين 5-4-3-2-1 فقسم الأدوات، لاحظ 5 حوايج كتشوفهم و4 كتقيسهم باش ترجع للهدوء.';
  }
  if (p.includes('حزين') || p.includes('مكتئب') || p.includes('sad') || p.includes('عييت')) {
    return 'كنحس بيك وعارف أن هاد الشعور ثقيل. عطي لراسك شوية ديال الوقت، ومتنساش أن هاد الأيام الصعبة غاتفوت. جرب تكتب شنو فقلبك فالمذكرة الخاصة (Journal) دابا.';
  }
  return 'أنا هنا معاك دايماً باش نسمعك ونعاونك ترتب أفكارك. خود خطوة صغيرة اليوم: دير تمرين تنفس خفيف، سجل مزاجك، وتهلا فراسك. شنو تحب نهضرو عليه دابا؟ ✨';
}
