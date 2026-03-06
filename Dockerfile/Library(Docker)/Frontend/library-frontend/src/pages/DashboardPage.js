import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, getMembers, getBorrows } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';

const FEATURED_BOOKS = [
  { img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=140&h=190&fit=crop', title: 'Classic Fiction' },
  { img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=140&h=190&fit=crop', title: 'Adventure' },
  { img: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=140&h=190&fit=crop', title: 'Science' },
  { img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=140&h=190&fit=crop', title: 'Philosophy' },
  { img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=140&h=190&fit=crop', title: 'Mystery' },
];

const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(212,130,42,0.2)', borderRadius: '16px',
      padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.1rem',
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(212,130,42,0.2)'; e.currentTarget.style.borderColor = 'rgba(212,130,42,0.45)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(212,130,42,0.2)'; }}
    >
      <div style={{ width: 56, height: 56, borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.9rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f5f0e8', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: 'rgba(212,130,42,0.75)', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, members: 0, borrows: 0, overdue: 0 });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, membersRes, borrowsRes] = await Promise.all([getBooks(), getMembers(), getBorrows()]);
        const borrows = borrowsRes.data;
        const today = new Date();
        const overdue = borrows.filter(b => b.status === 'Issued' && new Date(b.dueDate) < today).length;
        setStats({ books: booksRes.data.length, members: membersRes.data.length, borrows: borrows.filter(b => b.status === 'Issued').length, overdue });
        setRecentBorrows(borrows.slice(-5).reverse());
      } catch (e) { }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getBadge = (status) => {
    if (status === 'Issued') return { bg: 'rgba(41,128,185,0.2)', color: '#5dade2', border: 'rgba(41,128,185,0.4)', label: '📤 Issued' };
    if (status === 'Returned') return { bg: 'rgba(39,174,96,0.2)', color: '#5deb9a', border: 'rgba(39,174,96,0.4)', label: '✅ Returned' };
    return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: 'rgba(255,255,255,0.2)', label: status };
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.2)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.7) 0%, rgba(26,22,18,0.55) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Welcome hero */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ color: '#f5f0e8', fontSize: '2.2rem', margin: '0 0 0.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Librarian'} 👋
            </h1>
            <p style={{ color: 'rgba(212,130,42,0.8)', marginTop: 0, fontSize: '0.95rem' }}>Here's what's happening in your library today.</p>
          </div>

          {/* Featured book shelf strip */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
            {FEATURED_BOOKS.map((book, i) => (
              <div key={i} style={{
                width: 52, height: [80, 95, 105, 90, 80][i],
                borderRadius: '4px', overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                transform: `rotate(${[-2, -1, 0, 1, 2][i]}deg)`,
                border: '2px solid rgba(212,130,42,0.2)',
                flexShrink: 0,
              }}>
                <img src={book.img} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
              <StatCard label="Total Books" value={stats.books} icon="📚" color="rgba(212,130,42,0.2)" to="/books" />
              <StatCard label="Members" value={stats.members} icon="👥" color="rgba(39,174,96,0.2)" to="/members" />
              <StatCard label="Currently Issued" value={stats.borrows} icon="🔄" color="rgba(41,128,185,0.2)" to="/borrow" />
              <StatCard label="Overdue" value={stats.overdue} icon="⚠️" color="rgba(192,57,43,0.2)" to="/borrow" />
            </div>

            {/* Recent activity */}
            <div style={{ background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,130,42,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(212,130,42,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                <h2 style={{ color: '#f5f0e8', fontSize: '1.1rem', margin: 0, fontFamily: 'Georgia, serif' }}>Recent Borrowing Activity</h2>
              </div>

              {recentBorrows.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '3rem' }}>No borrowing activity yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(212,130,42,0.07)' }}>
                      {['Book', 'Member', 'Issue Date', 'Due Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBorrows.map(b => {
                      const badge = getBadge(b.status);
                      return (
                        <tr key={b.borrowId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '0.9rem 1rem', color: '#f5f0e8', fontWeight: 600, fontSize: '0.92rem' }}>{b.book?.name || 'N/A'}</td>
                          <td style={{ padding: '0.9rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{b.member?.name || 'N/A'}</td>
                          <td style={{ padding: '0.9rem 1rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.87rem' }}>{b.issueDate || 'N/A'}</td>
                          <td style={{ padding: '0.9rem 1rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.87rem' }}>{b.dueDate || 'N/A'}</td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span style={{ display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
      <Chatbot />
    </div>
  );
};

export default DashboardPage;