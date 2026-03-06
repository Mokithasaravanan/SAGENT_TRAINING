import React, { useEffect, useState } from 'react';
import { getBorrows, borrowBook, returnBook, getBooks, getMembers } from '../services/api';
import PageNav from '../components/PageNav';

const BORROWS_PER_PAGE = 8;

const BorrowPage = () => {
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ bookId: '', memberId: '', issueDate: '', dueDate: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAll = async () => {
    try {
      const [b, bk, m] = await Promise.all([getBorrows(), getBooks(), getMembers()]);
      setBorrows(b.data.reverse());
      setBooks(bk.data);
      setMembers(m.data);
    } catch { setMsg({ text: 'Failed to load data.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      await borrowBook({ book: { bookId: parseInt(form.bookId) }, member: { memId: parseInt(form.memberId) }, issueDate: form.issueDate, dueDate: form.dueDate, status: 'Issued' });
      setMsg({ text: 'Book issued successfully!', type: 'success' });
      setShowModal(false);
      fetchAll();
    } catch { setMsg({ text: 'Failed to issue book.', type: 'error' }); }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      await returnBook(id);
      setMsg({ text: 'Book returned successfully!', type: 'success' });
      fetchAll();
    } catch { setMsg({ text: 'Return failed.', type: 'error' }); }
  };

  const isOverdue = (b) => b.status === 'Issued' && new Date(b.dueDate) < new Date();

  const filtered = borrows.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Issued') return b.status === 'Issued' && !isOverdue(b);
    if (filter === 'Returned') return b.status === 'Returned';
    if (filter === 'Overdue') return isOverdue(b);
    return true;
  });

  const totalPages = Math.ceil(filtered.length / BORROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * BORROWS_PER_PAGE, currentPage * BORROWS_PER_PAGE);

  const handleFilter = (f) => { setFilter(f); setCurrentPage(1); };
  const todayStr = new Date().toISOString().split('T')[0];

  const getBadge = (b) => {
    if (isOverdue(b)) return { label: '⚠️ Overdue', bg: 'rgba(192,57,43,0.2)', color: '#ff8a7a', border: 'rgba(192,57,43,0.4)' };
    if (b.status === 'Issued') return { label: '📤 Issued', bg: 'rgba(41,128,185,0.2)', color: '#5dade2', border: 'rgba(41,128,185,0.4)' };
    if (b.status === 'Returned') return { label: '✅ Returned', bg: 'rgba(39,174,96,0.2)', color: '#5deb9a', border: 'rgba(39,174,96,0.4)' };
    return { label: b.status, bg: 'rgba(255,255,255,0.1)', color: '#fff', border: 'rgba(255,255,255,0.2)' };
  };

  const inputStyle = {
    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(212,130,42,0.25)', borderRadius: '10px',
    color: '#f5f0e8', fontSize: '0.93rem', fontFamily: 'Georgia, serif',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1549122728-f519709caa9c?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.2)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.65) 0%, rgba(26,22,18,0.55) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>🔄 Borrowing Management</h1>
            <p style={{ color: 'rgba(212,130,42,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Track book issuances and returns</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)',
            color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(212,130,42,0.4)',
          }}>+ Issue Book</button>
        </div>

        {/* Alert */}
        {msg.text && (
          <div style={{ background: msg.type === 'error' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)', color: msg.type === 'error' ? '#ff8a7a' : '#5deb9a', border: `1px solid ${msg.type === 'error' ? 'rgba(192,57,43,0.4)' : 'rgba(39,174,96,0.3)'}`, borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', backdropFilter: 'blur(10px)' }}>
            {msg.text}
            <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>✕</button>
          </div>
        )}

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'All', icon: '📋' },
            { label: 'Issued', icon: '📤' },
            { label: 'Returned', icon: '✅' },
            { label: 'Overdue', icon: '⚠️' },
          ].map(({ label, icon }) => (
            <button key={label} onClick={() => handleFilter(label)} style={{
              padding: '0.5rem 1.2rem',
              background: filter === label ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${filter === label ? 'transparent' : 'rgba(212,130,42,0.2)'}`,
              borderRadius: '10px', cursor: 'pointer', fontFamily: 'Georgia, serif',
              fontSize: '0.87rem', fontWeight: filter === label ? 700 : 400,
              color: filter === label ? 'white' : 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(8px)',
              boxShadow: filter === label ? '0 4px 14px rgba(212,130,42,0.35)' : 'none',
              transition: 'all 0.2s',
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>No records found.</div>
        ) : (
          <div style={{ background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(212,130,42,0.1)', borderBottom: '1px solid rgba(212,130,42,0.2)' }}>
                  {['Book', 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(b => {
                  const badge = getBadge(b);
                  return (
                    <tr key={b.borrowId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isOverdue(b) ? 'rgba(192,57,43,0.03)' : undefined }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = isOverdue(b) ? 'rgba(192,57,43,0.03)' : 'transparent'}
                    >
                      <td style={{ padding: '0.85rem 0.85rem' }}>
                        <strong style={{ color: '#f5f0e8', display: 'block', fontSize: '0.92rem' }}>{b.book?.name || 'N/A'}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'rgba(212,130,42,0.7)' }}>{b.book?.author}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.85rem' }}>
                        <span style={{ color: '#f5f0e8', display: 'block', fontSize: '0.9rem' }}>{b.member?.name || 'N/A'}</span>
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{b.member?.category}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.85rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>{b.issueDate || '—'}</td>
                      <td style={{ padding: '0.85rem 0.85rem', color: isOverdue(b) ? '#ff8a7a' : 'rgba(255,255,255,0.55)', fontWeight: isOverdue(b) ? 700 : 400, fontSize: '0.88rem' }}>{b.dueDate || '—'}</td>
                      <td style={{ padding: '0.85rem 0.85rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>{b.returnDate || '—'}</td>
                      <td style={{ padding: '0.85rem 0.85rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.85rem' }}>
                        {b.status === 'Issued' && (
                          <button onClick={() => handleReturn(b.borrowId)} style={{
                            padding: '0.35rem 0.85rem', background: 'rgba(39,174,96,0.2)',
                            border: '1px solid rgba(39,174,96,0.4)', borderRadius: '8px',
                            color: '#5deb9a', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif',
                          }}>Return</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.55rem 1.1rem', background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(212,130,42,0.15)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px', color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : '#d4822a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} style={{ width: 38, height: 38, background: currentPage === page ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentPage === page ? 'transparent' : 'rgba(212,130,42,0.2)'}`, borderRadius: '8px', color: currentPage === page ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem', boxShadow: currentPage === page ? '0 4px 12px rgba(212,130,42,0.4)' : 'none' }}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.55rem 1.1rem', background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(212,130,42,0.15)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px', color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#d4822a', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' }}>Next →</button>
          </div>
        )}

        <PageNav />
      </div>

      {/* Issue Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,16,12,0.95)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <h2 style={{ color: '#f5f0e8', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>📤 Issue a Book</h2>
            <form onSubmit={handleBorrow}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>Select Book</label>
                <select value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" style={{ background: '#1a1612' }}>-- Choose a book --</option>
                  {books.map(bk => <option key={bk.bookId} value={bk.bookId} style={{ background: '#1a1612' }}>{bk.name} — {bk.author}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>Select Member</label>
                <select value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" style={{ background: '#1a1612' }}>-- Choose a member --</option>
                  {members.map(m => <option key={m.memId} value={m.memId} style={{ background: '#1a1612' }}>{m.name} ({m.category})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', marginBottom: '1.25rem' }}>
                {[{ label: 'Issue Date', key: 'issueDate', min: todayStr }, { label: 'Due Date', key: 'dueDate', min: form.issueDate || todayStr }].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{f.label}</label>
                    <input type="date" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required min={f.min} style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={e => e.target.style.borderColor = '#d4822a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.3)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, boxShadow: '0 4px 16px rgba(212,130,42,0.4)' }}>Issue Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowPage;