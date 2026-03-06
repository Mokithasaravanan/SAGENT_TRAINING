import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Chatbot.css';

const GEMINI_KEY = 'AIzaSyDFcCW-QRfeOBWqNi5A75kvFgZXCxl28uM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
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
  return (
    /(my application|how many application|my status|application status|applied|submitted)/.test(t) ||
    /(my course|available course|which course|course fee|course duration|course list)/.test(t) ||
    /(my document|uploaded document|document status|my file)/.test(t) ||
    /(my payment|payment status|paid|fee paid|payment mode|payment date)/.test(t) ||
    /(my profile|my detail|my phone|my address|my dob|my gender)/.test(t)
  );
};

const buildContext = async (text, user, userRole) => {
  const t = text.toLowerCase();
  let ctx = '';

  if (/(application|status|applied|submitted|course|accepted|rejected|review)/.test(t)) {
    const data = await fetchData(`${BASE}/applications`);
    const mine = userRole === 'student'
      ? data.filter(a => a.student?.studentId === user?.studentId)
      : data;
    if (!mine.length) {
      ctx += '\n[APPLICATIONS]: No applications found.\n';
    } else {
      ctx += `\n[APPLICATIONS]: ${mine.length} application(s):\n`;
      mine.forEach(a => {
        ctx += `  - App #${a.applicationId} | Course: ${a.course?.name || 'N/A'} | Status: ${a.status || 'Submitted'} | Applied: ${a.appliedDate || 'N/A'}`;
        if (userRole === 'officer') ctx += ` | Student: ${a.student?.name || 'N/A'}`;
        ctx += '\n';
      });
    }
  }

  if (/(course|program|duration|fee|subject|structure)/.test(t)) {
    const data = await fetchData(`${BASE}/courses`);
    if (!data.length) {
      ctx += '\n[COURSES]: No courses found.\n';
    } else {
      ctx += `\n[COURSES]: ${data.length} course(s) available:\n`;
      data.forEach(c => {
        ctx += `  - ${c.name} | Duration: ${c.duration || 'N/A'} | Fee: ₹${c.fee || 'N/A'} | Structure: ${c.structure || 'N/A'}\n`;
      });
    }
  }

  if (/(document|uploaded|file|marksheet|id proof|certificate)/.test(t)) {
    const data = await fetchData(`${BASE}/documents`);
    const mine = userRole === 'student'
      ? data.filter(d => d.application?.student?.studentId === user?.studentId)
      : data;
    if (!mine.length) {
      ctx += '\n[DOCUMENTS]: No documents uploaded.\n';
    } else {
      ctx += `\n[DOCUMENTS]: ${mine.length} document(s):\n`;
      mine.forEach(d => {
        ctx += `  - Doc #${d.documentId} | Type: ${d.docType} | Uploaded: ${d.uploadedDate || 'N/A'}`;
        if (userRole === 'officer') ctx += ` | Student: ${d.application?.student?.name || 'N/A'}`;
        ctx += '\n';
      });
    }
  }

  if (/(payment|paid|fee|mode|upi|transaction|deadline)/.test(t)) {
    const data = await fetchData(`${BASE}/payments`);
    const mine = userRole === 'student'
      ? data.filter(p => p.application?.student?.studentId === user?.studentId)
      : data;
    if (!mine.length) {
      ctx += '\n[PAYMENTS]: No payments found.\n';
    } else {
      ctx += `\n[PAYMENTS]: ${mine.length} payment(s):\n`;
      mine.forEach(p => {
        ctx += `  - Pay #${p.paymentId} | Mode: ${p.paymentMode || 'N/A'} | Status: ${p.status || 'N/A'} | Date: ${p.paymentDate || 'N/A'} | Deadline: ${p.deadline || 'N/A'} | App #${p.application?.applicationId || 'N/A'}`;
        if (userRole === 'officer') ctx += ` | Student: ${p.application?.student?.name || 'N/A'}`;
        ctx += '\n';
      });
    }
  }

  if (/(my profile|my detail|my info|my phone|my address|my dob|my gender|my name|my email)/.test(t)) {
    if (userRole === 'student') {
      ctx += `\n[MY PROFILE]:\n`;
      ctx += `  - Name: ${user.name}\n`;
      ctx += `  - Email: ${user.email}\n`;
      ctx += `  - Phone: ${user.phnNo || 'Not set'}\n`;
      ctx += `  - DOB: ${user.dob || 'Not set'}\n`;
      ctx += `  - Gender: ${user.gender || 'Not set'}\n`;
      ctx += `  - Address: ${user.address || 'Not set'}\n`;
    } else {
      ctx += `\n[MY PROFILE]:\n`;
      ctx += `  - Name: ${user.name}\n`;
      ctx += `  - Email: ${user.mail || 'Not set'}\n`;
      ctx += `  - Phone: ${user.phnNo || 'Not set'}\n`;
    }
  }

  return ctx;
};

const callGemini = async (systemPrompt, userMessage) => {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    return "👋 Hello! I'm your EduPortal assistant. Ask me about applications, courses, documents, or payments!";
  if (/(how to apply|apply for|submit application)/.test(t))
    return "📋 To apply:\n1. Go to My Applications\n2. Click '+ New Application'\n3. Select your course\n4. Fill in details & pay the fee\n5. Click Submit!";
  if (/(document|upload)/.test(t))
    return "📁 To upload documents:\n1. Go to Documents\n2. Click '+ Upload Document'\n3. Select your application\n4. Choose document type\n5. Upload!";
  if (/(payment|fee|pay)/.test(t))
    return "💳 Payments are recorded automatically when you submit an application. Go to Payments page to view your payment history.";
  if (/(status|accepted|rejected|review)/.test(t))
    return "📊 Application statuses:\n• Submitted — Received by college\n• Under Review — Officer is reviewing\n• Accepted — Congratulations! 🎉\n• Rejected — You may reapply";
  if (/(course|program)/.test(t))
    return "🎓 Go to the Courses page to browse all available programs with duration, fees, and course structure!";
  if (/(deadline|last date)/.test(t))
    return "⏰ Check the Payments page for payment deadlines linked to your application.";
  return "⚠️ I'm having trouble connecting. Please try again in a moment!";
};

const studentQuick = ['My applications', 'My payment status', 'Available courses', 'How to upload documents?'];
const officerQuick = ['All applications', 'Pending applications', 'All payments', 'All courses'];

export default function Chatbot() {
  const { currentUser, userRole } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const welcomeMsg = userRole === 'officer'
    ? `👋 Hi Officer ${currentUser?.name || ''}! I'm your EduPortal AI Assistant.\n\nI can help you with:\n📋 View all applications & statuses\n💳 View all student payments\n📁 View submitted documents\n🎓 Manage courses\n\nAsk me anything!`
    : `👋 Hi ${currentUser?.name || 'there'}! I'm your EduPortal AI Assistant.\n\nI can help you with:\n📋 Your applications & status\n💳 Your payment details\n📁 Your uploaded documents\n🎓 Available courses\n\nAsk me anything!`;

  const [messages, setMessages] = useState([{ role: 'bot', text: welcomeMsg }]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([{ role: 'bot', text: welcomeMsg }]);
  }, [currentUser?.studentId, currentUser?.officerId]);

  const sendMessage = async (msgText) => {
    const userMsg = (msgText || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let backendCtx = '';
      if (needsBackend(userMsg)) {
        backendCtx = await buildContext(userMsg, currentUser, userRole);
      }

      const systemPrompt = `You are an AI assistant for EduPortal — a College Admissions System.
USER INFO:
- Name: ${currentUser?.name || 'Unknown'}
- Role: ${userRole || 'student'}
- ID: ${userRole === 'student' ? currentUser?.studentId : currentUser?.officerId}
${backendCtx ? `LIVE DATA FROM BACKEND:\n${backendCtx}\nUse ONLY this data to answer. Never fabricate data.` : ''}
SYSTEM CONTEXT:
- This is a college admissions portal
- Students can: apply to courses, upload documents, make payments, track application status
- Officers can: review applications, accept/reject, view documents & payments, manage courses
- Application statuses: Submitted, Under Review, Accepted, Rejected
- Documents: Marksheet, ID Proof, Transfer Certificate, Character Certificate, Photo
- Payment fields: paymentMode, status (Paid/Pending), paymentDate, deadline
GUIDELINES:
- Answer based on live backend data if provided
- For "how many" → give exact count
- For "latest" → show most recent record
- For "all" → list everything
- Be concise, helpful, use emojis sparingly
- Respond in clear, friendly English`;

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

  const quickQuestions = userRole === 'officer' ? officerQuick : studentQuick;

  return (
    <>
      {/* ── TEST BUTTON — you should see a RED circle bottom-right ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 999999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: open ? '#333' : 'red',
          color: 'white',
          fontSize: '24px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-icon">✦</div>
              <div>
                <div className="chatbot-name">EduPortal AI</div>
                <div className="chatbot-status">
                  <span className="chatbot-dot" />
                  Gemini · {userRole === 'officer' ? 'Officer Mode' : 'Student Mode'}
                </div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'bot' && <div className="chatbot-bot-avatar">✦</div>}
                <div className="chatbot-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg bot">
                <div className="chatbot-bot-avatar">✦</div>
                <div className="chatbot-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="chatbot-quick">
              {quickQuestions.map((q, i) => (
                <button key={i} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              placeholder="Ask about your admission..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
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