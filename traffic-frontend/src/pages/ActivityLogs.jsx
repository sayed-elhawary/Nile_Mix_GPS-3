import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Lock, User, Plus, Trash2, Edit3 } from 'lucide-react';

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
      setError('فشل في تحميل سجل الأنشطة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [navigate]);

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

  useEffect(() => {
    let results = logs;

    if (searchTerm) {
      results = results.filter(log => {
        const d = log.details || {};
        const code = (d.code || '').toString().toLowerCase();
        const name = (d.name || '').toString().toLowerCase();
        return code.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
      });
    }

    if (startDate || endDate) {
      results = results.filter(log => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
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

  const getActionIconAndColor = (action) => {
    switch (action) {
      case 'ADD_VIOLATION': return { icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'DELETE_VIOLATION': return { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'UPDATE_PERCENTAGE': return { icon: Edit3, color: 'text-sky-400', bg: 'bg-sky-500/10' };
      default: return { icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  const handleSelectAll = () => {
    const all = showAdd && showDelete && showUpdatePercentage;
    setShowAdd(!all); setShowDelete(!all); setShowUpdatePercentage(!all);
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-700 text-center max-w-md">
          <Lock className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">غير مصرح</h2>
          <p className="text-gray-400">هذه الصفحة للمدراء فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* العنوان */}
          <div className="bg-gray-800/50 border-b border-gray-700 px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-100 text-center">سجل الأنشطة</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* البحث والتاريخ */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث بالكود أو الاسم..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-12 py-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>
              <div className="flex items-center gap-3">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-100" />
                <span className="text-gray-500 hidden md:block">إلى</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-100" />
              </div>
            </div>

            {/* الفلاتر */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-4 mb-5">
                <input
                  type="checkbox"
                  checked={showAdd && showDelete && showUpdatePercentage}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded accent-emerald-500"
                />
                <span className="text-gray-300 font-medium">تحديد الكل</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'إضافة مخالفة', state: showAdd, set: setShowAdd, color: 'emerald' },
                  { label: 'حذف مخالفة', state: showDelete, set: setShowDelete, color: 'red' },
                  { label: 'تعديل النسبة', state: showUpdatePercentage, set: setShowUpdatePercentage, color: 'sky' },
                ].map(item => (
                  <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={e => item.set(e.target.checked)}
                      className={`w-5 h-5 rounded accent-${item.color}-500`}
                    />
                    <span className="text-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* السجلات */}
            {loading ? (
              <div className="text-center py-16 text-gray-500 text-lg">جاري تحميل السجلات...</div>
            ) : error ? (
              <div className="p-6 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-center">
                {error}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-700">
                لا توجد أنشطة مطابقة
              </div>
            ) : (
              <div className="space-y-5">
                {filteredLogs.map(log => {
                  const { icon: Icon, color, bg } = getActionIconAndColor(log.action);
                  return (
                    <div key={log._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-lg">
                            {log.username?.[0]?.toUpperCase() || '؟'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-100">{log.username || 'مجهول'}</div>
                            <div className="text-sm text-gray-500">{log.role || 'غير محدد'}</div>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${bg}`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                      </div>

                      <p className="mt-4 text-gray-200 text-lg leading-relaxed">
                        {getActionText(log.action, log.details)}
                      </p>

                      <div className="mt-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
