import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // لو مفيش توكن = مخفي تماماً
  if (!token) return null;

  // تحديد الروابط حسب الرول
  const getMenuItems = () => {
    const baseItems = [
      { to: '/', label: 'المخالفات' },
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { to: '/add', label: 'إضافة مخالفة' },
        { to: '/logs', label: 'سجل الأنشطة' },
      ];
    }

    if (role === 'hr') {
      return [
        ...baseItems,
        { to: '/add', label: 'إضافة مخالفة' },
      ];
    }

    // user عادي
    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* اللوجو */}
          <Link to="/" className="text-2xl font-bold text-emerald-400 whitespace-nowrap">
            مخالفات مرورية
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition"
            >
              تسجيل خروج
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 z-50"
          >
            {mobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-6 pt-4 border-t border-gray-800">
            <div className="flex flex-col gap-5 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-200 hover:text-white text-lg font-medium transition transform hover:translate-x-1"
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full text-right px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition transform hover:scale-105 active:scale-95"
              >
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
