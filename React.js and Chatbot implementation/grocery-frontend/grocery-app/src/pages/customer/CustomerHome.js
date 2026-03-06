import React, { useState, useEffect, useRef } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

const CATEGORY_EMOJIS = { fruits: '🍎', vegetables: '🥦', dairy: '🥛', bakery: '🍞', meat: '🥩', beverages: '🧃', snacks: '🍿', default: '🛒' };
const getEmoji = (name = '') => CATEGORY_EMOJIS[name.toLowerCase()] || CATEGORY_EMOJIS.default;

const CATEGORY_IMAGES = {
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  meat: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  snacks: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
};
const getCatImg = (name = '') => CATEGORY_IMAGES[name.toLowerCase()] || CATEGORY_IMAGES.default;

const PRODUCT_IMAGES = {
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
  vegetables: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
  bakery: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80',
  meat: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&q=80',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
};
const getProductImg = (name = '') => PRODUCT_IMAGES[name.toLowerCase()] || PRODUCT_IMAGES.default;

const BANNER_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80', title: 'Fresh Groceries at Your Door 🚀', sub: 'Get ₹25 off on orders above ₹200!', color: 'rgba(27,94,32,0.72)' },
  { img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=80', title: 'Organic Fruits 🍎', sub: 'Handpicked fresh every morning', color: 'rgba(183,28,28,0.6)' },
  { img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80', title: 'Dairy Essentials 🥛', sub: 'Pure & fresh, delivered daily', color: 'rgba(0,96,100,0.65)' },
  { img: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=1200&q=80', title: 'Lightning Fast Delivery ⚡', sub: 'Order now, get it in 30 minutes!', color: 'rgba(230,81,0,0.65)' },
];

const PROMO_CARDS = [
  { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', title: '🎉 First Order', desc: 'Use code FRESH10 for 10% off', bg: '#fff3e0', accent: '#e65100' },
  { img: 'https://images.unsplash.com/photo-1553531384-411a247ccd73?w=400&q=80', title: '🚚 Free Delivery', desc: 'On orders above ₹499', bg: '#e8f5e9', accent: '#2e7d32' },
  { img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80', title: '🌿 Organic Week', desc: 'Up to 20% off on organic items', bg: '#f3e5f5', accent: '#6a1b9a' },
];

const ITEMS_PER_PAGE = 8;

export default function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(0);
  const [page, setPage] = useState(1);
  const { addToCart } = useCart();
  const { toast, showToast, hideToast } = useToast();
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([productAPI.getAll(), categoryAPI.getAll()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide banner
  useEffect(() => {
    timerRef.current = setInterval(() => setBanner(b => (b + 1) % BANNER_SLIDES.length), 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = () => { clearInterval(timerRef.current); timerRef.current = setInterval(() => setBanner(b => (b + 1) % BANNER_SLIDES.length), 4000); };
  const prevBanner = () => { setBanner(b => (b - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length); resetTimer(); };
  const nextBanner = () => { setBanner(b => (b + 1) % BANNER_SLIDES.length); resetTimer(); };

  const getCatName = (c) => c.categoryType ?? c.name ?? '';

  const filtered = products.filter(p => {
    const matchCat = !selectedCat || p.category?.categoryId === selectedCat;
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = (product) => {
    if (product.quantity <= 0) return;
    addToCart({ ...product, price: product.price, stock: product.quantity });
    showToast(`${product.name || 'Product'} added to cart! 🛒`);
  };

  const handleCatChange = (id) => { setSelectedCat(id); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🥦</div>
      <p style={{ color: '#2e7d32', fontWeight: 700, fontSize: 18 }}>Loading fresh products...</p>
    </div>
  );

  return (
    <div className="animate-in" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* ── HERO BANNER SLIDER ── */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 32, height: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <img src={BANNER_SLIDES[banner].img} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: BANNER_SLIDES[banner].color, transition: 'background 0.6s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, margin: '0 0 8px', textShadow: '0 2px 12px rgba(0,0,0,0.3)', maxWidth: 500 }}>{BANNER_SLIDES[banner].title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0 }}>{BANNER_SLIDES[banner].sub}</p>
        </div>

        {/* Prev / Next */}
        <button onClick={prevBanner} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer', backdropFilter: 'blur(4px)', fontWeight: 700 }}>‹</button>
        <button onClick={nextBanner} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer', backdropFilter: 'blur(4px)', fontWeight: 700 }}>›</button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
          {BANNER_SLIDES.map((_, i) => (
            <div key={i} onClick={() => { setBanner(i); resetTimer(); }} style={{ width: i === banner ? 22 : 8, height: 8, borderRadius: 4, background: i === banner ? 'white' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* ── PROMO CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {PROMO_CARDS.map(p => (
          <div key={p.title} style={{ background: p.bg, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: `1px solid ${p.accent}22` }}>
            <img src={p.img} alt={p.title} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: p.accent }}>{p.title}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY STRIP with images ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b2d1b', marginBottom: 14 }}>🛍️ Shop by Category</h2>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          <div onClick={() => handleCatChange(null)} style={{ flexShrink: 0, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${selectedCat === null ? '#2e7d32' : '#e0e0e0'}`, boxShadow: selectedCat === null ? '0 0 0 3px #c8e6c9' : 'none', transition: 'all 0.2s' }}>
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80" alt="All" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: selectedCat === null ? '#2e7d32' : '#555' }}>All</div>
          </div>
          {categories.map(c => (
            <div key={c.categoryId} onClick={() => handleCatChange(c.categoryId)} style={{ flexShrink: 0, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${selectedCat === c.categoryId ? '#2e7d32' : '#e0e0e0'}`, boxShadow: selectedCat === c.categoryId ? '0 0 0 3px #c8e6c9' : 'none', transition: 'all 0.2s' }}>
                <img src={getCatImg(getCatName(c))} alt={getCatName(c)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: selectedCat === c.categoryId ? '#2e7d32' : '#555' }}>{getEmoji(getCatName(c))} {getCatName(c)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ maxWidth: 420, width: '100%', padding: '12px 16px', border: '1.5px solid #c8e6c9', borderRadius: 12, fontSize: 14, background: '#f9fbe7', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* ── PRODUCT COUNT + PAGE INFO ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b2d1b', margin: 0 }}>
          🛒 {selectedCat ? `${getEmoji(getCatName(categories.find(c => c.categoryId === selectedCat) || {}))} Products` : 'All Products'}
          <span style={{ fontSize: 13, color: '#888', fontWeight: 600, marginLeft: 8 }}>({filtered.length} items)</span>
        </h2>
        {totalPages > 1 && (
          <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>Page {page} of {totalPages}</span>
        )}
      </div>

      {/* ── PRODUCT GRID ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 20, color: '#444' }}>No products found</h3>
          <p style={{ color: '#888' }}>Try a different search or category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 32 }}>
          {paginated.map(product => (
            <div key={product.productId} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e8f5e9', transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,125,50,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}>

              {/* Product Image */}
              <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: '#f1f8e9' }}>
                <img
                  src={getProductImg(getCatName(product.category || {}))}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                {product.quantity <= 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>Out of Stock</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#2e7d32', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  {getEmoji(getCatName(product.category || {}))}
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1b2d1b', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name || '(no name)'}</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{getCatName(product.category || {}) || 'Uncategorized'}</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#2e7d32', marginBottom: 8 }}>₹{product.price}</div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ background: product.quantity > 0 ? '#e8f5e9' : '#ffebee', color: product.quantity > 0 ? '#2e7d32' : '#c62828', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                    {product.quantity > 0 ? `✅ ${product.quantity} in stock` : '❌ Out of stock'}
                  </span>
                </div>
                <button
                  onClick={() => handleAdd(product)}
                  disabled={product.quantity <= 0}
                  style={{ width: '100%', padding: '9px', background: product.quantity <= 0 ? '#e0e0e0' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: product.quantity <= 0 ? '#aaa' : 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: product.quantity <= 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {product.quantity <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PREV / NEXT PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
            disabled={page === 1}
            style={{ padding: '10px 22px', background: page === 1 ? '#f0f0f0' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: page === 1 ? '#aaa' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            ‹ Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => { setPage(n); window.scrollTo(0, 0); }}
              style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: n === page ? 'linear-gradient(135deg,#2e7d32,#66bb6a)' : '#f1f8e9', color: n === page ? 'white' : '#2e7d32', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              {n}
            </button>
          ))}

          <button
            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
            disabled={page === totalPages}
            style={{ padding: '10px 22px', background: page === totalPages ? '#f0f0f0' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: page === totalPages ? '#aaa' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            Next ›
          </button>
        </div>
      )}

      {/* ── WHY US SECTION ── */}
      <div style={{ background: 'linear-gradient(135deg,#f1f8e9,#fff8f0)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b2d1b', marginBottom: 20, textAlign: 'center' }}>🌟 Why Choose GreenBasket?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
          {[
            { img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80', title: '🚀 30-Min Delivery', desc: 'Fast & reliable' },
            { img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200&q=80', title: '🌿 Always Fresh', desc: 'Farm sourced daily' },
            { img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80', title: '💰 Best Prices', desc: 'Unbeatable deals' },
            { img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80', title: '🔒 Safe Payments', desc: 'Secure checkout' },
          ].map(w => (
            <div key={w.title} style={{ textAlign: 'center' }}>
              <img src={w.img} alt={w.title} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1b2d1b', marginBottom: 2 }}>{w.title}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}