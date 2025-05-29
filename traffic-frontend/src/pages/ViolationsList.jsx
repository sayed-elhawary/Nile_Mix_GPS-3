import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViolationsList = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/violations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setViolations(res.data);
        setFilteredViolations(res.data);
      } catch (err) {
        console.error('خطأ في جلب المخالفات:', err);
        setError('حدث خطأ أثناء تحميل المخالفات، يرجى المحاولة لاحقاً');
      } finally {
        setIsLoading(false);
      }
    };
    fetchViolations();
  }, [navigate]);

  useEffect(() => {
    const results = violations.filter(violation =>
      violation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.amount.toString().includes(searchTerm)
    );
    setFilteredViolations(results);
  }, [searchTerm, violations]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openImage = (imgUrl) => {
    setSelectedImage(imgUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه المخالفة؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/violations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViolations((prev) => prev.filter((v) => v._id !== id));
      setFilteredViolations((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      alert('حدث خطأ أثناء حذف المخالفة.');
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // أنماط جديدة بتصميم عصري
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '30px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.04)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '20px',
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    title: {
      margin: 0,
      color: '#1a1a1a',
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 44px',
      fontSize: '15px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      '&:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
      },
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logoutButton: {
      backgroundColor: '#3b82f6',
      border: 'none',
      color: 'white',
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      '&:hover': {
        backgroundColor: '#2563eb',
      },
    },
    error: {
      color: '#ef4444',
      marginBottom: '15px',
      fontWeight: '600',
      textAlign: 'center',
      padding: '12px',
      backgroundColor: '#fee2e2',
      borderRadius: '8px',
      borderLeft: '4px solid #ef4444',
    },
    noData: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '18px',
      marginTop: '40px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
    },
    tableWrapper: {
      overflowX: 'auto',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      marginTop: '24px',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      minWidth: '800px',
    },
    tableHeader: {
      backgroundColor: '#f8fafc',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    tableHeaderCell: {
      padding: '16px',
      textAlign: 'right',
      fontWeight: '600',
      color: '#334155',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '14px',
    },
    row: {
      transition: 'all 0.2s ease',
      textAlign: 'right',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: '#f8fafc',
      },
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      color: '#475569',
    },
    image: {
      width: '80px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
      '&:hover': {
        backgroundColor: '#dc2626',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
      },
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px',
      backdropFilter: 'blur(8px)',
    },
    modalContent: {
      position: 'relative',
      maxWidth: '90%',
      maxHeight: '90%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    modalImage: {
      maxWidth: '100%',
      maxHeight: '80vh',
      borderRadius: '12px',
      display: 'block',
      margin: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      fontSize: '28px',
      color: '#64748b',
      cursor: 'pointer',
      fontWeight: 'bold',
      lineHeight: 1,
      transition: 'all 0.3s ease',
      '&:hover': {
        color: '#1e293b',
        transform: 'scale(1.1)',
      },
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    },
    loadingSpinner: {
      border: '4px solid rgba(59, 130, 246, 0.1)',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleContainer}>
          <h2 style={styles.title}>قائمة المخالفات</h2>
          <div style={styles.searchContainer}>
            <svg style={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="ابحث بالاسم، الكود أو المبلغ..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            aria-label="تسجيل الخروج"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {isLoading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      ) : filteredViolations.length === 0 ? (
        <p style={styles.noData}>
          {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد مخالفات مسجلة حالياً'}
        </p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>الكود</th>
                <th style={styles.tableHeaderCell}>الاسم</th>
                <th style={styles.tableHeaderCell}>الوظيفة</th>
                <th style={styles.tableHeaderCell}>نوع المخالفة</th>
                <th style={styles.tableHeaderCell}>المبلغ</th>
                <th style={styles.tableHeaderCell}>الصورة</th>
                {role === 'admin' && <th style={styles.tableHeaderCell}>إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map((v) => (
                <tr key={v._id} style={{...styles.row, '&:hover': {backgroundColor: '#f8fafc'}}}>
                  <td style={styles.tableCell}>{v.code}</td>
                  <td style={styles.tableCell}>{v.name}</td>
                  <td style={styles.tableCell}>{v.job}</td>
                  <td style={styles.tableCell}>{v.type}</td>
                  <td style={styles.tableCell}>{v.amount} ج.م</td>
                  <td style={styles.tableCell}>
                    {v.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`}
                        alt="مخالفة"
                        style={styles.image}
                        onClick={() =>
                          openImage(
                            `${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`
                          )
                        }
                        title="اضغط للتكبير"
                      />
                    ) : (
                      <span style={{color: '#94a3b8'}}>لا توجد صورة</span>
                    )}
                  </td>
                  {role === 'admin' && (
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleDelete(v._id)}
                        style={styles.deleteButton}
                        aria-label={`حذف مخالفة رقم ${v.code}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 3.96086 8.58579 3.58579C8.96086 3.21071 9.46957 3 10 3H14C14.5304 3 15.0391 3.21071 15.4142 3.58579C15.7893 3.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        إلغاء المخالفة
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedImage && (
        <div style={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true">
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={closeModal}
              aria-label="إغلاق تكبير الصورة"
            >
              ×
            </button>
            <img src={selectedImage} alt="تكبير المخالفة" style={styles.modalImage} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ViolationsList;
