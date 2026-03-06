import React, { useEffect, useState } from 'react';
import { courseAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const emptyForm = { name: '', duration: '', structure: '', fee: '' };

// Reliable Unsplash course images — each unique subject
const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80', // laptop / CS
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80', // maths equations on board
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', // business / MBA desk
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', // medical / science lab
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', // arts / humanities
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80', // college campus building
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80', // library / research
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', // lecture hall
];

export default function CoursesPage() {
  const { showNotification, userRole } = useApp();
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState(null);

  const load = async () => {
    try { const r = await courseAPI.getAll(); setCourses(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...emptyForm, ...c }); setModal(true); };
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await courseAPI.update(editing.courseId, form);
        showNotification('Course updated');
      } else {
        await courseAPI.create(form);
        showNotification('Course created');
      }
      setModal(false); load();
    } catch { showNotification('Error saving course', 'error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await courseAPI.delete(id); showNotification('Course deleted'); load(); }
    catch { showNotification('Error deleting course', 'error'); }
  };

  return (
    <div>
      {/* Hero */}
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>Courses</h1>
            <p>{userRole === 'student' ? 'Explore available academic programs' : 'Manage available programs and their details'}</p>
          </div>
          {userRole === 'officer' && (
            <button className="btn btn-gold" onClick={openAdd}>+ Add Course</button>
          )}
        </div>
      </div>

      <div className="page-content">

        {/* Campus Image Accent Strip */}
        <div style={{
          width: '100%', height: 110, borderRadius: 16, overflow: 'hidden',
          position: 'relative', marginBottom: 28,
          border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)'
        }}>
          <img
            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80"
            alt="campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.3) 55%, transparent 100%)',
            display: 'flex', alignItems: 'center', padding: '0 32px'
          }}>
            <div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic',
                color: 'white', fontWeight: 500, lineHeight: 1.4, maxWidth: 520
              }}>"Shape minds. Build futures. Transform lives."</div>
              <div style={{
                marginTop: 6, width: 40, height: 2,
                background: 'linear-gradient(90deg, var(--gold), transparent)'
              }} />
            </div>
          </div>
        </div>
        {courses.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&q=80"
                alt="no courses"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <p>No courses available yet</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
            {courses.map((c, i) => (
              <div key={c.courseId} className="card" style={{
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Course Image */}
                <div style={{ position: 'relative', height: 150, overflow: 'hidden', backgroundColor: 'var(--navy)', flexShrink: 0 }}>
                  <img
                    src={COURSE_IMAGES[i % COURSE_IMAGES.length]}
                    alt={c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = 'linear-gradient(135deg, var(--navy), var(--navy-mid))';
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,14,26,0.6) 0%, transparent 60%)'
                  }} />
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(10,14,26,0.6)', color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Space Mono, monospace', fontSize: 10, padding: '3px 10px',
                    borderRadius: 20, letterSpacing: 1
                  }}>
                    COURSE #{c.courseId}
                  </div>
                  {c.fee && (
                    <div style={{
                      position: 'absolute', bottom: 12, right: 12,
                      background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                      color: 'var(--ink)', fontWeight: 700, fontSize: 13,
                      padding: '4px 12px', borderRadius: 20
                    }}>
                      ₹{parseFloat(c.fee).toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px 22px' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 8, color: 'var(--navy)' }}>
                    {c.name || '—'}
                  </h3>

                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 18, lineHeight: 1.7, minHeight: 42,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {c.structure || 'No description provided.'}
                  </p>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18,
                    padding: 14, background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-200)'
                  }}>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Duration</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{c.duration || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Fee</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-dark)' }}>
                        {c.fee ? `₹${parseFloat(c.fee).toLocaleString()}` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="action-btns">
                    {userRole === 'officer' ? (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(c.courseId)}>Delete</button>
                      </>
                    ) : (
                      <button className="btn btn-sage btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => setViewModal(c)}>
                        View Full Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Officer Add/Edit Modal */}
      {modal && userRole === 'officer' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Edit Course' : 'Add New Course'}</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {editing ? `Editing ${editing.name}` : 'Create a new academic program'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. B.Tech Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input placeholder="e.g. 4 Years" value={form.duration} onChange={e => set('duration', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Fee (₹)</label>
                    <input type="number" placeholder="e.g. 75000" value={form.fee} onChange={e => set('fee', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>Course Structure / Description</label>
                    <textarea placeholder="Describe the course structure, subjects, syllabus..."
                      value={form.structure} onChange={e => set('structure', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editing ? 'Save Changes' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header" style={{ padding: 0, border: 'none', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: 160 }}>
                <img
                  src={COURSE_IMAGES[Math.max(0, courses.findIndex(c => c.courseId === viewModal.courseId)) % COURSE_IMAGES.length]}
                  alt={viewModal.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.style.background = 'linear-gradient(135deg, var(--navy), var(--navy-mid))'; }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(10,14,26,0.75) 0%, rgba(10,14,26,0.2) 100%)',
                  display: 'flex', alignItems: 'flex-end', padding: '0 28px 20px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'white', fontWeight: 600 }}>
                      {viewModal.name}
                    </h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>
                      COURSE #{viewModal.courseId}
                    </div>
                  </div>
                  <button className="modal-close" onClick={() => setViewModal(null)}
                    style={{ color: 'white', background: 'rgba(255,255,255,0.15)' }}>×</button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: 24 }}>
                {viewModal.structure || 'No structure info provided.'}
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <label>Duration</label>
                  <div className="info-value">{viewModal.duration || '—'}</div>
                </div>
                <div className="info-item">
                  <label>Fee</label>
                  <div className="info-value" style={{ color: 'var(--gold-dark)' }}>
                    {viewModal.fee ? `₹${parseFloat(viewModal.fee).toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}