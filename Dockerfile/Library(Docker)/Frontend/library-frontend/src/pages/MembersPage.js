import React, { useEffect, useState } from 'react';
import { getMembers, addMember } from '../services/api';
import PageNav from '../components/PageNav';

const MEMBERS_PER_PAGE = 8;
const AVATAR_COLORS = ['#d4822a', '#27ae60', '#2980b9', '#8e44ad', '#c0392b', '#16a085', '#e67e22', '#2ecc71'];

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phNo: '', category: 'Student' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMembers = async () => {
    try {
      const res = await getMembers();
      setMembers(res.data);
    } catch { setMsg({ text: 'Failed to load members.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addMember(form);
      setMsg({ text: 'Member added successfully!', type: 'success' });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', address: '', phNo: '', category: 'Student' });
      fetchMembers();
    } catch { setMsg({ text: 'Failed to add member.', type: 'error' }); }
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / MEMBERS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * MEMBERS_PER_PAGE, currentPage * MEMBERS_PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

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
        backgroundImage: `url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.2)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.65) 0%, rgba(26,22,18,0.55) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>👥 Members</h1>
            <p style={{ color: 'rgba(212,130,42,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{members.length} registered members</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)',
            color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(212,130,42,0.4)',
          }}>+ Add Member</button>
        </div>

        {/* Alert */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)',
            color: msg.type === 'error' ? '#ff8a7a' : '#5deb9a',
            border: `1px solid ${msg.type === 'error' ? 'rgba(192,57,43,0.4)' : 'rgba(39,174,96,0.3)'}`,
            borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', backdropFilter: 'blur(10px)',
          }}>
            {msg.text}
            <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>✕</button>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '0.6rem 1rem', border: '1px solid rgba(212,130,42,0.2)' }}>
          <span style={{ color: '#d4822a', fontSize: '1.1rem' }}>🔍</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name, email or category..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#f5f0e8', fontSize: '0.95rem', fontFamily: 'Georgia, serif', flex: 1 }} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>Loading members...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>No members found.</div>
        ) : (
          <div style={{ background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(212,130,42,0.1)', borderBottom: '1px solid rgba(212,130,42,0.2)' }}>
                  {['Member', 'Library ID', 'Email', 'Phone', 'Category'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((m, i) => (
                  <tr key={m.memId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 2) % AVATAR_COLORS.length]})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        }}>{getInitials(m.name)}</div>
                        <strong style={{ color: '#f5f0e8' }}>{m.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'rgba(212,130,42,0.7)', fontSize: '0.85rem' }}>LIB-{String(m.memId).padStart(5, '0')}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{m.email}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{m.phNo || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                        background: m.category === 'Staff' ? 'rgba(212,130,42,0.2)' : 'rgba(41,128,185,0.2)',
                        color: m.category === 'Staff' ? '#d4822a' : '#5dade2',
                        border: `1px solid ${m.category === 'Staff' ? 'rgba(212,130,42,0.4)' : 'rgba(41,128,185,0.4)'}`,
                      }}>{m.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{
              padding: '0.55rem 1.1rem', background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(212,130,42,0.15)',
              border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px',
              color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : '#d4822a',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem',
            }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} style={{
                width: 38, height: 38,
                background: currentPage === page ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${currentPage === page ? 'transparent' : 'rgba(212,130,42,0.2)'}`,
                borderRadius: '8px', color: currentPage === page ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem',
                boxShadow: currentPage === page ? '0 4px 12px rgba(212,130,42,0.4)' : 'none',
              }}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{
              padding: '0.55rem 1.1rem', background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(212,130,42,0.15)',
              border: '1px solid rgba(212,130,42,0.3)', borderRadius: '8px',
              color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#d4822a',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem',
            }}>Next →</button>
          </div>
        )}

        <PageNav />
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,16,12,0.95)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: 500, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#f5f0e8', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>👤 Add New Member</h2>
            <form onSubmit={handleAdd}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Phone', key: 'phNo', type: 'text', placeholder: '+91 9876543210' },
                { label: 'Address', key: 'address', type: 'text', placeholder: '123 Main St' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={['name', 'email', 'password'].includes(f.key)} placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4822a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Student" style={{ background: '#1a1612' }}>Student</option>
                  <option value="Staff" style={{ background: '#1a1612' }}>Staff</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.3)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, boxShadow: '0 4px 16px rgba(212,130,42,0.4)' }}>Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;