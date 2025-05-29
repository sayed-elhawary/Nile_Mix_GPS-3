import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' }); // لا يوجد role في الفورم
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
      // ترسل بيانات بدون role (يتم افتراض role=user في الباك إند)
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>تسجيل حساب جديد</h2>
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
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading} style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>
      </form>
      <p style={styles.paragraph}>
        لديك حساب؟ <Link to="/login" style={styles.link}>سجل دخول</Link>
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
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  title: {
    marginBottom: 25,
    color: '#222',
    fontWeight: '700',
    fontSize: 28,
    letterSpacing: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  input: {
    padding: '14px 16px',
    fontSize: 17,
    borderRadius: 8,
    border: '1.8px solid #ccc',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    fontWeight: 500,
  },
  // تأثير عند التركيز على الحقل
  inputFocus: {
    borderColor: '#28a745',
    boxShadow: '0 0 8px rgba(40, 167, 69, 0.5)',
  },
  button: {
    padding: '14px',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.15s ease',
  },
  buttonDisabled: {
    backgroundColor: '#8bc34a',
    cursor: 'not-allowed',
  },
  paragraph: {
    marginTop: 22,
    fontSize: 15,
    color: '#555',
  },
  link: {
    color: '#28a745',
    textDecoration: 'none',
    fontWeight: '600',
  },
  error: {
    marginTop: 18,
    color: '#e74c3c',
    fontWeight: '700',
  },
};

export default Register;

