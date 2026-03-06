import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../../components/Chatbot';

const API = 'http://localhost:8081/api';
const BOOKS_PER_PAGE = 8;

const BOOK_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=220&fit=crop',
];

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [fines, setFines] = useState([]);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowForm, setBorrowForm] = useState({ issueDate: '', dueDate: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = ['📚 Browse Books', '🔄 My Borrows', '💰 My Fines'];
  const myId = user?.memId || user?.id;

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(API + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  };

  const fetchAll = async () => {
    try {
      const [b, br, f] = await Promise.all([
        apiFetch('/books'),
        apiFetch('/borrow'),
        apiFetch('/fines'),
      ]);
      setBooks(b);
      setBorrows(br.filter(borrow => borrow.member?.memId === myId));
      setFines(f.filter(fine => fine.borrow?.member?.memId === myId));
    } catch (e) {
      showMsg('Failed to load data.', 'error');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const openBorrowModal = (book) => {
    setSelectedBook(book);
    const today = new Date().toISOString().split('T')[0];
    setBorrowForm({ issueDate: today, dueDate: '' });
    setShowBorrowModal(true);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/borrow', {
        method: 'POST',
        body: JSON.stringify({
          book: { bookId: selectedBook.bookId },
          member: { memId: myId },
          issueDate: borrowForm.issueDate,
          dueDate: borrowForm.dueDate,
          status: 'Issued'
        })
      });
      showMsg(`"${selectedBook.name}" borrowed successfully!`);
      setShowBorrowModal(false);
      fetchAll();
    } catch {
      showMsg('Failed to borrow book.', 'error');
    }
  };

  const isOverdue = (b) => b.status === 'Issued' && new Date(b.dueDate) < new Date();
  const unpaidFines = fines.filter(f => f.status === 'Unpaid').reduce((s, f) => s + (f.fineAmount || 0), 0);

  const filteredBooks = books.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };
  const todayStr = new Date().toISOString().split('T')[0];

  const inputStyle = {
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(212,130,42,0.3)',
    borderRadius: '10px',
    color: '#f5f0e8',
    fontSize: '0.93rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    colorScheme: 'dark',
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', background: '#0a0806' }}>

      {/* ══ BACKGROUND IMAGE ══ */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        filter: 'brightness(0.18) saturate(1.2)',
      }} />

      {/* ══ GRADIENT OVERLAY ══ */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(160deg, rgba(10,8,6,0.8) 0%, rgba(30,20,10,0.65) 50%, rgba(10,8,6,0.8) 100%)',
      }} />

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8,6,4,0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(212,130,42,0.25)',
        padding: '0 2rem',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>📖</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#d4822a', fontWeight: 700, letterSpacing: '0.02em' }}>
            LibraryMS
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>👤 {user?.name}</span>
          <span style={{
            background: 'rgba(212,130,42,0.12)',
            color: '#d4822a',
            border: '1px solid rgba(212,130,42,0.35)',
            padding: '0.22rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}>
            LIB-{String(myId || '').padStart(5, '0')}
          </span>
          {unpaidFines > 0 && (
            <span style={{
              background: 'rgba(192,57,43,0.2)',
              color: '#ff8a7a',
              border: '1px solid rgba(192,57,43,0.4)',
              padding: '0.22rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              ₹{unpaidFines} fine pending
            </span>
          )}
          <button onClick={handleLogout} style={{
            padding: '0.42rem 1.1rem',
            background: 'rgba(192,57,43,0.2)',
            color: '#ff8a7a',
            border: '1px solid rgba(192,57,43,0.35)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>Logout</button>
        </div>
      </nav>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* Welcome Banner */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.75rem 2rem',
          background: 'rgba(20,14,8,0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(212,130,42,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: '0 0 0.4rem', textShadow: '0 2px 12px rgba(0,0,0,0.6)', fontFamily: 'Georgia, serif' }}>
              Welcome, {user?.name?.split(' ')[0] || 'Member'} 👋
            </h1>
            <p style={{ color: 'rgba(212,130,42,0.7)', fontSize: '0.9rem', margin: 0 }}>
              Library ID:&nbsp;
              <code style={{
                background: 'rgba(212,130,42,0.15)',
                color: '#d4822a',
                padding: '0.15rem 0.55rem',
                borderRadius: '5px',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
              }}>
                LIB-{String(myId || '').padStart(5, '0')}
              </code>
              &nbsp;·&nbsp;
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                {borrows.filter(b => b.status === 'Issued').length} book(s) currently borrowed
              </span>
              {unpaidFines > 0 && (
                <span style={{ color: '#ff8a7a', fontWeight: 600 }}>
                  &nbsp;·&nbsp;₹{unpaidFines} fine pending
                </span>
              )}
            </p>
          </div>
          {/* Mini decorative book row */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end' }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 28,
                height: [55,70,65,80,60][i],
                borderRadius: '3px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                flexShrink: 0,
                opacity: 0.85,
              }}>
                <img
                  src={BOOK_COVERS[i]}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? 'rgba(192,57,43,0.22)' : 'rgba(39,174,96,0.22)',
            color: msg.type === 'error' ? '#ff8a7a' : '#5deb9a',
            border: `1px solid ${msg.type === 'error' ? 'rgba(192,57,43,0.45)' : 'rgba(39,174,96,0.4)'}`,
            borderRadius: '11px',
            padding: '0.88rem 1.1rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)',
            fontSize: '0.93rem',
          }}>
            {msg.text}
          </div>
        )}

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          gap: '0.3rem',
          marginBottom: '2rem',
          background: 'rgba(15,11,7,0.75)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(212,130,42,0.2)',
          borderRadius: '14px',
          padding: '0.4rem',
          flexWrap: 'wrap',
        }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '0.6rem 1.4rem',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: '0.9rem',
              fontWeight: activeTab === i ? 700 : 400,
              background: activeTab === i
                ? 'linear-gradient(135deg, #d4822a 0%, #a05a1a 100%)'
                : 'transparent',
              color: activeTab === i ? 'white' : 'rgba(255,255,255,0.42)',
              transition: 'all 0.22s',
              boxShadow: activeTab === i ? '0 4px 16px rgba(212,130,42,0.38)' : 'none',
            }}>{t}</button>
          ))}
        </div>

        {/* ══ BROWSE BOOKS ══ */}
        {activeTab === 0 && (
          <>
            {/* Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              borderRadius: '14px',
              padding: '0.65rem 1.1rem',
              border: '1px solid rgba(212,130,42,0.22)',
              maxWidth: 460,
              marginBottom: '2rem',
            }}>
              <span style={{ color: '#d4822a', fontSize: '1.1rem' }}>🔍</span>
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by title or author..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#f5f0e8',
                  fontSize: '0.95rem',
                  fontFamily: 'Georgia, serif',
                  flex: 1,
                }}
              />
              {search && (
                <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              )}
            </div>

            {filteredBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.35)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
                No books found.
              </div>
            ) : (
              <>
                {/* Book Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2.5rem',
                }}>
                  {paginatedBooks.map((book, i) => {
                    const coverIdx = (i + (currentPage - 1) * BOOKS_PER_PAGE) % BOOK_COVERS.length;
                    return (
                      <div
                        key={book.bookId}
                        style={{
                          background: 'rgba(18,13,9,0.82)',
                          backdropFilter: 'blur(14px)',
                          WebkitBackdropFilter: 'blur(14px)',
                          border: '1px solid rgba(212,130,42,0.18)',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                          e.currentTarget.style.boxShadow = '0 20px 50px rgba(212,130,42,0.25)';
                          e.currentTarget.style.borderColor = 'rgba(212,130,42,0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = 'rgba(212,130,42,0.18)';
                        }}
                      >
                        {/* Book Cover */}
                        <div style={{ position: 'relative', height: 175, overflow: 'hidden', flexShrink: 0 }}>
                          <img
                            src={BOOK_COVERS[coverIdx]}
                            alt="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transition: 'transform 0.4s ease',
                            }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                          />
                          {/* Bottom fade */}
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(8,5,3,0.95) 0%, rgba(8,5,3,0.3) 50%, transparent 100%)',
                          }} />
                          {/* Book ID */}
                          <div style={{
                            position: 'absolute',
                            top: 10, right: 10,
                            background: 'rgba(212,130,42,0.92)',
                            color: 'white',
                            fontSize: '0.67rem',
                            fontWeight: 800,
                            padding: '0.22rem 0.55rem',
                            borderRadius: '6px',
                            letterSpacing: '0.05em',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          }}>
                            #{String(book.bookId).padStart(4, '0')}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div style={{
                          padding: '1.1rem 1.1rem 1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.55rem',
                          flex: 1,
                        }}>
                          <h3 style={{
                            color: '#f5f0e8',
                            fontSize: '1rem',
                            margin: 0,
                            lineHeight: 1.4,
                            fontFamily: 'Georgia, serif',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>{book.name}</h3>
                          <p style={{
                            color: 'rgba(212,130,42,0.72)',
                            fontSize: '0.83rem',
                            margin: 0,
                          }}>✍️ {book.author}</p>

                          <button
                            onClick={() => openBorrowModal(book)}
                            style={{
                              marginTop: 'auto',
                              padding: '0.65rem',
                              background: 'linear-gradient(135deg, #d4822a 0%, #b56820 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontFamily: 'Georgia, serif',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              boxShadow: '0 4px 16px rgba(212,130,42,0.38)',
                              transition: 'opacity 0.18s, transform 0.18s',
                              letterSpacing: '0.02em',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            Borrow this Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.55rem',
                    marginBottom: '1rem',
                  }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.6rem 1.3rem',
                        background: currentPage === 1 ? 'rgba(255,255,255,0.04)' : 'rgba(212,130,42,0.16)',
                        border: '1px solid rgba(212,130,42,0.3)',
                        borderRadius: '10px',
                        color: currentPage === 1 ? 'rgba(255,255,255,0.18)' : '#d4822a',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                      }}
                    >← Prev</button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          width: 42, height: 42,
                          background: currentPage === page
                            ? 'linear-gradient(135deg, #d4822a, #a05a1a)'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${currentPage === page ? 'transparent' : 'rgba(212,130,42,0.22)'}`,
                          borderRadius: '10px',
                          color: currentPage === page ? 'white' : 'rgba(255,255,255,0.42)',
                          cursor: 'pointer',
                          fontFamily: 'Georgia, serif',
                          fontSize: '0.92rem',
                          fontWeight: currentPage === page ? 700 : 400,
                          boxShadow: currentPage === page ? '0 4px 16px rgba(212,130,42,0.42)' : 'none',
                          transition: 'all 0.18s',
                        }}
                      >{page}</button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.6rem 1.3rem',
                        background: currentPage === totalPages ? 'rgba(255,255,255,0.04)' : 'rgba(212,130,42,0.16)',
                        border: '1px solid rgba(212,130,42,0.3)',
                        borderRadius: '10px',
                        color: currentPage === totalPages ? 'rgba(255,255,255,0.18)' : '#d4822a',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                      }}
                    >Next →</button>
                  </div>
                )}

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  Showing {(currentPage - 1) * BOOKS_PER_PAGE + 1}–{Math.min(currentPage * BOOKS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
                </p>
              </>
            )}
          </>
        )}

        {/* ══ MY BORROWS ══ */}
        {activeTab === 1 && (
          <div style={{
            background: 'rgba(15,11,7,0.78)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(212,130,42,0.2)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.3rem 1.6rem', borderBottom: '1px solid rgba(212,130,42,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🔄</span>
              <h2 style={{ color: '#f5f0e8', fontSize: '1.15rem', margin: 0, fontFamily: 'Georgia, serif' }}>
                My Borrows ({borrows.length})
              </h2>
            </div>
            {borrows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                You have not borrowed any books yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: 'rgba(212,130,42,0.08)' }}>
                      {['Book', 'Issue Date', 'Due Date', 'Return Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.map(b => {
                      const overdue = isOverdue(b);
                      let badge;
                      if (overdue) badge = { bg: 'rgba(192,57,43,0.22)', color: '#ff8a7a', border: 'rgba(192,57,43,0.45)', label: '⚠️ Overdue' };
                      else if (b.status === 'Returned') badge = { bg: 'rgba(39,174,96,0.2)', color: '#5deb9a', border: 'rgba(39,174,96,0.4)', label: '✅ Returned' };
                      else badge = { bg: 'rgba(41,128,185,0.2)', color: '#5dade2', border: 'rgba(41,128,185,0.4)', label: '📤 Issued' };
                      return (
                        <tr key={b.borrowId}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: overdue ? 'rgba(192,57,43,0.03)' : undefined }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = overdue ? 'rgba(192,57,43,0.03)' : 'transparent'}
                        >
                          <td style={{ padding: '0.95rem 1rem' }}>
                            <strong style={{ color: '#f5f0e8', display: 'block' }}>{b.book?.name}</strong>
                            <span style={{ color: 'rgba(212,130,42,0.65)', fontSize: '0.78rem' }}>{b.book?.author}</span>
                          </td>
                          <td style={{ padding: '0.95rem 1rem', color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem' }}>{b.issueDate || '—'}</td>
                          <td style={{ padding: '0.95rem 1rem', color: overdue ? '#ff8a7a' : 'rgba(255,255,255,0.48)', fontWeight: overdue ? 700 : 400, fontSize: '0.88rem' }}>{b.dueDate || '—'}</td>
                          <td style={{ padding: '0.95rem 1rem', color: 'rgba(255,255,255,0.38)', fontSize: '0.88rem' }}>{b.returnDate || '—'}</td>
                          <td style={{ padding: '0.95rem 1rem' }}>
                            <span style={{ display: 'inline-block', padding: '0.26rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ MY FINES ══ */}
        {activeTab === 2 && (
          <div style={{
            background: 'rgba(15,11,7,0.78)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(212,130,42,0.2)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.3rem 1.6rem', borderBottom: '1px solid rgba(212,130,42,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💰</span>
                <h2 style={{ color: '#f5f0e8', fontSize: '1.15rem', margin: 0, fontFamily: 'Georgia, serif' }}>My Fines ({fines.length})</h2>
              </div>
              {unpaidFines > 0 && (
                <span style={{ display: 'inline-block', padding: '0.26rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, background: 'rgba(192,57,43,0.22)', color: '#ff8a7a', border: '1px solid rgba(192,57,43,0.45)' }}>
                  ₹{unpaidFines} unpaid
                </span>
              )}
            </div>
            {fines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                No fines! You are all clear.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr style={{ background: 'rgba(212,130,42,0.08)' }}>
                      {['Book', 'Fine Amount', 'Fine Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map(f => (
                      <tr key={f.fineId}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.95rem 1rem', color: '#f5f0e8', fontWeight: 600 }}>{f.borrow?.book?.name || '—'}</td>
                        <td style={{ padding: '0.95rem 1rem', fontWeight: 700, color: '#ff8a7a', fontSize: '1rem' }}>₹{f.fineAmount}</td>
                        <td style={{ padding: '0.95rem 1rem', color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem' }}>{f.fineDate || '—'}</td>
                        <td style={{ padding: '0.95rem 1rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.26rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: f.status === 'Paid' ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.22)', color: f.status === 'Paid' ? '#5deb9a' : '#ff8a7a', border: `1px solid ${f.status === 'Paid' ? 'rgba(39,174,96,0.4)' : 'rgba(192,57,43,0.45)'}` }}>
                            {f.status === 'Paid' ? '✅ Paid' : '❌ Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ══ BORROW MODAL ══ */}
      {showBorrowModal && selectedBook && (
        <div
          onClick={() => setShowBorrowModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(15,11,7,0.97)', border: '1px solid rgba(212,130,42,0.35)', borderRadius: '22px', padding: '2.2rem', width: '100%', maxWidth: 470, boxShadow: '0 32px 90px rgba(0,0,0,0.8)' }}
          >
            <h2 style={{ color: '#f5f0e8', marginBottom: '1.1rem', fontFamily: 'Georgia, serif', fontSize: '1.35rem' }}>
              📗 Borrow Book
            </h2>

            {/* Book Preview */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(212,130,42,0.08)', border: '1px solid rgba(212,130,42,0.22)', borderRadius: '14px', padding: '1rem', marginBottom: '1.6rem' }}>
              <img
                src={BOOK_COVERS[books.findIndex(b => b.bookId === selectedBook.bookId) % BOOK_COVERS.length]}
                alt="cover"
                style={{ width: 55, height: 74, objectFit: 'cover', borderRadius: '7px', flexShrink: 0, boxShadow: '0 5px 16px rgba(0,0,0,0.45)' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#f5f0e8', fontSize: '1.02rem', lineHeight: 1.35 }}>{selectedBook.name}</div>
                <div style={{ color: 'rgba(212,130,42,0.72)', fontSize: '0.86rem', marginTop: '0.3rem' }}>by {selectedBook.author}</div>
              </div>
            </div>

            <form onSubmit={handleBorrow}>
              {[
                { label: 'Issue Date', key: 'issueDate', min: todayStr },
                { label: 'Due Date', key: 'dueDate', min: borrowForm.issueDate || todayStr },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
                    {f.label}
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={borrowForm[f.key]}
                    onChange={e => setBorrowForm({ ...borrowForm, [f.key]: e.target.value })}
                    required
                    min={f.min}
                    onFocus={e => e.target.style.borderColor = '#d4822a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.3)'}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.4rem' }}>
                <button type="button" onClick={() => setShowBorrowModal(false)} style={{ padding: '0.68rem 1.4rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.32)', borderRadius: '10px', color: 'rgba(255,255,255,0.52)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.92rem' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.68rem 1.6rem', background: 'linear-gradient(135deg, #d4822a, #a05a1a)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 18px rgba(212,130,42,0.42)' }}>
                  Confirm Borrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default UserDashboard;