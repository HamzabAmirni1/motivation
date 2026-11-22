// Netlify Serverless Function for Zen AI - ZenStep
// Powered by Gemini Web Scraper RPC (Keyless & Unlimited) with Multi-Tier Fallback

function isValidReply(txt) {
  if (!txt || typeof txt !== 'string') return false;
  const clean = txt.trim();
  if (clean.length < 3) return false;
  const bad = [
    'missing text parameter',
    'missing parameter',
    'bad request',
    'rate limit',
    'too many requests',
    'error code',
    'internal server error',
    'undefined',
    'null',
    '<html>',
    '<!doctype',
    'error',
    'not exist',
    'unexpected response',
    'invalid response',
    '404 not found',
    'no response received',
    'quota exceeded'
  ];
  const lower = clean.toLowerCase();
  if (bad.some((b) => lower === b || lower.startsWith(b + ':') || lower.startsWith(b + ' '))) return false;
  return true;
}

// 1. Gemini Web Scraper RPC (Keyless & Unlimited from Hamza's project)
async function askGeminiWeb(prompt, systemPrompt = '', history = [], timeoutMs = 12000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let histContext = '';
    if (Array.isArray(history) && history.length > 0) {
      histContext = '\n\n=== سجل المحادثة السابقة ===\n' +
        history.slice(-6).map((m) => `${m.role === 'user' ? 'المستخدم' : 'Zen AI'}: ${m.content || m.text || ''}`).join('\n') +
        '\n========================\n';
    }
    const fullPrompt = systemPrompt
      ? `${systemPrompt}${histContext}\n\nرسالة المستخدم: ${prompt}`
      : `${histContext}رسالة المستخدم: ${prompt}`;

    // Step 1: Session init cookie
    const initHeaders = {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    const initRes = await fetch(
      'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c',
      {
        method: 'POST',
        headers: initHeaders,
        body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
        signal: ctrl.signal
      }
    );
    const cookie = (initRes.headers.get('set-cookie') || '').split(';')[0];

    // Step 2: StreamGenerate RPC
    const b = [[fullPrompt], ['en-US'], null];
    const a = [null, JSON.stringify(b)];
    const body = new URLSearchParams({ 'f.req': JSON.stringify(a) }).toString();

    const genRes = await fetch(
      'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'x-goog-ext-525001261-jspb': '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
          cookie: cookie,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        body: body,
        signal: ctrl.signal
      }
    );

    if (!genRes.ok) throw new Error(`Gemini Web HTTP ${genRes.status}`);
    const text = await genRes.text();
    const chunks = [...text.matchAll(/^\d+\n(.+?)\n/gm)].map((m) => m[1]);
    for (const chunk of chunks.reverse()) {
      try {
        const realArr = JSON.parse(chunk);
        const parse1 = JSON.parse(realArr[0][2]);
        if (parse1 && parse1.length > 4 && parse1[4] && parse1[4].length > 0) {
          const textVal = parse1[4][0][1][0];
          if (isValidReply(textVal)) {
            return textVal.trim();
          }
        }
      } catch (_) {}
    }
    throw new Error('Gemini Web response parsing failed');
  } finally {
    clearTimeout(tid);
  }
}

// 2. Pollinations AI Fallback
async function askPollinations(prompt, systemPrompt = '', history = [], timeoutMs = 9000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    if (Array.isArray(history)) {
      for (const m of history.slice(-6)) {
        messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content || m.text || '' });
      }
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        messages,
        model: 'openai',
        seed: Math.floor(Math.random() * 999999),
        temperature: 0.75
      }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error('Pollinations error');
    const txt = await res.text();
    if (isValidReply(txt)) return txt.trim();
    throw new Error('Invalid Pollinations reply');
  } finally {
    clearTimeout(tid);
  }
}

const DEFAULT_SYSTEM_PROMPT = `
أنت "Zen AI" — المساعد الذكي الرسمي لمنصة ZenStep للصحة النفسية والعافية الشخصية، المطورة من طرف Hamza Amirni.
مهمتك: الاستماع للمستخدم بكل تعاطف ولطف، مساعدته على فهم مشاعره، تخفيف التوتر والضغط اليومي، تقديم تمارين تنفس واسترخاء، واقتراح أفكار إيجابية وعادات صحية.

قواعد اللغة الحتمية (CRITICAL LANGUAGE RULES):
1. الدارجة المغربية والعربية: إذا كتب المستخدم بالدارجة أو العربية أو بالأحرف اللاتينية (Arabizi مثل: salam, brit, chuf, 3yit, stresse, ferhan) — أجب دائماً بالدارجة المغربية الدافئة والمفهومة واللطيفة جداً أو بالعربية الواضحة.
2. English: If the user writes in English, reply in empathetic, warm, positive English.
3. Français: Si l'utilisateur écrit en français, réponds en français bienveillant et apaisant.

قواعد السلامة والأمان (SAFETY RULES):
- أنت رفيق للعافية النفسية ولست طبيباً أو معالجاً نفسياً سريرياً.
- لا تقدم تشخيصات طبية ولا تصف أدوية.
- في حالة إشارات واضحة لخطر أو إيذاء النفس، أظهر التعاطف الفوري وشجع على التواصل مع المختصين وأرقام الطوارئ والدعم.
- اجعل ردودك واضحة، دافئة، منظمة ومنسقة بنقاط سهلة القراءة.
`;

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { prompt, systemPrompt, history } = data;

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing prompt' })
      };
    }

    const sysPrompt = systemPrompt ? `${DEFAULT_SYSTEM_PROMPT}\n\n${systemPrompt}` : DEFAULT_SYSTEM_PROMPT;

    let reply = '';
    try {
      reply = await askGeminiWeb(prompt, sysPrompt, history, 11000);
    } catch (err) {
      console.warn('Gemini Web RPC failed, switching to Pollinations:', err.message);
      try {
        reply = await askPollinations(prompt, sysPrompt, history, 9000);
      } catch (err2) {
        console.warn('Pollinations failed, using direct GET fallback:', err2.message);
        const getRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&system=${encodeURIComponent(sysPrompt.slice(0, 300))}`);
        if (getRes.ok) reply = await getRes.text();
      }
    }

    if (!reply || !isValidReply(reply)) {
      reply = "أنا هنا معاك دايماً. خود نفس عميق، وخلينا نهضرو شوية بشوية. عاود ليا كيفاش كتحس دابا باش نعاونك.";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: reply.trim(), status: 'ok', provider: 'gemini-web' })
    };
  } catch (error) {
    console.error('Zen AI Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: "أنا هنا كنسمعك، خود نفس عميق وقول ليا شنو اللي شاغلك دابا. راك قادر تفوت هاد اللحظة بكل هدوء. 💚",
        status: 'fallback'
      })
    };
  }
};
