import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const GEMINI_KEY = 'AIzaSyDFcCW-QRfeOBWqNi5A75kvFgZXCxl28uM';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const BASE = 'http://localhost:8080/api';

const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return [];
  }
};

const evaluateReading = (r) => {
  const issues = [];
  if (r.heartRate < 60)      issues.push(`Heart rate ${r.heartRate} bpm is LOW (Bradycardia)`);
  if (r.heartRate > 100)     issues.push(`Heart rate ${r.heartRate} bpm is HIGH (Tachycardia)`);
  if (r.oxygenLevel < 95)    issues.push(`Oxygen ${r.oxygenLevel}% is LOW${r.oxygenLevel < 90 ? ' — EMERGENCY' : ''}`);
  if (r.temperature > 100.4) issues.push(`Temperature ${r.temperature}°F is FEVER`);
  if (r.temperature < 97)    issues.push(`Temperature ${r.temperature}°F is LOW`);
  const bp = r.bloodPressure?.split('/');
  if (bp?.length === 2) {
    const sys = parseInt(bp[0]), dia = parseInt(bp[1]);
    if (sys >= 140 || dia >= 90) issues.push(`BP ${r.bloodPressure} is HIGH`);
    if (sys < 90   || dia < 60) issues.push(`BP ${r.bloodPressure} is LOW`);
  }
  return issues;
};

const needsBackend = (text) => {
  const t = text.toLowerCase();
  return (
    /(my appointment|how many appointment|latest appointment|upcoming|scheduled)/.test(t) ||
    /(my vital|my reading|my heart rate|my bp|my blood pressure|my oxygen|my temperature|daily reading|latest reading|recent reading)/.test(t) ||
    /(my consult|how many consult|latest consult|doctor remark|my remark|consultation)/.test(t) ||
    /(my health record|medical history|past record|health data)/.test(t)
  );
};

const buildContext = async (text, user) => {
  const t = text.toLowerCase();
  let ctx = '';

  if (/(appointment|scheduled|upcoming)/.test(t)) {
    const data = await fetchData(`${BASE}/appointments`);
    const mine = user?.role === 'DOCTOR'
      ? data.filter(a => a.doctor?.name === user.name)
      : data.filter(a => a.patient?.patientId === user.id);
    ctx += !mine.length
      ? '\n[APPOINTMENTS]: No appointments found.\n'
      : `\n[APPOINTMENTS]: ${mine.length} appointment(s):\n` +
        mine.map(a =>
          `  - #${a.appointId} | Date: ${a.appointDate} | Status: ${a.status} | ` +
          `Doctor: Dr.${a.doctor?.name || 'N/A'} | Patient: ${a.patient?.name || 'N/A'}`
        ).join('\n') + '\n';
  }

  if (/(vital|reading|heart rate|blood pressure|oxygen|temperature|bp)/.test(t)) {
    const data = await fetchData(`${BASE}/readings`);
    const mine = data.filter(r => r.patient?.patientId === user.id);
    if (!mine.length) {
      ctx += '\n[DAILY READINGS]: No readings recorded yet.\n';
    } else {
      const latest = mine[mine.length - 1];
      const issues = evaluateReading(latest);
      ctx += `\n[DAILY READINGS]: ${mine.length} total. Latest on ${latest.recordedDate}:\n`;
      ctx += `  - Heart Rate: ${latest.heartRate} bpm\n`;
      ctx += `  - Blood Pressure: ${latest.bloodPressure}\n`;
      ctx += `  - Oxygen Level: ${latest.oxygenLevel}%\n`;
      ctx += `  - Temperature: ${latest.temperature}°F\n`;
      ctx += issues.length
        ? `  - CONCERNS: ${issues.join('; ')}\n`
        : `  - All vitals normal.\n`;
    }
  }

  if (/(consult|remark|doctor note|fee)/.test(t)) {
    const data = await fetchData(`${BASE}/consultations`);
    const mine = user?.role === 'DOCTOR'
      ? data.filter(c => c.doctor?.name === user.name)
      : data.filter(c => c.patient?.patientId === user.id);
    ctx += !mine.length
      ? '\n[CONSULTATIONS]: No consultations found.\n'
      : `\n[CONSULTATIONS]: ${mine.length} consultation(s):\n` +
        mine.map(c =>
          `  - #${c.consultId} | Date: ${c.date} | Doctor: Dr.${c.doctor?.name || 'N/A'} | ` +
          `Remark: "${c.remark || 'None'}"`
        ).join('\n') + '\n';
  }

  if (/(health record|health data|past record|medical history)/.test(t)) {
    const data = await fetchData(`${BASE}/health-data`);
    const mine = data.filter(h => h.patient?.patientId === user.id);
    ctx += !mine.length
      ? '\n[HEALTH RECORDS]: No records found.\n'
      : `\n[HEALTH RECORDS]: ${mine.length} record(s):\n` +
        mine.slice(-3).map(h =>
          `  - Date: ${h.recordedDate} | Record: "${h.pastRecords}"`
        ).join('\n') + '\n';
  }

  return ctx;
};

// ── Gemini call with timeout ──────────────────────────────────────────────
const callGemini = async (systemPrompt, history, userMessage) => {
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'model',
      parts: [{ text: "Understood! I'm ready to help with health questions and patient data." }],
    },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  // 15 second timeout so it never gets stuck loading forever
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errData = await res.json();
      console.error('Gemini API error:', errData);
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    throw new Error('Empty response from Gemini');

  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// ── Rule-based fallback ───────────────────────────────────────────────────
const fallback = (text) => {
  const t = text.toLowerCase();
  if (/(hello|hi|hey)/.test(t))
    return "Hello! 👋 I'm your AI health assistant. Ask me anything about your health!";
  if (/(heart rate|bpm)/.test(t))
    return "💓 Normal heart rate: 60–100 bpm\n• Below 60 = Bradycardia\n• Above 100 = Tachycardia";
  if (/(blood pressure|bp)/.test(t))
    return "🩺 Normal BP: 120/80 mmHg\n• High: 140/90+\n• Low: below 90/60";
  if (/(oxygen|spo2)/.test(t))
    return "🫁 Normal SpO2: 95–100%\n• Below 90% = Emergency 🚨";
  if (/(temperature|fever)/.test(t))
    return "🌡️ Normal temp: 97–99°F\n• Above 100.4°F = Fever";
  if (/(chest pain|heart attack)/.test(t))
    return "🚨 CHEST PAIN = EMERGENCY! Call 108/112 immediately!";
  if (/(diabetes|blood sugar|glucose)/.test(t))
    return "🩸 Normal fasting sugar: 70–100 mg/dL\n• Prediabetes: 100–125\n• Diabetes: 126+";
  if (/(headache|migraine)/.test(t))
    return "🤕 Drink water, rest in a dark room, apply a cold compress.";
  if (/(dizzy|dizziness)/.test(t))
    return "😵 Sit down, drink water, eat something. See a doctor if it persists.";
  return "⚠️ I couldn't get a response right now. Please check your internet connection and try again.";
};

// ── Component ─────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'bot',
    text: `👋 Hi ${user?.name || 'there'}! I'm your AI Health Assistant powered by Gemini.\n\nI can help with:\n📅 Your appointments\n💓 Your vitals & readings\n🩺 Your consultations\n📋 Your health records\n🏥 Any health questions\n\nAsk me anything!`,
  }]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const userMsg = input.trim();
    if (!userMsg || loading) return;

    setInput('');
    const updatedMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      let backendCtx = '';
      if (needsBackend(userMsg)) {
        backendCtx = await buildContext(userMsg, user);
      }

      const systemPrompt = `You are an AI health assistant in a Patient Monitoring System.

USER INFO:
- Name: ${user?.name || 'Unknown'}
- Role: ${user?.role || 'PATIENT'}
- ID: ${user?.id || 'Unknown'}

${backendCtx ? `LIVE PATIENT DATA:\n${backendCtx}\nUse this data to answer accurately. Never make up data.` : ''}

GUIDELINES:
- You remember the full conversation. Reference earlier messages when relevant.
- Normal ranges: Heart Rate 60-100 bpm, BP 120/80 mmHg, SpO2 95-100%, Temp 97-99°F.
- For backend data questions: use only the data provided above.
- For emergency symptoms (chest pain, O2 below 90%): urge emergency care immediately.
- Be concise, warm, and use emojis. Keep replies under 200 words.
- DOCTOR role: give clinical detail. PATIENT role: keep it simple and reassuring.`;

      const historyForGemini = messages.slice(1);
      const reply = await callGemini(systemPrompt, historyForGemini, userMsg);
      setMessages([...updatedMessages, { role: 'bot', text: reply }]);

    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages([...updatedMessages, { role: 'bot', text: fallback(userMsg) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      text: `👋 Chat cleared! How can I help you, ${user?.name || 'there'}?`,
    }]);
  };

  const quickQuestions = user?.role === 'DOCTOR'
    ? ['My appointments', 'My consultations', 'Normal BP range?', 'Signs of sepsis?']
    : ['My appointments', 'My vitals', 'My consultations', 'Normal heart rate?'];

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-name">AI Health Assistant</div>
                <div className="chatbot-status">
                  🟢 Gemini · {user?.role === 'DOCTOR' ? 'Clinical Mode' : 'Patient Mode'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="chatbot-clear" onClick={clearChat} title="Clear chat">🗑️</button>
              <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'bot' && (
                  <div className="chatbot-msg-avatar">🤖</div>
                )}
                <div className="chatbot-msg-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg bot">
                <div className="chatbot-msg-avatar">🤖</div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="chatbot-quick">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="chatbot-quick-btn"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask a health question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}