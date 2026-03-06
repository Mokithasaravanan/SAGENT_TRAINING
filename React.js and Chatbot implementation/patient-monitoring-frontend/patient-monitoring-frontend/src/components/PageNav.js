import React from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_ORDER = [
  '/dashboard',
  '/patients',
  '/doctors',
  '/appointments',
  '/consultations',
  '/readings',
  '/health-data',
  '/messages',
  '/reports',
];

export default function PageNav({ currentPath }) {
  const navigate = useNavigate();
  const idx = PAGE_ORDER.indexOf(currentPath);
  const prev = idx > 0 ? PAGE_ORDER[idx - 1] : null;
  const next = idx < PAGE_ORDER.length - 1 ? PAGE_ORDER[idx + 1] : null;

  const labels = {
    '/dashboard': 'Dashboard',
    '/patients': 'Patients',
    '/doctors': 'Doctors',
    '/appointments': 'Appointments',
    '/consultations': 'Consultations',
    '/readings': 'Daily Readings',
    '/health-data': 'Health Data',
    '/messages': 'Messages',
    '/reports': 'Reports',
  };

  return (
    <div className="page-nav">
      <button
        className="btn btn-outline"
        onClick={() => prev && navigate(prev)}
        disabled={!prev}
        style={{ opacity: prev ? 1 : 0.3 }}
      >
        ← {prev ? labels[prev] : 'Start'}
      </button>
      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
        {idx + 1} / {PAGE_ORDER.length}
      </div>
      <button
        className="btn btn-outline"
        onClick={() => next && navigate(next)}
        disabled={!next}
        style={{ opacity: next ? 1 : 0.3 }}
      >
        {next ? labels[next] : 'End'} →
      </button>
    </div>
  );
}
