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
    <div style={styles.container}>
      <h2 style={styles.title}>تسجيل الدخول</h2>
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <input
          type="text"
          name="username"
          placeholder="اسم المستخدم"
          value={formData.username}
          onChange={handleChange}
          required
          style={styles.input}
          autoComplete="username"
          spellCheck="false"
        />
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
      <p style={styles.text}>
        ليس لديك حساب؟ <Link to="/register" style={styles.link}>سجل الآن</Link>
      </p>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 420,
    margin: '60px auto',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#fff',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  title: {
    marginBottom: 30,
    color: '#222',
    fontWeight: '700',
    fontSize: 30,
    letterSpacing: 1,
    userSelect: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 22,
  },
  input: {
    padding: '14px 18px',
    fontSize: 17,
    borderRadius: 10,
    border: '2px solid #ddd',
    outline: 'none',
    fontWeight: 500,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)',
  },
  // تأثير عند التركيز على الحقل
  inputFocus: {
    borderColor: '#4CAF50',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)',
  },
  button: {
    padding: '15px',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.15s ease',
    userSelect: 'none',
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
    cursor: 'not-allowed',
  },
  text: {
    marginTop: 25,
    fontSize: 15,
    color: '#555',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'color 0.3s ease',
  },
  error: {
    marginTop: 20,
    color: '#e74c3c',
    fontWeight: '700',
  },
};

export default Login;

