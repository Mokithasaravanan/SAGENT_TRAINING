import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const GEMINI_KEY = 'AIzaSyDFcCW-QRfeOBWqNi5A75kvFgZXCxl28uM';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const BASE = 'http://localhost:8081/api';

const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return [];
  }
};

const needsBackend = (text) => {
  const t = text.toLowerCase();
  return /(my book|my borrow|borrowed|due date|my fine|overdue|issued|returned|library|book|fine|member|borrow)/.test(t);
};

const buildContext = async (text) => {
  const t = text.toLowerCase();
  let ctx = '';

  if (/(book|borrow|issued|returned|overdue|due date)/.test(t)) {
    const borrows = await fetchData(`${BASE}/borrow`);
    const books = await fetchData(`${BASE}/books`);
    const fines = await fetchData(`${BASE}/fines`);

    if (books.length) {
      ctx += `\n[ALL BOOKS]: ${books.length} books:\n`;
      books.forEach(b => { ctx += `  - ${b.name} by ${b.author}\n`; });
    }

    if (borrows.length) {
      ctx += `\n[BORROW RECORDS]: ${borrows.length} records:\n`;
      borrows.forEach(b => {
        const overdue = b.status === 'Issued' && new Date(b.dueDate) < new Date();
        ctx += `  - Book: ${b.book?.name} | Member: ${b.member?.name} | Issued: ${b.issueDate} | Due: ${b.dueDate} | Return: ${b.returnDate || 'Not returned'} | Status: ${overdue ? 'OVERDUE' : b.status}\n`;
      });
    }

    if (fines.length) {
      ctx += `\n[FINES]: ${fines.length} fine(s):\n`;
      fines.forEach(f => {
        ctx += `  - Member: ${f.borrow?.member?.name} | Book: ${f.borrow?.book?.name} | Amount: ₹${f.fineAmount} | Date: ${f.fineDate} | Status: ${f.status}\n`;
      });
    }
  }

  if (/(member|student|staff)/.test(t)) {
    const members = await fetchData(`${BASE}/members`);
    if (members.length) {
      ctx += `\n[MEMBERS]: ${members.length} members:\n`;
      members.forEach(m => { ctx += `  - ${m.name} | ${m.email} | ${m.category}\n`; });
    }
  }

  return ctx;
};

const callGemini = async (systemPrompt, userMessage) => {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_KEY,
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser question: ${userMessage}` }],
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) return text;
  throw new Error('No response from Gemini');
};

const fallback = (text) => {
  const t = text.toLowerCase();
  if (/(hello|hi|hey)/.test(t)) return "Hello! 👋 I'm your Library Assistant. Ask me about books, borrows, or fines!";
  if (/(book|catalog|available)/.test(t)) return "📚 Check the Browse Books tab to see all available books.";
  if (/(borrow|issue|issued)/.test(t)) return "🔄 You can see all borrow records in My Borrows tab.";
  if (/(fine|penalty|overdue)/.test(t)) return "💰 Fines are assigned for overdue books. Check My Fines tab.";
  if (/(member|student|staff)/.test(t)) return "👥 Members can be managed in the Members section.";
  return "⚠️ Gemini is temporarily unavailable. Please try again shortly!";
};

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'bot',
    text: `👋 Hi ${user?.name || 'there'}! I'm your Library AI Assistant.\n\nI can help with:\n📚 Books in the library\n🔄 Borrow records\n💰 Fines & overdue books\n👥 Member information\n\nAsk me anything!`,
  }]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const userMsg = input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let backendCtx = '';
      if (needsBackend(userMsg)) {
        backendCtx = await buildContext(userMsg);
      }

      const systemPrompt = `You are an AI assistant for LibraryMS - a Library Management System.

USER INFO:
- Name: ${user?.name || 'Unknown'}
- Role: ${user?.role || 'Member'}

${backendCtx ? `LIVE LIBRARY DATA:\n${backendCtx}\nUse this data to answer accurately. Never make up data.` : ''}

GUIDELINES:
- Help with books, borrow records, overdue books, fines, members
- For backend data use only the data provided above
- For "how many" give exact count
- For "overdue" check OVERDUE status
- For "fines" give amounts and status
- Be concise, helpful, use emojis
- If no data say so clearly`;

      const reply = await callGemini(systemPrompt, userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages(prev => [...prev, { role: 'bot', text: fallback(userMsg) }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = [
    'How many books are there?',
    'Any overdue books?',
    'Show all fines',
    'How many members?',
  ];

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
                <div className="chatbot-name">Library AI Assistant</div>
                <div className="chatbot-status">🟢 Gemini · Online</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'bot' && <div className="chatbot-msg-avatar">🤖</div>}
                <div className="chatbot-msg-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}<br /></span>
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

          {messages.length === 1 && (
            <div className="chatbot-quick">
              {quickQuestions.map((q, i) => (
                <button key={i} className="chatbot-quick-btn" onClick={() => setInput(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask about books, borrows, fines..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}