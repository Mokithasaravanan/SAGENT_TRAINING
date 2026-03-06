import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const GEMINI_KEY = 'AIzaSyDFcCW-QRfeOBWqNi5A75kvFgZXCxl28uM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
const BASE = 'http://localhost:8080/api'; // Change to your actual backend URL

// ─── Fetch backend data safely ────────────────────────────────────
const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return [];
  }
};

// ─── Check if query needs backend data ───────────────────────────
const needsBackend = (text) => {
  const t = text.toLowerCase();
  return (
    /(my order|track order|order status|where is my|latest order|past order|order history)/.test(t) ||
    /(my cart|what's in my cart|cart items)/.test(t) ||
    /(my address|delivery address|saved address)/.test(t) ||
    /(my account|my profile|my wallet|my points|loyalty)/.test(t) ||
    /(promo|coupon|discount|offer|deal)/.test(t)
  );
};

// ─── Build backend context for Gemini ────────────────────────────
const buildContext = async (text, user) => {
  const t = text.toLowerCase();
  let ctx = '';

  if (/(order|track)/.test(t)) {
    const data = await fetchData(`${BASE}/orders?userId=${user?.id}`);
    const orders = Array.isArray(data) ? data : data.orders || [];
    if (!orders.length) {
      ctx += '\n[ORDERS]: No orders found.\n';
    } else {
      ctx += `\n[ORDERS]: ${orders.length} order(s):\n`;
      orders.slice(-5).forEach(o => {
        ctx += `  - #${o.orderId || o.id} | Date: ${o.orderDate || o.createdAt} | Status: ${o.status} | Total: ₹${o.totalAmount || o.total} | Items: ${o.itemCount || (o.items?.length || 'N/A')}\n`;
      });
    }
  }

  if (/(promo|coupon|offer|deal|discount)/.test(t)) {
    const data = await fetchData(`${BASE}/promotions`);
    const promos = Array.isArray(data) ? data : [];
    if (!promos.length) {
      ctx += '\n[PROMOTIONS]: No active promotions found.\n';
    } else {
      ctx += `\n[ACTIVE PROMOTIONS]:\n`;
      promos.forEach(p => {
        ctx += `  - Code: ${p.code} | ${p.description} | Valid till: ${p.validTill}\n`;
      });
    }
  }

  if (/(cart)/.test(t)) {
    const data = await fetchData(`${BASE}/cart?userId=${user?.id}`);
    const items = data?.items || [];
    if (!items.length) {
      ctx += '\n[CART]: Cart is empty.\n';
    } else {
      ctx += `\n[CART]: ${items.length} item(s):\n`;
      items.forEach(i => {
        ctx += `  - ${i.name} x${i.quantity} = ₹${i.price * i.quantity}\n`;
      });
    }
  }

  return ctx;
};

// ─── Call Gemini ──────────────────────────────────────────────────
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

// ─── Rule-based fallback ──────────────────────────────────────────
const fallback = (text) => {
  const t = text.toLowerCase();
  if (/(hello|hi|hey)/.test(t))
    return "👋 Hey there! I'm GrocyBot, your grocery shopping assistant! How can I help you today?";
  if (/(delivery time|how long|when will)/.test(t))
    return "🚚 Our delivery time is typically 30–60 minutes depending on your location and order size!";
  if (/(minimum order|min order)/.test(t))
    return "🛒 Our minimum order value is ₹99. Free delivery on orders above ₹499!";
  if (/(fresh|organic|quality)/.test(t))
    return "🌿 All our fruits & vegetables are sourced fresh daily from local farms. Organic options are marked with 🌱!";
  if (/(return|refund|replace)/.test(t))
    return "↩️ Not happy with your order? We offer easy returns within 24 hours. Contact support and we'll make it right!";
  if (/(payment|pay|upi|card|cod)/.test(t))
    return "💳 We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery!";
  if (/(cancel|cancellation)/.test(t))
    return "❌ You can cancel your order within 5 minutes of placing it. Go to My Orders → Cancel Order.";
  if (/(track|tracking|where is)/.test(t))
    return "📍 You can track your order live in My Orders section. We'll also send you SMS updates!";
  if (/(offer|discount|coupon|promo)/.test(t))
    return "🏷️ Check the Offers section for today's deals! Use code FRESH10 for 10% off on your first order.";
  if (/(store|timing|open)/.test(t))
    return "⏰ We operate 24/7! Orders placed before midnight are delivered the same day.";
  return "⚠️ I'm having a little trouble right now. Please try again or contact our support team! 🛒";
};

// ─── Component ────────────────────────────────────────────────────
export default function Chatbot({ user }) {
  // If you use a context like useAuth, replace the prop with: const { user } = useAuth();

  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'bot',
    text: `👋 Hi ${user?.name || 'there'}! I'm GrocyBot 🛒\n\nI'm here to help you with:\n📦 Track your orders\n🏷️ Latest offers & coupons\n🚚 Delivery info\n🛒 Cart & checkout help\n🌿 Product freshness & quality\n\nWhat can I get for you today?`,
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
      if (needsBackend(userMsg) && user) {
        backendCtx = await buildContext(userMsg, user);
      }

      const systemPrompt = `You are GrocyBot, a friendly and helpful AI assistant for a grocery delivery app.

USER INFO:
- Name: ${user?.name || 'Guest'}
- User ID: ${user?.id || 'Unknown'}
- Location: ${user?.address || 'Not set'}

${backendCtx ? `LIVE BACKEND DATA:\n${backendCtx}\nUse this data to answer accurately. Never make up data.` : ''}

APP POLICIES:
- Delivery time: 30–60 minutes
- Minimum order: ₹99
- Free delivery on orders above ₹499
- Return policy: within 24 hours of delivery
- Cancellation: within 5 minutes of placing order
- Payment methods: UPI, Cards, Net Banking, Cash on Delivery
- Operating hours: 24/7
- First order promo code: FRESH10 (10% off)

GUIDELINES:
- Be friendly, warm, and use food/grocery related emojis naturally
- Keep responses concise and helpful
- For order tracking: use backend data provided above
- For general questions: use app policies
- For product availability: suggest checking the app's search feature
- If user is frustrated: empathize and offer to escalate to support
- Never make up product prices or availability
- Always stay in the context of a grocery delivery assistant`;

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
    '🚚 Track my order',
    '🏷️ Today\'s offers',
    '↩️ Return policy',
    '💳 Payment options',
  ];

  return (
    <>
      {/* Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setOpen(!open)} title="Chat with GrocyBot">
        {open ? '✕' : '🛒'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🛒</div>
              <div>
                <div className="chatbot-name">GrocyBot</div>
                <div className="chatbot-status">🟢 Online · Your grocery assistant</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'bot' && <div className="chatbot-msg-avatar">🛒</div>}
                <div className="chatbot-msg-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg bot">
                <div className="chatbot-msg-avatar">🛒</div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="chatbot-quick">
              {quickQuestions.map((q, i) => (
                <button key={i} className="chatbot-quick-btn"
                  onClick={() => { setInput(q.replace(/^[^\w]+ ?/, '')); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask me anything about your order..."
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