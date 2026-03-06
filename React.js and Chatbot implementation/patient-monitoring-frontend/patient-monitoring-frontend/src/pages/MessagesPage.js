import React, { useEffect, useState } from 'react';
import { messageAPI, consultationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = {
  senderId: '', receiverId: '', senderType: 'Doctor',
  subject: '', messageContent: '',
  messageDate: new Date().toISOString().slice(0, 16),
  isRead: false, priority: 'Normal', consultation: null
};

const PRIORITY = {
  High:   { color: '#E63946', bg: 'rgba(230,57,70,0.12)',   label: 'Urgent' },
  Normal: { color: '#2A9D8F', bg: 'rgba(42,157,143,0.12)',  label: 'Normal' },
  Low:    { color: '#8D9DB6', bg: 'rgba(141,157,182,0.12)', label: 'Low'    },
};

// Patient monitoring / medical Unsplash images
const MEDICAL_IMAGES = {
  heroBg:      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=500&fit=crop&crop=center',
  bgTile1:     'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
  bgTile2:     'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop',
  bgTile3:     'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
  bgTile4:     'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&h=400&fit=crop',
  bgTile5:     'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&h=400&fit=crop',
  bgTile6:     'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=500&h=400&fit=crop',
  bgTile7:     'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=400&fit=crop',
  bgTile8:     'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&h=400&fit=crop',
  stat1:       'https://images.unsplash.com/photo-1551076805-e1869033e561?w=120&h=120&fit=crop',
  stat2:       'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=120&h=120&fit=crop',
  stat3:       'https://images.unsplash.com/photo-1588776814546-1ffbb172b9b3?w=120&h=120&fit=crop',
  stat4:       'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&h=120&fit=crop',
  banner:      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&h=300&fit=crop&crop=center',
  bannerIcon:  'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=100&h=100&fit=crop',
  banner2:     'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=1400&h=300&fit=crop&crop=center',
  banner2Icon: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=100&h=100&fit=crop',
  emptyInbox:  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
  modalBg:     'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=200&fit=crop&crop=top',
  modalIcon:   'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=100&h=100&fit=crop',
  detailCover1:'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=700&h=180&fit=crop',
  detailCover2:'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=700&h=180&fit=crop',
  detailCover3:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=180&fit=crop',
  detailCover4:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&h=180&fit=crop',
};

const DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
];

const DETAIL_COVERS = [
  MEDICAL_IMAGES.detailCover1, MEDICAL_IMAGES.detailCover2,
  MEDICAL_IMAGES.detailCover3, MEDICAL_IMAGES.detailCover4,
];

const getAvatar = (id) => DOCTOR_AVATARS[Math.abs(id || 0) % DOCTOR_AVATARS.length];
const getCover  = (id) => DETAIL_COVERS[Math.abs(id || 0) % DETAIL_COVERS.length];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,800;1,400&family=Outfit:wght@300;400;500;600&display=swap');

  .mp *, .mp *::before, .mp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mp {
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    color: #1A1A2E;
    position: relative;
    background: #EEF0F5;
  }

  /* ════════════════════════════
     FIXED BACKGROUND IMAGE GRID
  ════════════════════════════ */
  .mp-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 6px;
    overflow: hidden;
  }
  .mp-bg-cell {
    overflow: hidden;
  }
  .mp-bg-cell img {
    width: 100%; height: 100%;
    object-fit: cover;
    animation: bgZoom 18s ease-in-out infinite alternate;
    opacity: 0;
    animation: bgReveal 1.5s forwards, bgZoom 20s 1.5s ease-in-out infinite alternate;
  }
  .mp-bg-cell:nth-child(1) img { animation-delay: 0s,   1.5s; }
  .mp-bg-cell:nth-child(2) img { animation-delay: 0.1s, 1.6s; }
  .mp-bg-cell:nth-child(3) img { animation-delay: 0.2s, 1.7s; }
  .mp-bg-cell:nth-child(4) img { animation-delay: 0.3s, 1.8s; }
  .mp-bg-cell:nth-child(5) img { animation-delay: 0.15s,1.65s;}
  .mp-bg-cell:nth-child(6) img { animation-delay: 0.25s,1.75s;}
  .mp-bg-cell:nth-child(7) img { animation-delay: 0.35s,1.85s;}
  .mp-bg-cell:nth-child(8) img { animation-delay: 0.05s,1.55s;}

  .mp-bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(238, 240, 245, 0.91);
    backdrop-filter: blur(1px);
  }

  /* ════════════════════
     CONTENT
  ════════════════════ */
  .mp-content { position: relative; z-index: 1; }

  /* ════════════════════
     HERO
  ════════════════════ */
  .mp-hero {
    position: relative;
    height: 300px;
    overflow: hidden;
  }
  .mp-hero-img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 30%;
    transform: scale(1.04);
    transition: transform 8s ease;
  }
  .mp-hero:hover .mp-hero-img { transform: scale(1); }

  .mp-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(
      160deg,
      rgba(8,20,40,0.82) 0%,
      rgba(8,20,40,0.55) 45%,
      rgba(238,240,245,1) 100%
    );
  }

  /* side image strips inside hero */
  .mp-hero-side-imgs {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 280px;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 3px;
    overflow: hidden;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.7), transparent);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.7), transparent);
  }
  .mp-hero-side-imgs img {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: saturate(0.6) brightness(0.7);
    transition: filter 0.4s;
  }
  .mp-hero-side-imgs img:hover { filter: saturate(1) brightness(0.9); }

  .mp-hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 2.5rem 3rem;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .mp-hero-title {
    font-family: 'Fraunces', serif;
    font-size: 3.4rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.0;
    letter-spacing: -0.03em;
    text-shadow: 0 4px 30px rgba(0,0,0,0.4);
  }
  .mp-hero-title em { color: #5CE0D0; font-style: normal; }

  .mp-hero-sub {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 0.5rem;
  }

  .mp-hero-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.85rem;
  }

  .mp-hero-avatar-strip {
    display: flex;
    align-items: center;
  }
  .mp-hero-avatar-strip img {
    width: 44px; height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid rgba(255,255,255,0.55);
    margin-left: -13px;
    transition: transform 0.2s, z-index 0s;
    cursor: default;
  }
  .mp-hero-avatar-strip img:first-child { margin-left: 0; }
  .mp-hero-avatar-strip img:hover { transform: translateY(-4px) scale(1.1); z-index: 5; }

  .mp-hero-tag {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.06em;
    text-align: right;
  }

  .mp-compose-btn {
    display: flex; align-items: center; gap: 0.55rem;
    background: linear-gradient(135deg, #2A9D8F, #1A7A6E);
    color: #fff; border: none; border-radius: 50px;
    padding: 0.85rem 1.8rem;
    font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 500;
    cursor: pointer; transition: all 0.22s;
    box-shadow: 0 6px 24px rgba(42,157,143,0.42);
    white-space: nowrap;
  }
  .mp-compose-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(42,157,143,0.55); }

  /* ════════════════════
     BODY
  ════════════════════ */
  .mp-body { padding: 0 3rem 3rem; }

  /* ════════════════════
     STATS
  ════════════════════ */
  .mp-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) { .mp-stats { grid-template-columns: repeat(2,1fr); } }

  .mp-stat {
    background: #fff;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 2px 18px rgba(26,26,46,0.08);
    animation: fadeUp 0.5s both;
    cursor: default;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .mp-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(26,26,46,0.13); }

  .mp-stat-img-wrap {
    width: 100%; height: 90px; overflow: hidden; position: relative;
  }
  .mp-stat-img-wrap img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  .mp-stat:hover .mp-stat-img-wrap img { transform: scale(1.06); }
  .mp-stat-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.45));
  }
  .mp-stat-img-val {
    position: absolute;
    bottom: 8px; right: 12px;
    font-family: 'Fraunces', serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    line-height: 1;
  }
  .mp-stat-footer {
    padding: 0.65rem 1rem;
    font-size: 0.72rem;
    color: #8D9DB6;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
  }

  /* ════════════════════
     BANNERS
  ════════════════════ */
  .mp-banners {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 700px) { .mp-banners { grid-template-columns: 1fr; } }

  .mp-banner {
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    height: 110px;
    cursor: default;
    animation: fadeUp 0.5s 0.18s both;
  }
  .mp-banner img.bg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 40%;
    transition: transform 0.5s;
  }
  .mp-banner:hover img.bg { transform: scale(1.04); }
  .mp-banner-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(8,20,40,0.82) 0%, rgba(8,20,40,0.35) 65%, transparent 100%);
    display: flex; align-items: center;
    padding: 0 1.5rem; gap: 1rem;
  }
  .mp-banner-icon {
    width: 48px; height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
  }
  .mp-banner h3 {
    font-family: 'Fraunces', serif;
    font-size: 1.1rem; font-weight: 600;
    color: #fff; line-height: 1.2;
  }
  .mp-banner p {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.5);
    margin-top: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ════════════════════
     LAYOUT
  ════════════════════ */
  .mp-layout { display: grid; gap: 1.5rem; }
  .mp-layout.split { grid-template-columns: 1fr 1fr; }
  @media (max-width: 860px) { .mp-layout.split { grid-template-columns: 1fr; } }

  /* ════════════════════
     CARD
  ════════════════════ */
  .mp-card {
    background: #fff;
    border-radius: 24px;
    padding: 1.75rem;
    box-shadow: 0 2px 20px rgba(26,26,46,0.07);
    animation: fadeUp 0.5s 0.25s both;
  }

  .mp-card-header {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .mp-card-header-img {
    width: 40px; height: 40px;
    border-radius: 12px; object-fit: cover;
    border: 1.5px solid #E4DDD4;
  }
  .mp-card-title {
    font-family: 'Fraunces', serif;
    font-size: 1.25rem; font-weight: 600;
    color: #1A1A2E; flex: 1;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .mp-card-pill {
    font-family: 'Outfit', sans-serif;
    font-size: 0.68rem;
    background: #EEF0F5;
    color: #8D9DB6;
    padding: 0.18rem 0.6rem;
    border-radius: 20px;
    font-weight: 400;
  }

  /* ════════════════════
     MESSAGE ROW
  ════════════════════ */
  .mp-row {
    display: flex; align-items: center; gap: 0.9rem;
    padding: 0.85rem;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.18s;
    border: 1.5px solid transparent;
    margin-bottom: 0.4rem;
    position: relative;
  }
  .mp-row:hover  { background: #F5F3EF; border-color: #E0D9CF; }
  .mp-row.active { background: rgba(42,157,143,0.07); border-color: rgba(42,157,143,0.28); }

  .mp-row-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid #E4DDD4;
    transition: border-color 0.2s;
  }
  .mp-row:hover .mp-row-avatar { border-color: #2A9D8F; }
  .mp-row.active .mp-row-avatar { border-color: #2A9D8F; }

  .mp-row-body { flex: 1; min-width: 0; }
  .mp-row-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.22rem; gap: 0.5rem; }

  .mp-row-subject {
    font-weight: 500; font-size: 0.88rem; color: #1A1A2E;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mp-row.unread .mp-row-subject { font-weight: 700; }

  .unread-dot {
    display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; background: #E63946;
    margin-right: 0.4rem; flex-shrink: 0;
    vertical-align: middle;
  }

  .mp-row-meta    { font-size: 0.72rem; color: #8D9DB6; margin-bottom: 0.22rem; }
  .mp-row-preview { font-size: 0.78rem; color: #9AAAB8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .mp-row-side { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0; }

  .p-badge {
    font-size: 0.63rem; font-weight: 600;
    letter-spacing: 0.05em; padding: 0.18rem 0.55rem;
    border-radius: 20px; text-transform: uppercase;
  }

  .icon-btn {
    background: none; border: 1px solid #E4DDD4;
    border-radius: 8px; padding: 0.22rem 0.5rem;
    font-size: 0.78rem; cursor: pointer;
    color: #8D9DB6; transition: all 0.15s; line-height: 1.4;
  }
  .icon-btn:hover     { background: #EEF0F5; color: #1A1A2E; }
  .icon-btn.del:hover { background: rgba(230,57,70,0.08); border-color: rgba(230,57,70,0.3); color: #E63946; }

  /* ════════════════════
     EMPTY STATE
  ════════════════════ */
  .mp-empty {
    text-align: center; padding: 2.5rem 1rem; color: #8D9DB6;
  }
  .mp-empty-img {
    width: 100%; height: 140px; object-fit: cover;
    border-radius: 16px; opacity: 0.35;
    filter: saturate(0); margin-bottom: 1rem;
  }
  .mp-empty p { font-size: 0.85rem; font-style: italic; }

  /* ════════════════════
     DETAIL PANEL
  ════════════════════ */
  .mp-detail-cover {
    border-radius: 18px; overflow: hidden;
    position: relative; height: 140px;
    margin-bottom: 1.25rem;
  }
  .mp-detail-cover img.cover-bg {
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(0.5) saturate(0.6);
    transition: transform 0.5s;
  }
  .mp-detail-cover:hover img.cover-bg { transform: scale(1.04); }
  .mp-detail-cover-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(13,59,54,0.88), rgba(26,43,60,0.6));
    display: flex; align-items: flex-end;
    padding: 1rem 1.2rem; gap: 0.75rem;
  }
  .mp-detail-cover img.face {
    width: 52px; height: 52px;
    border-radius: 50%; object-fit: cover;
    border: 2.5px solid rgba(255,255,255,0.4);
    flex-shrink: 0;
  }
  .mp-dc-name { font-family: 'Fraunces', serif; font-size: 1rem; color: #fff; font-weight: 600; }
  .mp-dc-role { font-size: 0.68rem; color: rgba(255,255,255,0.55); letter-spacing: 0.06em; text-transform: uppercase; }

  .mp-detail-subject {
    font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 600;
    color: #1A1A2E; margin-bottom: 1rem; line-height: 1.35;
  }
  .mp-detail-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.75rem; margin-bottom: 1.25rem;
  }
  .mp-df-label { font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.08em; color: #8D9DB6; margin-bottom: 0.2rem; }
  .mp-df-val   { font-size: 0.85rem; font-weight: 500; color: #1A1A2E; }

  .mp-detail-body {
    background: #F5F3EF; border-radius: 14px;
    padding: 1.2rem; font-size: 0.86rem;
    color: #3A3A5C; line-height: 1.85;
  }

  /* ════════════════════
     QUICK IMAGES STRIP
  ════════════════════ */
  .mp-img-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 1.5rem;
    animation: fadeUp 0.5s 0.35s both;
  }
  .mp-img-strip-cell {
    border-radius: 14px; overflow: hidden;
    height: 80px; position: relative; cursor: default;
  }
  .mp-img-strip-cell img {
    width: 100%; height: 100%;
    object-fit: cover; transition: transform 0.4s;
  }
  .mp-img-strip-cell:hover img { transform: scale(1.08); }
  .mp-img-strip-cell-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.65));
    color: #fff; font-size: 0.62rem;
    letter-spacing: 0.05em; text-transform: uppercase;
    padding: 0.4rem 0.55rem; line-height: 1.3;
  }

  /* ════════════════════
     CLOSE BTN
  ════════════════════ */
  .close-btn {
    background: none; border: none; font-size: 1.1rem;
    cursor: pointer; color: #8D9DB6;
    padding: 0.2rem; line-height: 1; transition: color 0.15s;
  }
  .close-btn:hover { color: #1A1A2E; }

  /* ════════════════════
     MODAL
  ════════════════════ */
  .mp-overlay {
    position: fixed; inset: 0;
    background: rgba(15,25,45,0.65);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: fadein 0.2s both;
  }
  .mp-modal {
    background: #fff; border-radius: 28px;
    width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 28px 80px rgba(15,25,45,0.28);
    animation: scaleIn 0.25s both;
  }
  .mp-modal-hero {
    position: relative; height: 120px;
    border-radius: 28px 28px 0 0; overflow: hidden;
  }
  .mp-modal-hero img.modal-bg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 35%;
    filter: brightness(0.42) saturate(0.5);
  }
  .mp-modal-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(13,59,54,0.88), rgba(26,43,60,0.65));
    display: flex; align-items: center;
    padding: 0 1.75rem; gap: 1rem;
  }
  .mp-modal-icon {
    width: 52px; height: 52px;
    border-radius: 16px; object-fit: cover;
    border: 2px solid rgba(255,255,255,0.28);
    flex-shrink: 0;
  }
  .mp-modal-title {
    font-family: 'Fraunces', serif; font-size: 1.4rem;
    font-weight: 600; color: #fff; flex: 1;
  }

  /* side image thumbnails inside modal */
  .mp-modal-side-imgs {
    display: flex; gap: 0.4rem; flex-shrink: 0;
  }
  .mp-modal-side-imgs img {
    width: 34px; height: 34px;
    border-radius: 8px; object-fit: cover;
    border: 1.5px solid rgba(255,255,255,0.22);
    filter: saturate(0.5) brightness(0.7);
    transition: filter 0.2s;
  }
  .mp-modal-side-imgs img:hover { filter: saturate(1) brightness(0.9); }

  .mp-form { padding: 1.75rem; }
  .mp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .full    { grid-column: 1/-1; }

  .mp-label {
    display: block; font-size: 0.72rem;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: #8D9DB6; margin-bottom: 0.38rem; font-weight: 500;
  }
  .mp-input {
    width: 100%; background: #F5F3EF;
    border: 1.5px solid #E0D9CF; border-radius: 12px;
    padding: 0.72rem 1rem;
    font-family: 'Outfit', sans-serif; font-size: 0.87rem;
    color: #1A1A2E; outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .mp-input:focus   { border-color: #2A9D8F; background: #fff; }
  textarea.mp-input { resize: vertical; min-height: 96px; }
  select.mp-input   { cursor: pointer; }

  .mp-check-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.72rem 1rem; background: #F5F3EF;
    border-radius: 12px; border: 1.5px solid #E0D9CF;
    cursor: pointer; font-size: 0.85rem; color: #3A3A5C;
  }
  .mp-check-row input { width: 16px; height: 16px; accent-color: #2A9D8F; cursor: pointer; }

  .mp-modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
  .btn-cancel {
    flex: 1; padding: 0.82rem;
    background: #EEF0F5; border: none; border-radius: 50px;
    font-family: 'Outfit', sans-serif; font-size: 0.87rem; font-weight: 500;
    color: #8D9DB6; cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { background: #E0D9CF; color: #1A1A2E; }
  .btn-send {
    flex: 1; padding: 0.82rem;
    background: linear-gradient(135deg, #2A9D8F, #1A7A6E);
    border: none; border-radius: 50px;
    font-family: 'Outfit', sans-serif; font-size: 0.87rem; font-weight: 500;
    color: #fff; cursor: pointer; transition: all 0.22s;
    box-shadow: 0 4px 18px rgba(42,157,143,0.35);
  }
  .btn-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(42,157,143,0.48); }
  .btn-send:disabled { opacity: 0.55; cursor: not-allowed; }

  /* ════════════════════
     KEYFRAMES
  ════════════════════ */
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadein  { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes bgReveal { from { opacity:0; transform:scale(1.05); } to { opacity:1; } }
  @keyframes bgZoom   { from { transform:scale(1); } to { transform:scale(1.06); } }

  @media (max-width: 700px) {
    .mp-hero-content { padding: 2rem 1.5rem; }
    .mp-hero-title   { font-size: 2.4rem; }
    .mp-hero-side-imgs { display: none; }
    .mp-body         { padding: 0 1.5rem 2rem; }
    .mp-grid         { grid-template-columns: 1fr; }
    .mp-img-strip    { grid-template-columns: repeat(2,1fr); }
  }
`;

export default function MessagesPage() {
  const { user, userType } = useAuth();
  const [messages, setMessages]           = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [saving, setSaving]               = useState(false);
  const [selected, setSelected]           = useState(null);

  const load = async () => {
    try {
      const [m, c] = await Promise.all([messageAPI.getAll(), consultationAPI.getAll()]);
      setMessages(m.data); setConsultations(c.data);
    } catch { toast.error('Failed to load messages'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCompose = () => {
    setEditing(null);
    setForm({ ...EMPTY, senderId: user?.patientId || user?.doctorId || '', senderType: userType === 'doctor' ? 'Doctor' : 'Patient' });
    setShowModal(true);
  };
  const openEdit = (m) => {
    setEditing(m.messageId);
    setForm({
      senderId: m.senderId, receiverId: m.receiverId, senderType: m.senderType,
      subject: m.subject, messageContent: m.messageContent,
      messageDate: m.messageDate?.slice(0,16) || '',
      isRead: m.isRead, priority: m.priority || 'Normal',
      consultation: m.consultation ? { consultId: m.consultation.consultId } : null
    });
    setShowModal(true);
  };
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, senderId: parseInt(form.senderId)||0, receiverId: parseInt(form.receiverId)||0 };
      if (!payload.consultation?.consultId) payload.consultation = null;
      editing ? await messageAPI.update(editing, payload) : await messageAPI.create(payload);
      toast.success(editing ? 'Updated!' : 'Sent!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try { await messageAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const stats = [
    { label: 'Total Messages', value: messages.length,                          img: MEDICAL_IMAGES.stat1 },
    { label: 'Unread',         value: messages.filter(m=>!m.isRead).length,    img: MEDICAL_IMAGES.stat2 },
    { label: 'Urgent',         value: messages.filter(m=>m.priority==='High').length, img: MEDICAL_IMAGES.stat3 },
    { label: 'Read',           value: messages.filter(m=>m.isRead).length,     img: MEDICAL_IMAGES.stat4 },
  ];

  const IMG_STRIP = [
    { src: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop', label: 'Vitals Monitor' },
    { src: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop', label: 'ICU Care' },
    { src: 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=400&h=200&fit=crop', label: 'ECG Readings' },
    { src: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop', label: 'Patient Care' },
  ];

  return (
    <div className="mp">
      <style>{css}</style>

      {/* ════ BACKGROUND IMAGE GRID ════ */}
      <div className="mp-bg">
        {[
          MEDICAL_IMAGES.bgTile1, MEDICAL_IMAGES.bgTile2,
          MEDICAL_IMAGES.bgTile3, MEDICAL_IMAGES.bgTile4,
          MEDICAL_IMAGES.bgTile5, MEDICAL_IMAGES.bgTile6,
          MEDICAL_IMAGES.bgTile7, MEDICAL_IMAGES.bgTile8,
        ].map((src, i) => (
          <div key={i} className="mp-bg-cell">
            <img src={src} alt="" aria-hidden="true" />
          </div>
        ))}
        <div className="mp-bg-overlay" />
      </div>

      <div className="mp-content">

        {/* ════ HERO ════ */}
        <div className="mp-hero">
          <img className="mp-hero-img" src={MEDICAL_IMAGES.heroBg} alt="patient monitoring background" />
          <div className="mp-hero-gradient" />

          {/* Side image strips */}
          <div className="mp-hero-side-imgs">
            <img src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300&h=120&fit=crop" alt="" />
            <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&h=120&fit=crop" alt="" />
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=120&fit=crop" alt="" />
          </div>

          <div className="mp-hero-content">
            <div>
              <h1 className="mp-hero-title">Patient<br /><em>Messages</em></h1>
              <p className="mp-hero-sub">Secure Doctor–Patient Communication Hub</p>
            </div>
            <div className="mp-hero-right">
              <div className="mp-hero-avatar-strip">
                {DOCTOR_AVATARS.slice(0,5).map((src,i) => (
                  <img key={i} src={src} alt="care team member" />
                ))}
              </div>
              <p className="mp-hero-tag">Your care team</p>
              <button className="mp-compose-btn" onClick={openCompose}>
                ✉️ Compose Message
              </button>
            </div>
          </div>
        </div>

        <div className="mp-body">

          {/* ════ STATS ════ */}
          <div className="mp-stats">
            {stats.map((s,i) => (
              <div key={i} className="mp-stat" style={{ animationDelay: `${i*0.07}s` }}>
                <div className="mp-stat-img-wrap">
                  <img src={s.img} alt={s.label} />
                  <div className="mp-stat-img-overlay" />
                  <div className="mp-stat-img-val">{loading ? '—' : s.value}</div>
                </div>
                <div className="mp-stat-footer">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ════ DUAL BANNERS ════ */}
          <div className="mp-banners">
            <div className="mp-banner">
              <img className="bg" src={MEDICAL_IMAGES.banner} alt="monitoring" />
              <div className="mp-banner-overlay">
                <img className="mp-banner-icon" src={MEDICAL_IMAGES.bannerIcon} alt="" />
                <div>
                  <h3>Live Patient Monitoring</h3>
                  <p>Real-time vitals · Secure channel</p>
                </div>
              </div>
            </div>
            <div className="mp-banner">
              <img className="bg" src={MEDICAL_IMAGES.banner2} alt="care team" />
              <div className="mp-banner-overlay">
                <img className="mp-banner-icon" src={MEDICAL_IMAGES.banner2Icon} alt="" />
                <div>
                  <h3>24/7 Care Coordination</h3>
                  <p>Connected team · Instant alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* ════ INBOX + DETAIL ════ */}
          <div className={`mp-layout ${selected ? 'split' : ''}`}>

            {/* INBOX */}
            <div className="mp-card">
              <div className="mp-card-header">
                <img className="mp-card-header-img"
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop"
                  alt="" />
                <div className="mp-card-title">
                  Inbox
                  <span className="mp-card-pill">{messages.length} messages</span>
                </div>
              </div>

              {loading ? (
                <div className="mp-empty"><p>Loading…</p></div>
              ) : messages.length === 0 ? (
                <div className="mp-empty">
                  <img className="mp-empty-img" src={MEDICAL_IMAGES.emptyInbox} alt="empty inbox" />
                  <p>No messages yet</p>
                </div>
              ) : messages.map(m => {
                const pm = PRIORITY[m.priority] || PRIORITY.Normal;
                return (
                  <div key={m.messageId}
                    className={`mp-row ${!m.isRead ? 'unread' : ''} ${selected?.messageId === m.messageId ? 'active' : ''}`}
                    onClick={() => setSelected(m)}>
                    <img className="mp-row-avatar" src={getAvatar(m.senderId)} alt="sender"
                      onError={e => { e.target.src = DOCTOR_AVATARS[0]; }} />
                    <div className="mp-row-body">
                      <div className="mp-row-top">
                        <span className="mp-row-subject">
                          {!m.isRead && <span className="unread-dot" />}
                          {m.subject || '(No subject)'}
                        </span>
                      </div>
                      <div className="mp-row-meta">{m.senderType} #{m.senderId} → #{m.receiverId}</div>
                      <div className="mp-row-preview">{m.messageContent}</div>
                    </div>
                    <div className="mp-row-side">
                      <span className="p-badge" style={{ color: pm.color, background: pm.bg }}>{pm.label}</span>
                      <div style={{ display:'flex', gap:'0.3rem' }}>
                        <button className="icon-btn" onClick={e => { e.stopPropagation(); openEdit(m); }}>✏️</button>
                        <button className="icon-btn del" onClick={e => { e.stopPropagation(); handleDelete(m.messageId); }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETAIL */}
            {selected && (
              <div className="mp-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <div className="mp-card-title" style={{ margin:0 }}>Message Detail</div>
                  <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
                </div>

                <div className="mp-detail-cover">
                  <img className="cover-bg" src={getCover(selected.messageId)} alt="context" />
                  <div className="mp-detail-cover-overlay">
                    <img className="face" src={getAvatar(selected.senderId)} alt="sender"
                      onError={e => { e.target.src = DOCTOR_AVATARS[0]; }} />
                    <div>
                      <div className="mp-dc-name">{selected.senderType} #{selected.senderId}</div>
                      <div className="mp-dc-role">To Recipient #{selected.receiverId}</div>
                    </div>
                  </div>
                </div>

                <div className="mp-detail-subject">{selected.subject || '(No subject)'}</div>

                <div className="mp-detail-grid">
                  {[
                    ['Priority', selected.priority],
                    ['Status',   selected.isRead ? '✅ Read' : '🔴 Unread'],
                    ['Date',     selected.messageDate?.slice(0,16)],
                    ['Consult',  selected.consultation ? `#${selected.consultation.consultId}` : 'None'],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div className="mp-df-label">{k}</div>
                      <div className="mp-df-val">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="mp-df-label" style={{ marginBottom:'0.5rem' }}>Message</div>
                <div className="mp-detail-body">{selected.messageContent}</div>
              </div>
            )}
          </div>

          {/* ════ IMAGE STRIP ════ */}
          <div className="mp-img-strip">
            {IMG_STRIP.map((item,i) => (
              <div key={i} className="mp-img-strip-cell">
                <img src={item.src} alt={item.label} />
                <div className="mp-img-strip-cell-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'1.5rem' }}>
            <PageNav currentPath="/messages" />
          </div>
        </div>
      </div>

      {/* ════ COMPOSE MODAL ════ */}
      {showModal && (
        <div className="mp-overlay" onClick={() => setShowModal(false)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-hero">
              <img className="modal-bg" src={MEDICAL_IMAGES.modalBg} alt="" />
              <div className="mp-modal-hero-overlay">
                <img className="mp-modal-icon" src={MEDICAL_IMAGES.modalIcon} alt="" />
                <span className="mp-modal-title">{editing ? 'Edit Message' : 'New Message'}</span>
                <div className="mp-modal-side-imgs">
                  <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=80&h=80&fit=crop" alt="" />
                  <img src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=80&h=80&fit=crop" alt="" />
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&h=80&fit=crop" alt="" />
                </div>
                <button className="close-btn" style={{ color:'rgba(255,255,255,0.6)' }} onClick={() => setShowModal(false)}>✕</button>
              </div>
            </div>

            <div className="mp-form">
              <div className="mp-grid">
                <div>
                  <label className="mp-label">Sender ID</label>
                  <input className="mp-input" type="number" placeholder="Sender ID"
                    value={form.senderId} onChange={e => setForm({...form, senderId: e.target.value})} />
                </div>
                <div>
                  <label className="mp-label">Receiver ID</label>
                  <input className="mp-input" type="number" placeholder="Receiver ID" required
                    value={form.receiverId} onChange={e => setForm({...form, receiverId: e.target.value})} />
                </div>
                <div>
                  <label className="mp-label">Sender Type</label>
                  <select className="mp-input" value={form.senderType} onChange={e => setForm({...form, senderType: e.target.value})}>
                    <option>Doctor</option><option>Patient</option>
                  </select>
                </div>
                <div>
                  <label className="mp-label">Priority</label>
                  <select className="mp-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option>Normal</option><option>High</option><option>Low</option>
                  </select>
                </div>
                <div className="full">
                  <label className="mp-label">Subject</label>
                  <input className="mp-input" placeholder="Subject" required
                    value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                </div>
                <div className="full">
                  <label className="mp-label">Message</label>
                  <textarea className="mp-input" placeholder="Write your message…" required
                    value={form.messageContent} onChange={e => setForm({...form, messageContent: e.target.value})} />
                </div>
                <div>
                  <label className="mp-label">Date & Time</label>
                  <input className="mp-input" type="datetime-local"
                    value={form.messageDate} onChange={e => setForm({...form, messageDate: e.target.value})} />
                </div>
                <div>
                  <label className="mp-label">Consultation</label>
                  <select className="mp-input" value={form.consultation?.consultId || ''}
                    onChange={e => setForm({...form, consultation: e.target.value ? { consultId: parseInt(e.target.value) } : null})}>
                    <option value="">None</option>
                    {consultations.map(c => <option key={c.consultId} value={c.consultId}>Consult #{c.consultId}</option>)}
                  </select>
                </div>
                <div className="full">
                  <label className="mp-check-row">
                    <input type="checkbox" checked={form.isRead}
                      onChange={e => setForm({...form, isRead: e.target.checked})} />
                    <span>Mark as Read</span>
                  </label>
                </div>
              </div>
              <div className="mp-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-send" onClick={handleSave} disabled={saving}>
                  {saving ? 'Sending…' : editing ? '✅ Update' : '📤 Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}