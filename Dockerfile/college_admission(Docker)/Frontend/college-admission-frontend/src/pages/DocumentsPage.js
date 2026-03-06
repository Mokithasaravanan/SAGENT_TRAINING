import React, { useEffect, useState } from 'react';
import { documentAPI, applicationAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const DOC_TYPES = ['Marksheet', 'ID Proof', 'Transfer Certificate', 'Character Certificate', 'Photo', 'Other'];

const DOC_META = {
  'Marksheet':             { icon: '📊', color: '#dbeafe', text: '#1e40af', bg: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=70' },
  'ID Proof':              { icon: '🪪', color: '#d1fae5', text: '#065f46', bg: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&q=70' },
  'Transfer Certificate':  { icon: '📜', color: '#fef3c7', text: '#92400e', bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=70' },
  'Character Certificate': { icon: '⭐', color: '#ede9fe', text: '#5b21b6', bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=70' },
  'Photo':                 { icon: '🖼️', color: '#fce7f3', text: '#9d174d', bg: 'https://images.unsplash.com/photo-1532094349884-543559c79c5b?w=400&q=70' },
  'Other':                 { icon: '📄', color: 'var(--gray-200)', text: 'var(--gray-500)', bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=70' },
};

export default function DocumentsPage() {
  const { showNotification, userRole, currentUser } = useApp();
  const [docs, setDocs] = useState([]);
  const [apps, setApps] = useState([]);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ docType: 'Marksheet', applicationId: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [d, a] = await Promise.all([documentAPI.getAll(), applicationAPI.getAll()]);
      setDocs(d.data);
      setApps(a.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const myAppIds = apps
    .filter(a => a.student?.studentId === currentUser?.studentId)
    .map(a => a.applicationId);

  const visibleDocs = userRole === 'student'
    ? docs.filter(d => myAppIds.includes(d.application?.applicationId))
    : docs;

  const myApps = userRole === 'student'
    ? apps.filter(a => a.student?.studentId === currentUser?.studentId)
    : apps;

  const openAdd = () => {
    setEditing(null);
    setForm({ docType: 'Marksheet', applicationId: '' });
    setModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ docType: d.docType || 'Marksheet', applicationId: d.application?.applicationId || '' });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        docType: form.docType,
        application: { applicationId: parseInt(form.applicationId) },
      };
      if (editing) {
        await documentAPI.update(editing.documentId, payload);
        showNotification('Document updated successfully');
      } else {
        await documentAPI.upload(payload);
        showNotification('Document uploaded successfully');
      }
      setModal(false); load();
    } catch { showNotification('Error saving document', 'error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try { await documentAPI.delete(id); showNotification('Document deleted'); load(); }
    catch { showNotification('Error deleting document', 'error'); }
  };

  const getMeta = (type) => DOC_META[type] || DOC_META['Other'];

  return (
    <div>
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1568667256549-094345857637?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>Documents</h1>
            <p>{userRole === 'officer' ? 'View all documents submitted by students' : 'Upload and manage your documents'}</p>
          </div>
          {userRole === 'student' && (
            <button className="btn btn-gold" onClick={openAdd}>+ Upload Document</button>
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
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80"
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
              }}>"Every document tells the story of a student's journey."</div>
              <div style={{
                marginTop: 6, width: 40, height: 2,
                background: 'linear-gradient(90deg, var(--gold), transparent)'
              }} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-icon">📁</span>
            <div className="stat-value">{visibleDocs.length}</div>
            <div className="stat-label">Total Documents</div>
          </div>
          <div className="stat-card sage">
            <span className="stat-icon">✅</span>
            <div className="stat-value">{[...new Set(visibleDocs.map(d => d.docType))].length}</div>
            <div className="stat-label">Document Types</div>
          </div>
          <div className="stat-card ink">
            <span className="stat-icon">📋</span>
            <div className="stat-value">{[...new Set(visibleDocs.map(d => d.application?.applicationId).filter(Boolean))].length}</div>
            <div className="stat-label">Applications Covered</div>
          </div>
        </div>

        {userRole === 'officer' && (
          <div className="officer-notice">
            <div className="officer-notice-icon">🔍</div>
            <span>Officer view — preview all student documents submitted for admission.</span>
          </div>
        )}

        {visibleDocs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1568667256549-094345857637?w=300&q=80"
                alt="no docs"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <p>{userRole === 'student' ? 'No documents uploaded yet' : 'No documents found'}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {visibleDocs.map(d => {
              const meta = getMeta(d.docType);
              return (
                <div key={d.documentId} className="card" style={{
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  {/* Doc preview image */}
                  <div style={{
                    height: 130, position: 'relative', cursor: 'pointer', overflow: 'hidden'
                  }} onClick={() => setViewModal(d)}>
                    <img
                      src={meta.bg}
                      alt={d.docType}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(10,14,26,0.6) 0%, rgba(10,14,26,0.1) 100%)'
                    }} />
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: meta.color, color: meta.text,
                      fontFamily: 'Space Mono, monospace', fontSize: 9,
                      padding: '3px 10px', borderRadius: 20, letterSpacing: 1, fontWeight: 700
                    }}>
                      {d.docType?.toUpperCase()}
                    </div>
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.4)', color: 'white',
                      fontSize: 11, padding: '3px 10px', borderRadius: 12
                    }}>
                      👁 View
                    </div>
                    {userRole === 'officer' && (
                      <div style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'var(--teal)', color: 'white',
                        fontSize: 10, padding: '3px 10px', borderRadius: 12, fontWeight: 600
                      }}>
                        {d.application?.student?.name || `Student #${d.application?.student?.studentId}`}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 10, right: 10,
                      fontSize: 28
                    }}>
                      {meta.icon}
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--navy)' }}>
                      {d.docType || 'Document'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>
                      App #{d.application?.applicationId || '—'}
                      {userRole === 'officer' && ` · ${d.application?.student?.name || ''}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2 }}>
                      {d.application?.course?.name || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 14, fontFamily: 'Space Mono, monospace' }}>
                      {d.uploadedDate || '—'}
                    </div>
                    <div className="action-btns">
                      <button className="btn btn-sage btn-sm" onClick={() => setViewModal(d)}>
                        👁 Preview
                      </button>
                      {userRole === 'student' && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(d.documentId)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {modal && userRole === 'student' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Edit Document' : 'Upload Document'}</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {editing ? 'Update document details' : 'Link a document to your application'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Document Type</label>
                    <select value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })}>
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Your Application *</label>
                    <select value={form.applicationId} onChange={e => setForm({ ...form, applicationId: e.target.value })} required>
                      <option value="">Select your application...</option>
                      {myApps.map(a => (
                        <option key={a.applicationId} value={a.applicationId}>
                          App #{a.applicationId} — {a.course?.name || 'Course'} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {myApps.length === 0 && (
                  <div style={{
                    padding: 16, background: '#fef3c7', borderRadius: 10,
                    fontSize: 13, color: '#92400e', marginTop: 14,
                    border: '1px solid #fde68a'
                  }}>
                    ⚠️ You need to submit an application first before uploading documents.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={loading || myApps.length === 0}>
                  {loading ? <span className="spinner" /> : null}
                  {editing ? 'Save Changes' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header" style={{ padding: 0, border: 'none', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: 140 }}>
                <img
                  src={getMeta(viewModal.docType).bg}
                  alt={viewModal.docType}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(10,14,26,0.7) 0%, rgba(10,14,26,0.2) 100%)',
                  display: 'flex', alignItems: 'flex-end', padding: '0 28px 20px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'white', fontWeight: 600 }}>
                      {getMeta(viewModal.docType).icon} {viewModal.docType}
                    </h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Space Mono, monospace' }}>
                      DOCUMENT #{viewModal.documentId}
                    </div>
                  </div>
                  <button className="modal-close" onClick={() => setViewModal(null)}
                    style={{ color: 'white', background: 'rgba(255,255,255,0.15)' }}>×</button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                {[
                  { label: 'Document ID', value: `#${viewModal.documentId}` },
                  { label: 'Uploaded Date', value: viewModal.uploadedDate || '—' },
                  { label: 'Application', value: `#${viewModal.application?.applicationId || '—'}` },
                  { label: 'Student', value: viewModal.application?.student?.name || '—' },
                  { label: 'Course', value: viewModal.application?.course?.name || '—' },
                  { label: 'App Status', value: viewModal.application?.status || '—' },
                ].map(item => (
                  <div key={item.label} className="info-item">
                    <label>{item.label}</label>
                    <div className="info-value">{item.value}</div>
                  </div>
                ))}
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