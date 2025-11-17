import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        if (res.data.role === 'admin') {
          navigate('/admin/violations');
        } else {
          navigate('/violations');
        }
      } else {
        setError('لم يتم استقبال التوكن من السيرفر');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تسجيل الدخول، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-tight">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <input
                type="text"
                name="username"
                placeholder="اسم المستخدم"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                spellCheck="false"
                className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-500/50
                ${loading 
                  ? 'bg-emerald-700 cursor-not-allowed opacity-80' 
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25'
                }`}
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            ليس لديك حساب؟{' '}
            <Link 
              to="/register" 
              className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors duration-200"
            >
              سجل الآن
            </Link>
          </p>

          {error && (
            <div className="mt-6 p-4 bg-red-900/60 border border-red-700 rounded-xl">
              <p className="text-red-300 font-bold text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Optional: Footer text */}
        <p className="text-center text-gray-500 text-sm mt-8">
          نظام إدارة المخالفات المرورية © 2025
        </p>
      </div>
    </div>
  );
};

export default Login;
