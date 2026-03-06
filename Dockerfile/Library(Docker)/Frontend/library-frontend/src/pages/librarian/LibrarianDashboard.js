import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:8081/api';
const ITEMS_PER_PAGE = 8;

const BOOK_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=120&h=160&fit=crop',
];

const LibrarianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [fines, setFines] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [bookForm, setBookForm] = useState({ name: '', author: '' });
  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [fineAmount, setFineAmount] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [backendOnline, setBackendOnline] = useState(true);

  // Pagination states
  const [booksPage, setBooksPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);
  const [borrowsPage, setBorrowsPage] = useState(1);
  const [finesPage, setFinesPage] = useState(1);

  const tabs = ['📊 Overview', '📚 Books', '👥 Members', '🔄 Borrows', '💰 Fines'];

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
      const [b, m, br, f] = await Promise.all([
        apiFetch('/books'),
        apiFetch('/members'),
        apiFetch('/borrow'),
        apiFetch('/fines'),
      ]);
      setBooks(b);
      setMembers(m);
      setBorrows([...br].reverse());
      setFines(f);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
      showMsg('Backend not connected. Start your Spring Boot server on port 8081.', 'error');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const openAddBook = () => { setEditBook(null); setBookForm({ name: '', author: '' }); setShowBookModal(true); };
  const openEditBook = (book) => { setEditBook(book); setBookForm({ name: book.name, author: book.author }); setShowBookModal(true); };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editBook) {
        await apiFetch(`/books/${editBook.bookId}`, { method: 'PUT', body: JSON.stringify(bookForm) });
        showMsg('Book updated successfully!');
      } else {
        await apiFetch('/books', { method: 'POST', body: JSON.stringify(bookForm) });
        showMsg('Book added successfully!');
      }
      setShowBookModal(false);
      fetchAll();
    } catch { showMsg('Failed to save book.', 'error'); }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await fetch(`${API}/books/${id}`, { method: 'DELETE' });
      showMsg('Book deleted!');
      fetchAll();
    } catch { showMsg('Delete failed.', 'error'); }
  };

  const openFineModal = (borrow) => {
    setSelectedBorrow(borrow);
    setFineAmount('');
    setShowFineModal(true);
  };

  const handleAssignFine = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/fines', {
        method: 'POST',
        body: JSON.stringify({
          borrow: { borrowId: selectedBorrow.borrowId },
          fineAmount: parseFloat(fineAmount),
          fineDate: new Date().toISOString().split('T')[0],
          status: 'Unpaid'
        })
      });
      showMsg(`Fine of ₹${fineAmount} assigned to ${selectedBorrow.member?.name}!`);
      setShowFineModal(false);
      fetchAll();
    } catch { showMsg('Failed to assign fine.', 'error'); }
  };

  const isOverdue = (b) => b.status === 'Issued' && new Date(b.dueDate) < new Date();
  const hasFine = (borrowId) => fines.some(f => f.borrow?.borrowId === borrowId);
  const overdueBorrows = borrows.filter(isOverdue);
  const filteredBooks = books.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination helpers
  const paginate = (arr, page) => arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = (arr) => Math.ceil(arr.length / ITEMS_PER_PAGE);

  const Pagination = ({ page, setPage, total }) => {
    if (total <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            padding: '0.5rem 1.1rem',
            background: page === 1 ? 'rgba(255,255,255,0.04)' : 'rgba(212,130,42,0.15)',
            border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px',
            color: page === 1 ? 'rgba(255,255,255,0.18)' : '#d4822a',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '0.9rem',
          }}>← Prev</button>
        {Array.from({ length: total }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            width: 36, height: 36,
            background: page === p ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${page === p ? 'transparent' : 'rgba(212,130,42,0.2)'}`,
            borderRadius: '8px',
            color: page === p ? 'white' : 'rgba(255,255,255,0.45)',
            cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.88rem',
            boxShadow: page === p ? '0 4px 12px rgba(212,130,42,0.4)' : 'none',
          }}>{p}</button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(total, p + 1))}
          disabled={page === total}
          style={{
            padding: '0.5rem 1.1rem',
            background: page === total ? 'rgba(255,255,255,0.04)' : 'rgba(212,130,42,0.15)',
            border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px',
            color: page === total ? 'rgba(255,255,255,0.18)' : '#d4822a',
            cursor: page === total ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '0.9rem',
          }}>Next →</button>
      </div>
    );
  };

  const inputStyle = {
    padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(212,130,42,0.25)', borderRadius: '10px',
    color: '#f5f0e8', fontSize: '0.93rem', fontFamily: 'Georgia, serif',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const cardStyle = {
    background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px',
    padding: '1.5rem', marginBottom: '1rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  const thStyle = {
    textAlign: 'left', padding: '0.75rem 0.85rem',
    fontSize: '0.72rem', textTransform: 'uppercase',
    color: '#d4822a', letterSpacing: '0.07em',
    borderBottom: '1px solid rgba(212,130,42,0.2)',
    background: 'rgba(212,130,42,0.08)',
  };

  const tdStyle = {
    padding: '0.82rem 0.85rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontSize: '0.9rem', verticalAlign: 'middle',
    color: 'rgba(255,255,255,0.75)',
  };

  const btn = (bg, color = 'white', border = 'none') => ({
    padding: '0.42rem 0.95rem', border, borderRadius: '8px',
    cursor: 'pointer', background: bg, color,
    fontFamily: 'Georgia, serif', fontSize: '0.83rem', fontWeight: 500,
  });

  const badge = (bg, color) => ({
    display: 'inline-block', padding: '0.22rem 0.65rem',
    borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
    background: bg, color,
  });

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative' }}>

      {/* ── Fixed Background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.18)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'linear-gradient(180deg, rgba(10,8,6,0.75) 0%, rgba(26,22,18,0.65) 100%)',
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        background: 'rgba(10,8,6,0.88)', backdropFilter: 'blur(20px)',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(212,130,42,0.2)',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#d4822a', fontWeight: 700 }}>
          📖 LibraryMS — Librarian Panel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: backendOnline ? '#27ae60' : '#c0392b',
            display: 'inline-block',
            boxShadow: backendOnline ? '0 0 8px #27ae60' : '0 0 8px #c0392b',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            {backendOnline ? 'Backend connected' : 'Backend offline'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>🔑 {user?.name}</span>
          <button onClick={handleLogout} style={btn('rgba(192,57,43,0.25)', '#ff8a7a', '1px solid rgba(192,57,43,0.4)')}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Container ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>

        {/* Alert */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)',
            color: msg.type === 'error' ? '#ff8a7a' : '#5deb9a',
            border: `1px solid ${msg.type === 'error' ? 'rgba(192,57,43,0.4)' : 'rgba(39,174,96,0.35)'}`,
            borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem',
          }}>{msg.text}</div>
        )}

        {/* Tab Bar */}
        <div style={{
          display: 'flex', gap: '0.25rem', marginBottom: '1.75rem',
          background: 'rgba(20,16,12,0.7)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px',
          padding: '0.4rem', flexWrap: 'wrap',
        }}>
          {tabs.map((t, i) => (
            <button key={i} style={{
              padding: '0.55rem 1.2rem', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.88rem',
              fontWeight: activeTab === i ? 700 : 400,
              background: activeTab === i ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'transparent',
              color: activeTab === i ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.2s',
              boxShadow: activeTab === i ? '0 4px 14px rgba(212,130,42,0.35)' : 'none',
            }} onClick={() => setActiveTab(i)}>{t}</button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Books', value: books.length, icon: '📚', bg: 'rgba(212,130,42,0.15)' },
                { label: 'Members', value: members.length, icon: '👥', bg: 'rgba(39,174,96,0.15)' },
                { label: 'Issued Now', value: borrows.filter(b => b.status === 'Issued').length, icon: '🔄', bg: 'rgba(41,128,185,0.15)' },
                { label: 'Overdue', value: overdueBorrows.length, icon: '⚠️', bg: 'rgba(192,57,43,0.15)' },
                { label: 'Total Fines', value: `₹${fines.reduce((s, f) => s + (f.fineAmount || 0), 0)}`, icon: '💰', bg: 'rgba(142,68,173,0.15)' },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '13px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f5f0e8', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(212,130,42,0.7)', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {overdueBorrows.length > 0 ? (
              <div style={cardStyle}>
                <h3 style={{ fontFamily: 'Georgia, serif', color: '#ff8a7a', marginBottom: '1rem' }}>⚠️ Overdue — Assign Fines</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Member', 'Book', 'Due Date', 'Days Late', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {overdueBorrows.map(b => {
                      const days = Math.floor((new Date() - new Date(b.dueDate)) / 86400000);
                      return (
                        <tr key={b.borrowId}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={tdStyle}><strong style={{ color: '#f5f0e8' }}>{b.member?.name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{b.member?.email}</span></td>
                          <td style={tdStyle}>{b.book?.name}</td>
                          <td style={{ ...tdStyle, color: '#ff8a7a', fontWeight: 600 }}>{b.dueDate}</td>
                          <td style={tdStyle}><span style={badge('#fde8e8', '#c0392b')}>{days} days</span></td>
                          <td style={tdStyle}>
                            {hasFine(b.borrowId)
                              ? <span style={badge('rgba(39,174,96,0.2)', '#5deb9a')}>✅ Fined</span>
                              : <button onClick={() => openFineModal(b)} style={btn('#c0392b')}>Assign Fine</button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem', color: 'rgba(255,255,255,0.4)' }}>
                ✅ No overdue books right now. All good!
              </div>
            )}
          </>
        )}

        {/* ══ BOOKS TAB ══ */}
        {activeTab === 1 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', margin: 0, color: '#f5f0e8' }}>
                Books Catalog ({books.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(212,130,42,0.25)', borderRadius: '9px', padding: '0.45rem 0.9rem' }}>
                  <span style={{ color: '#d4822a' }}>🔍</span>
                  <input value={search} onChange={e => { setSearch(e.target.value); setBooksPage(1); }} placeholder="Search..."
                    style={{ border: 'none', outline: 'none', background: 'none', color: '#f5f0e8', fontFamily: 'Georgia, serif', fontSize: '0.88rem', width: 140 }} />
                </div>
                <button onClick={openAddBook} style={btn('linear-gradient(135deg,#d4822a,#a05a1a)')}>+ Add Book</button>
              </div>
            </div>
            {filteredBooks.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem' }}>No books found.</p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Cover', '#', 'Title', 'Author', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginate(filteredBooks, booksPage).map((book, i) => (
                      <tr key={book.bookId}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...tdStyle, width: 52 }}>
                          <img src={BOOK_COVERS[(i + (booksPage - 1) * ITEMS_PER_PAGE) % BOOK_COVERS.length]} alt=""
                            style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: '5px', boxShadow: '0 3px 10px rgba(0,0,0,0.4)' }} />
                        </td>
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.3)', width: 40 }}>
                          {(booksPage - 1) * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td style={tdStyle}><strong style={{ color: '#f5f0e8' }}>{book.name}</strong></td>
                        <td style={{ ...tdStyle, color: 'rgba(212,130,42,0.75)' }}>{book.author}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEditBook(book)} style={btn('rgba(212,130,42,0.15)', '#d4822a', '1px solid rgba(212,130,42,0.35)')}>Edit</button>
                            <button onClick={() => handleDeleteBook(book.bookId)} style={btn('rgba(192,57,43,0.2)', '#ff8a7a', '1px solid rgba(192,57,43,0.35)')}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={booksPage} setPage={setBooksPage} total={totalPages(filteredBooks)} />
              </>
            )}
          </div>
        )}

        {/* ══ MEMBERS TAB ══ */}
        {activeTab === 2 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1.25rem', color: '#f5f0e8' }}>
              Members ({members.length})
            </h2>
            {members.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem' }}>No members found.</p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Member', 'Library ID', 'Email', 'Phone', 'Category', 'Fines'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginate(members, membersPage).map((m, i) => {
                      const memberFines = fines.filter(f => f.borrow?.member?.memId === m.memId && f.status === 'Unpaid');
                      const colors = ['#d4822a', '#27ae60', '#2980b9', '#8e44ad', '#c0392b', '#16a085'];
                      return (
                        <tr key={m.memId}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${colors[i % colors.length]},${colors[(i + 2) % colors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.3)' }}>
                                {m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <strong style={{ color: '#f5f0e8' }}>{m.name}</strong>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', color: 'rgba(212,130,42,0.65)', fontSize: '0.82rem' }}>
                            LIB-{String(m.memId).padStart(5, '0')}
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.87rem' }}>{m.email}</td>
                          <td style={{ ...tdStyle, fontSize: '0.87rem' }}>{m.phNo || '—'}</td>
                          <td style={tdStyle}>
                            <span style={badge(
                              m.category === 'Staff' ? 'rgba(212,130,42,0.2)' : 'rgba(41,128,185,0.2)',
                              m.category === 'Staff' ? '#d4822a' : '#5dade2'
                            )}>{m.category}</span>
                          </td>
                          <td style={tdStyle}>
                            {memberFines.length > 0
                              ? <span style={badge('rgba(192,57,43,0.2)', '#ff8a7a')}>₹{memberFines.reduce((s, f) => s + f.fineAmount, 0)} due</span>
                              : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={membersPage} setPage={setMembersPage} total={totalPages(members)} />
              </>
            )}
          </div>
        )}

        {/* ══ BORROWS TAB ══ */}
        {activeTab === 3 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1.25rem', color: '#f5f0e8' }}>
              All Borrow Records ({borrows.length})
            </h2>
            {borrows.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem' }}>No borrow records yet.</p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Book', 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginate(borrows, borrowsPage).map(b => {
                      const overdue = isOverdue(b);
                      const fined = hasFine(b.borrowId);
                      return (
                        <tr key={b.borrowId}
                          style={{ background: overdue ? 'rgba(192,57,43,0.03)' : undefined }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = overdue ? 'rgba(192,57,43,0.03)' : 'transparent'}
                        >
                          <td style={tdStyle}>
                            <strong style={{ color: '#f5f0e8', display: 'block' }}>{b.book?.name}</strong>
                            <span style={{ fontSize: '0.78rem', color: 'rgba(212,130,42,0.65)' }}>{b.book?.author}</span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ color: '#f5f0e8' }}>{b.member?.name}</span><br />
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{b.member?.category}</span>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.86rem' }}>{b.issueDate || '—'}</td>
                          <td style={{ ...tdStyle, color: overdue ? '#ff8a7a' : undefined, fontWeight: overdue ? 700 : 400, fontSize: '0.86rem' }}>{b.dueDate || '—'}</td>
                          <td style={{ ...tdStyle, fontSize: '0.86rem' }}>{b.returnDate || '—'}</td>
                          <td style={tdStyle}>
                            <span style={badge(
                              overdue ? 'rgba(192,57,43,0.2)' : b.status === 'Returned' ? 'rgba(39,174,96,0.2)' : 'rgba(41,128,185,0.2)',
                              overdue ? '#ff8a7a' : b.status === 'Returned' ? '#5deb9a' : '#5dade2'
                            )}>{overdue ? '⚠️ Overdue' : b.status}</span>
                          </td>
                          <td style={tdStyle}>
                            {fined
                              ? <span style={badge('rgba(39,174,96,0.2)', '#5deb9a')}>✅ Fined</span>
                              : <button onClick={() => openFineModal(b)} style={{ ...btn('rgba(192,57,43,0.2)', '#ff8a7a', '1px solid rgba(192,57,43,0.35)'), fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>Assign Fine</button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={borrowsPage} setPage={setBorrowsPage} total={totalPages(borrows)} />
              </>
            )}
          </div>
        )}

        {/* ══ FINES TAB ══ */}
        {activeTab === 4 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1.25rem', color: '#f5f0e8' }}>
              Fine Records ({fines.length})
            </h2>
            {fines.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem' }}>
                No fines recorded yet. Assign fines from the Borrows tab.
              </p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Member', 'Book', 'Fine Amount', 'Fine Date', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginate(fines, finesPage).map(f => (
                      <tr key={f.fineId}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={tdStyle}>
                          <strong style={{ color: '#f5f0e8' }}>{f.borrow?.member?.name || '—'}</strong><br />
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{f.borrow?.member?.email}</span>
                        </td>
                        <td style={tdStyle}>{f.borrow?.book?.name || '—'}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#ff8a7a', fontSize: '1rem' }}>₹{f.fineAmount}</td>
                        <td style={{ ...tdStyle, fontSize: '0.86rem' }}>{f.fineDate || '—'}</td>
                        <td style={tdStyle}>
                          <span style={badge(
                            f.status === 'Paid' ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.2)',
                            f.status === 'Paid' ? '#5deb9a' : '#ff8a7a'
                          )}>{f.status === 'Paid' ? '✅ Paid' : '❌ Unpaid'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={finesPage} setPage={setFinesPage} total={totalPages(fines)} />
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Add/Edit Book Modal ── */}
      {showBookModal && (
        <div onClick={() => setShowBookModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,16,12,0.96)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <h2 style={{ color: '#f5f0e8', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
              {editBook ? '✏️ Edit Book' : '📖 Add New Book'}
            </h2>
            <form onSubmit={handleSaveBook}>
              {[{ label: 'Book Title', key: 'name', placeholder: 'e.g. The Great Gatsby' }, { label: 'Author', key: 'author', placeholder: 'e.g. F. Scott Fitzgerald' }].map(f => (
                <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{f.label}</label>
                  <input value={bookForm[f.key]} onChange={e => setBookForm({ ...bookForm, [f.key]: e.target.value })} required placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4822a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowBookModal(false)} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.3)', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, boxShadow: '0 4px 16px rgba(212,130,42,0.4)' }}>
                  {editBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Fine Modal ── */}
      {showFineModal && selectedBorrow && (
        <div onClick={() => setShowFineModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,16,12,0.96)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <h2 style={{ color: '#f5f0e8', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>💰 Assign Fine</h2>
            <div style={{ background: 'rgba(212,130,42,0.08)', border: '1px solid rgba(212,130,42,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member</div>
              <div style={{ fontWeight: 700, color: '#f5f0e8', fontSize: '1rem' }}>{selectedBorrow.member?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(212,130,42,0.75)', marginTop: '0.4rem' }}>📗 {selectedBorrow.book?.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#ff8a7a', marginTop: '0.25rem' }}>
                Due: {selectedBorrow.dueDate}
                {isOverdue(selectedBorrow) && (
                  <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
                    ({Math.floor((new Date() - new Date(selectedBorrow.dueDate)) / 86400000)} days overdue)
                  </span>
                )}
              </div>
            </div>
            <form onSubmit={handleAssignFine}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>Fine Amount (₹)</label>
                <input style={inputStyle} type="number" min="1" step="0.01" value={fineAmount} onChange={e => setFineAmount(e.target.value)} required placeholder="e.g. 50" autoFocus
                  onFocus={e => e.target.style.borderColor = '#d4822a'}
                  onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFineModal(false)} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.3)', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#c0392b,#922b21)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, boxShadow: '0 4px 16px rgba(192,57,43,0.4)' }}>Assign Fine</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibrarianDashboard;