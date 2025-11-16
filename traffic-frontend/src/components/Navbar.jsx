import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { to: '/', label: 'المخالفات', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )},
    ...(role === 'admin'
      ? [
          { to: '/add', label: 'إضافة مخالفات', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          )},
          { to: '/logs', label: 'سجل الأنشطة', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          )},
        ]
      : []),
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* ====================== Desktop Navbar ====================== */}
      <nav className="desktop-nav">
        <div className="logo">نظام المخالفات</div>
        <div className="desktop-links">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
        <button onClick={logout} className="logout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          تسجيل الخروج
        </button>
      </nav>

      {/* ====================== Mobile Header ====================== */}
      <div className="mobile-header">
        <button onClick={() => setIsOpen(!isOpen)} className="menu-toggle">
          <svg className="hamburger-icon" viewBox="0 0 100 80" width="30" height="30">
            <rect width="100" height="12" rx="6" fill="white"></rect>
            <rect y="34" width="100" height="12" rx="6" fill="white"></rect>
            <rect y="68" width="100" height="12" rx="6" fill="white"></rect>
          </svg>
        </button>
        <div className="mobile-logo">نظام المخالفات</div>
      </div>

      {/* ====================== Mobile Menu ====================== */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
          <div className="mobile-logo-menu">نظام المخالفات</div>
        </div>
        <div className="menu-links">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`menu-link ${isActive(item.to) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="menu-link-icon">{item.icon}</span>
              <span className="menu-link-text">{item.label}</span>
            </Link>
          ))}
        </div>
        <button onClick={logout} className="menu-logout">
          <span className="menu-link-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span className="menu-link-text">تسجيل الخروج</span>
        </button>
      </div>

      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

      {/* ====================== الأنماط ====================== */}
      <style jsx>{`
        .desktop-nav, .mobile-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 64px;
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
        }
        .logo, .mobile-logo, .mobile-logo-menu {
          font-size: 20px;
          font-weight: 700;
        }
        .desktop-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .nav-link {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 10px 16px;
          border-radius: 10px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-link:hover { background: rgba(255,255,255,0.15); }
        .nav-link.active { background: rgba(255,255,255,0.25); font-weight: 700; }
        .nav-icon svg { width: 22px; height: 22px; }
        .logout-btn {
          background: #ef4444;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logout-btn:hover { background: #dc2626; transform: translateY(-2px); }

        /* Mobile */
        .mobile-header { display: none; padding: 0 16px; height: 60px; }
        .menu-toggle { background: none; border: none; cursor: pointer; }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: ${isOpen ? '0' : '-100%'};
          width: 280px;
          height: 100vh;
          background: #0f172a;
          z-index: 1200;
          transition: right 0.35s ease;
          box-shadow: -8px 0 30px rgba(0,0,0,0.5);
          padding: 16px 0;
          overflow-y: auto;
        }
        .menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
        }
        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 32px;
          cursor: pointer;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        .menu-link, .menu-logout {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          color: #e2e8f0;
          text-decoration: none;
          font-size: 17px;
          font-weight: 500;
          transition: all 0.3s;
        }
        .menu-link:hover, .menu-logout:hover {
          background: rgba(59, 130, 246, 0.2);
          padding-right: 32px;
        }
        .menu-link.active {
          background: #3b82f6;
          color: white;
          font-weight: 700;
        }
        .menu-link-icon svg { width: 24px; height: 24px; }
        .menu-logout {
          background: #ef4444;
          border: none;
          border-radius: 12px;
          margin: 32px 20px 20px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          justify-content: center;
        }
        .menu-logout:hover { background: #dc2626; }

        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 1150;
          opacity: ${isOpen ? '1' : '0'};
          transition: opacity 0.35s;
          pointer-events: ${isOpen ? 'auto' : 'none'};
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-header { display: flex; }
          body { padding-top: 60px; }
        }
        @media (min-width: 769px) {
          .mobile-header, .mobile-menu, .backdrop { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
