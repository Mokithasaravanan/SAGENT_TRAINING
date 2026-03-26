import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const GEMINI_KEY = 'AIzaSyDFcCW-QRfeOBWqNi5A75kvFgZXCxl28uM';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const BASE = 'http://localhost:8080/api';

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
  return (
    /(my income|my expense|my budget|my balance|my goal|my saving|my notification|how much|how many|total income|total expense|remaining budget|net balance)/.test(t)
  );
};

const buildContext = async (text, user) => {
  const t = text.toLowerCase();
  let ctx = '';

  if (/(income|earning|salary|how much.*earn)/.test(t)) {
    const data = await fetchData(`${BASE}/income`);
    const mine = data.filter(i => i.user?.userId === user?.userId);
    if (!mine.length) {
      ctx += '\n[INCOME]: No income recorded yet.\n';
    } else {
      const total = mine.reduce((s, i) => s + i.amount, 0);
      ctx += `\n[INCOME]: ${mine.length} entry(s). Total: ₹${total}\n`;
      mine.slice(-5).forEach(i => {
        ctx += `  - Source: ${i.source} | Amount: ₹${i.amount} | Date: ${i.incomeDate}\n`;
      });
    }
  }

  if (/(expense|spend|spent|shopping|food|travel)/.test(t)) {
    const data = await fetchData(`${BASE}/expense`);
    const mine = data.filter(e => e.user?.userId === user?.userId);
    if (!mine.length) {
      ctx += '\n[EXPENSES]: No expenses recorded yet.\n';
    } else {
      const total = mine.reduce((s, e) => s + e.amount, 0);
      ctx += `\n[EXPENSES]: ${mine.length} entry(s). Total: ₹${total}\n`;
      mine.slice(-5).forEach(e => {
        ctx += `  - Category: ${e.category} | Amount: ₹${e.amount} | Date: ${e.spentDate}\n`;
      });
    }
  }

  if (/(budget|limit|monthly limit)/.test(t)) {
    const data = await fetchData(`${BASE}/budget`);
    if (!data.length) {
      ctx += '\n[BUDGET]: No budgets set yet.\n';
    } else {
      ctx += `\n[BUDGET]: ${data.length} budget(s):\n`;
      data.forEach(b => {
        ctx += `  - Month: ${b.month} | Limit: ₹${b.monthLimit}\n`;
      });
    }
  }

  if (/(balance|remaining|net|how much left)/.test(t)) {
    const bal = await fetchData(`${BASE}/balance/${user?.userId}`);
    if (bal && !Array.isArray(bal)) {
      ctx += `\n[BALANCE]:\n`;
      ctx += `  - Total Income:  ₹${bal.totalIncome}\n`;
      ctx += `  - Total Expense: ₹${bal.totalExpense}\n`;
      ctx += `  - Net Balance:   ₹${bal.balance}\n`;
    }
  }

  if (/(goal|saving goal|target|how much.*save)/.test(t)) {
    const data = await fetchData(`${BASE}/goals/${user?.userId}`);
    if (!data.length) {
      ctx += '\n[SAVINGS GOALS]: No goals set yet.\n';
    } else {
      ctx += `\n[SAVINGS GOALS]: ${data.length} goal(s):\n`;
      data.forEach(g => {
        const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
        ctx += `  - ${g.goalName} | Target: ₹${g.targetAmount} | Saved: ₹${g.currentAmount} | Progress: ${pct}%\n`;
      });
    }
  }

  if (/(notification|note|reminder)/.test(t)) {
    const data = await fetchData(`${BASE}/notifications`);
    const mine = data.filter(n => n.user?.userId === user?.userId);
    if (!mine.length) {
      ctx += '\n[NOTIFICATIONS]: No notes found.\n';
    } else {
      ctx += `\n[NOTIFICATIONS]: ${mine.length} note(s):\n`;
      mine.slice(-5).forEach(n => {
        ctx += `  - "${n.message}" | Date: ${n.sentDate}\n`;
      });
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
  if (/(hello|hi|hey)/.test(t))
    return "Hello! 👋 I'm your Budget Assistant. Ask me about your income, expenses, balance or goals!";
  if (/(save|saving tip)/.test(t))
    return "💡 Saving Tips:\n• Follow 50/30/20 rule\n• Track every expense\n• Set monthly budget limits\n• Automate savings";
  if (/(budget tip|how to budget)/.test(t))
    return "📊 Budgeting Tips:\n• List all income sources\n• Categorize expenses\n• Set limits per category\n• Review monthly";
  if (/(invest|investment)/.test(t))
    return "📈 Investment basics:\n• Start with emergency fund (3-6 months expenses)\n• Try SIP in mutual funds\n• PPF for tax saving\n• Diversify always";
  return "⚠️ I couldn't connect to Gemini right now. Please try again in a moment!";
};

export default function Chatbot({ user }) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'bot',
    text: `👋 Hi ${user?.name || 'there'}! I'm your AI Budget Assistant powered by Gemini.\n\nI can help with:\n💰 Your income & expenses\n⚖️ Your balance\n🎯 Your savings goals\n📅 Your budgets\n💡 Financial tips\n\nAsk me anything!`,
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
        backendCtx = await buildContext(userMsg, user);
      }

      const systemPrompt = `You are an AI financial assistant inside a Personal Budget Tracker app.

USER INFO:
- Name: ${user?.name || 'User'}
- User ID: ${user?.userId || 'Unknown'}

${backendCtx ? `LIVE FINANCIAL DATA:\n${backendCtx}\nUse this data to answer accurately. Never make up numbers.` : ''}

GUIDELINES:
- Help users understand their income, expenses, balance, and savings goals
- For "how many / how much" → give exact count or amount from the data
- For "latest" → show most recent record only
- For savings advice → give practical, realistic tips
- Keep answers concise, friendly, use emojis
- If data shows overspending → warn politely and suggest improvements
- Currency is Indian Rupees (₹)
- Be encouraging about savings goals`;

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
    'My balance',
    'My expenses',
    'My savings goals',
    'Give me saving tips',
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
                <div className="chatbot-name">AI Budget Assistant</div>
                <div className="chatbot-status">🟢 Gemini · Smart Finance Mode</div>
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
                <button key={i} className="chatbot-quick-btn" onClick={() => setInput(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask about your budget..."
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