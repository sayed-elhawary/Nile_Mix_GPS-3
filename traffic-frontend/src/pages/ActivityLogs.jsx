import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showAdd, setShowAdd] = useState(true);
  const [showDelete, setShowDelete] = useState(true);
  const [showUpdatePercentage, setShowUpdatePercentage] = useState(true);

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedLogs = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLogs(sortedLogs);
      setFilteredLogs(sortedLogs);
      setError('');
    } catch (err) {
      console.error('خطأ في جلب اللوجز:', err);
      setError('فشل في تحميل سجل الأنشطة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [navigate]);

  // تحديث فوري كل ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      const lastRefresh = localStorage.getItem('logsNeedRefresh');
      const previous = localStorage.getItem('lastLogsRefreshCheck');
      if (lastRefresh && lastRefresh !== previous) {
        localStorage.setItem('lastLogsRefreshCheck', lastRefresh);
        fetchLogs();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // فلترة اللوجز
  useEffect(() => {
    let results = logs;

    if (searchTerm) {
      results = results.filter(log => {
        const details = log.details || {};
        const code = (details.code || '').toString().toLowerCase();
        const name = (details.name || '').toString().toLowerCase();
        return code.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
      });
    }

    if (startDate || endDate) {
      results = results.filter(log => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
        return true;
      });
    }

    results = results.filter(log => {
      if (log.action === 'ADD_VIOLATION' && !showAdd) return false;
      if (log.action === 'DELETE_VIOLATION' && !showDelete) return false;
      if (log.action === 'UPDATE_PERCENTAGE' && !showUpdatePercentage) return false;
      return true;
    });

    setFilteredLogs(results);
  }, [logs, searchTerm, startDate, endDate, showAdd, showDelete, showUpdatePercentage]);

  const getActionText = (action, details = {}) => {
    switch (action) {
      case 'ADD_VIOLATION':
        return `أضاف مخالفة جديدة لـ "${details.name || 'غير محدد'}" (كود: ${details.code || 'غير محدد'})`;
      case 'DELETE_VIOLATION':
        return `حذف مخالفة لـ "${details.name || 'غير محدد'}" (كود: ${details.code || 'غير محدد'})`;
      case 'UPDATE_PERCENTAGE':
        return `عدّل نسبة الشركة لـ "${details.name || 'غير محدد'}" من ${details.oldPercentage || 0}% → ${details.newPercentage || 0}%`;
      default:
        return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ADD_VIOLATION': return '#10B981';
      case 'DELETE_VIOLATION': return '#EF4444';
      case 'UPDATE_PERCENTAGE': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const handleSelectAll = () => {
    const allSelected = showAdd && showDelete && showUpdatePercentage;
    setShowAdd(!allSelected);
    setShowDelete(!allSelected);
    setShowUpdatePercentage(!allSelected);
  };

  const filters = [
    { label: 'إضافة مخالفة', state: showAdd, set: setShowAdd, color: '#10B981' },
    { label: 'حذف مخالفة', state: showDelete, set: setShowDelete, color: '#EF4444' },
    { label: 'تعديل نسبة الشركة', state: showUpdatePercentage, set: setShowUpdatePercentage, color: '#3B82F6' },
  ];

  if (role !== 'admin') {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <h2 style={styles.accessDenied}>غير مصرح لك برؤية سجل الأنشطة</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <h2 style={styles.title}>سجل الأنشطة</h2>

        {/* شريط التحكم */}
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="ابحث بالكود أو الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.dateGroup}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
          </div>
        </div>

        {/* الفلاتر */}
        <div style={styles.filters}>
          <label style={styles.checkboxLabel} onClick={handleSelectAll}>
            <input type="checkbox" checked={showAdd && showDelete && showUpdatePercentage} onChange={handleSelectAll} style={styles.checkbox} />
            <span style={styles.selectAllText}>تحديد الكل</span>
          </label>
          {filters.map(({ label, state, set, color }) => (
            <label key={label} style={styles.checkboxLabel}>
              <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} style={{...styles.checkbox, accentColor: color}} />
              <span style={{color, fontWeight: '600'}}>{label}</span>
            </label>
          ))}
        </div>

        {/* المحتوى */}
        {loading ? (
          <div style={styles.loading}>جاري تحميل السجلات...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div style={styles.noLogs}>
            {searchTerm || startDate || endDate || !showAdd || !showDelete || !showUpdatePercentage
              ? 'لا توجد أنشطة مطابقة'
              : 'لا توجد أنشطة مسجلة حتى الآن'}
          </div>
        ) : (
          <div style={styles.logsList}>
            {filteredLogs.map((log) => (
              <div key={log._id} style={styles.logCard}>
                <div style={styles.logHeader}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {log.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div style={styles.username}>{log.username || 'مجهول'}</div>
                      <span style={styles.roleBadge}>{log.role || 'غير محدد'}</span>
                    </div>
                  </div>
                  <span style={{...styles.actionBadge, backgroundColor: getActionColor(log.action)}}>
                    {log.action === 'ADD_VIOLATION' && 'إضافة'}
                    {log.action === 'DELETE_VIOLATION' && 'حذف'}
                    {log.action === 'UPDATE_PERCENTAGE' && 'تعديل'}
                  </span>
                </div>
                <p style={styles.actionText}>{getActionText(log.action, log.details)}</p>
                <div style={styles.timestamp}>
                  {new Date(log.createdAt).toLocaleString('ar-EG', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .controls { flex-direction: column; align-items: stretch; }
          .searchBox { width: 100%; }
          .dateGroup { justify-content: center; }
          .filters { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0F172A', color: '#E2E8F0', padding: '16px', fontFamily: 'Tajawal, system-ui, sans-serif', direction: 'rtl' },
  inner: { maxWidth: '1200px', margin: '0 auto', backgroundColor: '#1E293B', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  title: { fontSize: '30px', fontWeight: '700', textAlign: 'center', margin: '0 0 24px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  controls: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'center' },
  searchBox: { position: 'relative', flex: '1', minWidth: '250px' },
  searchInput: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #475569', backgroundColor: '#334155', color: '#E2E8F0', fontSize: '15px', outline: 'none' },
  dateGroup: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  dateInput: { padding: '10px 12px', borderRadius: '12px', border: '1px solid #475569', backgroundColor: '#334155', color: '#E2E8F0' },
  filters: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '20px', backgroundColor: '#334155', borderRadius: '16px', marginBottom: '24px', border: '1px solid #475569' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer', userSelect: 'none' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  selectAllText: { background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' },
  logsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  logCard: { backgroundColor: '#334155', borderRadius: '16px', padding: '20px', borderRight: '5px solid #8B5CF6', transition: 'all 0.3s ease' },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' },
  username: { fontWeight: '700', fontSize: '17px' },
  roleBadge: { fontSize: '13px', color: '#94A3B8', backgroundColor: '#475569', padding: '4px 10px', borderRadius: '8px' },
  actionBadge: { padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '700', color: 'white', minWidth: '100px', textAlign: 'center' },
  actionText: { margin: '12px 0', fontSize: '16px', lineHeight: '1.6', color: '#CBD5E1', fontWeight: '500' },
  timestamp: { fontSize: '13px', color: '#94A3B8', marginTop: '12px', textAlign: 'left' },
  noLogs: { textAlign: 'center', padding: '80px 20px', color: '#64748B', fontSize: '20px', backgroundColor: '#1E293B', borderRadius: '16px', border: '2px dashed #475569' },
  loading: { textAlign: 'center', padding: '80px', color: '#8B5CF6', fontSize: '20px' },
  error: { backgroundColor: '#451313', color: '#F87171', padding: '20px', borderRadius: '12px', textAlign: 'center', fontSize: '16px' },
  accessDenied: { textAlign: 'center', color: '#EF4444', fontSize: '28px', marginTop: '100px', fontWeight: '700' },
};

export default ActivityLogs;
