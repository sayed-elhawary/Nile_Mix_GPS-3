import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    // استبدال الصفحة الحالية لتفادي الرجوع للصفحات المحمية بعد تسجيل الخروج
    navigate('/login', { replace: true });
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>المخالفات</Link>
      {role === 'admin' && <Link to="/add" style={styles.link}>تسجيل مخالفة</Link>}
      <button onClick={logout} style={styles.button}>تسجيل خروج</button>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    marginRight: 15,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#dc3545',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 16,
  },
};

export default Navbar;

