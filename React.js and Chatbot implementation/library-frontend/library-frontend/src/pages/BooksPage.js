import React, { useEffect, useState } from 'react';
import { getBooks, addBook, updateBook, deleteBook } from '../services/api';
import PageNav from '../components/PageNav';

const BOOKS_PER_PAGE = 8;

const BOOK_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=120&h=160&fit=crop',
];

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState({ name: '', author: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchBooks = async () => {
    try {
      const res = await getBooks();
      setBooks(res.data);
    } catch { setMsg({ text: 'Failed to load books.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd = () => { setEditBook(null); setForm({ name: '', author: '' }); setShowModal(true); };
  const openEdit = (book) => { setEditBook(book); setForm({ name: book.name, author: book.author }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditBook(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editBook) {
        await updateBook(editBook.bookId, form);
        setMsg({ text: 'Book updated successfully!', type: 'success' });
      } else {
        await addBook(form);
        setMsg({ text: 'Book added successfully!', type: 'success' });
      }
      fetchBooks();
      closeModal();
    } catch { setMsg({ text: 'Operation failed.', type: 'error' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await deleteBook(id);
      setMsg({ text: 'Book deleted.', type: 'success' });
      fetchBooks();
    } catch { setMsg({ text: 'Delete failed.', type: 'error' }); }
  };

  const filtered = books.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

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
        backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.22)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.6) 0%, rgba(26,22,18,0.5) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>📚 Books Catalog</h1>
            <p style={{ color: 'rgba(212,130,42,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{books.length} books in the library</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(212,130,42,0.2)' }}>
              {[['grid', '⊞'], ['table', '☰']].map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: '0.4rem 0.75rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  background: viewMode === mode ? 'linear-gradient(135deg,#d4822a,#a05a1a)' : 'transparent',
                  color: viewMode === mode ? 'white' : 'rgba(255,255,255,0.5)',
                  fontSize: '1rem',
                }}>{icon}</button>
              ))}
            </div>
            <button onClick={openAdd} style={{
              padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)',
              color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 4px 16px rgba(212,130,42,0.4)',
            }}>+ Add Book</button>
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)',
            color: msg.type === 'error' ? '#ff8a7a' : '#5deb9a',
            border: `1px solid ${msg.type === 'error' ? 'rgba(192,57,43,0.4)' : 'rgba(39,174,96,0.3)'}`,
            borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
            backdropFilter: 'blur(10px)',
          }}>
            {msg.text}
            <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>✕</button>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '0.6rem 1rem', border: '1px solid rgba(212,130,42,0.2)' }}>
          <span style={{ color: '#d4822a', fontSize: '1.1rem' }}>🔍</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by title or author..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#f5f0e8', fontSize: '0.95rem', fontFamily: 'Georgia, serif', flex: 1 }} />
          {search && <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>📖</div>
            Loading books...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            No books found.
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {paginated.map((book, i) => (
              <div key={book.bookId} style={{
                background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px',
                overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,130,42,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Book cover */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <img
                    src={BOOK_COVERS[(i + (currentPage - 1) * BOOKS_PER_PAGE) % BOOK_COVERS.length]}
                    alt="book cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,6,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                    <div style={{ fontSize: '0.7rem', color: '#d4822a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>#{String(book.bookId).padStart(4, '0')}</div>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '0.9rem' }}>
                  <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', margin: '0 0 0.3rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.name}</h3>
                  <p style={{ color: 'rgba(212,130,42,0.75)', fontSize: '0.8rem', margin: '0 0 0.85rem' }}>✍️ {book.author}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(book)} style={{
                      flex: 1, padding: '0.4rem', background: 'rgba(212,130,42,0.15)', border: '1px solid rgba(212,130,42,0.3)',
                      borderRadius: '7px', color: '#d4822a', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Georgia, serif',
                    }}>Edit</button>
                    <button onClick={() => handleDelete(book.bookId)} style={{
                      flex: 1, padding: '0.4rem', background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)',
                      borderRadius: '7px', color: '#ff8a7a', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Georgia, serif',
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div style={{ background: 'rgba(20,16,12,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,130,42,0.2)', borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(212,130,42,0.1)', borderBottom: '1px solid rgba(212,130,42,0.2)' }}>
                  {['Cover', '#', 'Title', 'Author', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#d4822a', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((book, i) => (
                  <tr key={book.bookId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,130,42,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <img src={BOOK_COVERS[(i + (currentPage - 1) * BOOKS_PER_PAGE) % BOOK_COVERS.length]} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '0.7rem 1rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>{(currentPage - 1) * BOOKS_PER_PAGE + i + 1}</td>
                    <td style={{ padding: '0.7rem 1rem', color: '#f5f0e8', fontWeight: 600 }}>{book.name}</td>
                    <td style={{ padding: '0.7rem 1rem', color: 'rgba(212,130,42,0.8)', fontSize: '0.9rem' }}>{book.author}</td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(book)} style={{ padding: '0.35rem 0.8rem', background: 'rgba(212,130,42,0.15)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '7px', color: '#d4822a', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Edit</button>
                        <button onClick={() => handleDelete(book.bookId)} style={{ padding: '0.35rem 0.8rem', background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '7px', color: '#ff8a7a', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Delete</button>
                      </div>
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

      {/* Modal */}
      {showModal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,16,12,0.95)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <h2 style={{ color: '#f5f0e8', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>{editBook ? '✏️ Edit Book' : '📖 Add New Book'}</h2>
            <form onSubmit={handleSave}>
              {[{ label: 'Book Title', key: 'name', placeholder: 'e.g. The Great Gatsby' }, { label: 'Author', key: 'author', placeholder: 'e.g. F. Scott Fitzgerald' }].map(f => (
                <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4822a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={closeModal} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: '1.5px solid rgba(212,130,42,0.3)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#d4822a,#a05a1a)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 700, boxShadow: '0 4px 16px rgba(212,130,42,0.4)' }}>{editBook ? 'Update Book' : 'Add Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;