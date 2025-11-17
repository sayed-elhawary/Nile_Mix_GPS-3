import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, X, Edit2, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

const ViolationsList = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // فلاتر الأنواع
  const [showInstantSpeed, setShowInstantSpeed] = useState(true);
  const [showInstantSeatbelt, setShowInstantSeatbelt] = useState(true);
  const [showInstantPhone, setShowInstantPhone] = useState(true);
  const [showInstantOther, setShowInstantOther] = useState(true);
  const [showDoubleSeatbelt, setShowDoubleSeatbelt] = useState(true);
  const [showDoubleSpeed, setShowDoubleSpeed] = useState(true);
  const [showDoublePhone, setShowDoublePhone] = useState(true);
  const [showDoubleOther, setShowDoubleOther] = useState(true);

  const [editingViolation, setEditingViolation] = useState(null);
  const [companyPercentage, setCompanyPercentage] = useState('');

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
        const dataWithDate = res.data.map(v => ({
          ...v,
          createdAt: v.createdAt || new Date().toISOString(),
          companyPercentage: v.companyPercentage ?? 0
        }));
        setViolations(dataWithDate);
        setFilteredViolations(dataWithDate);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل المخالفات، يرجى المحاولة لاحقاً');
      } finally {
        setIsLoading(false);
      }
    };
    fetchViolations();
  }, [navigate]);

  useEffect(() => {
    let results = violations;

    if (searchTerm) {
      results = results.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.amount.toString().includes(searchTerm)
      );
    }

    if (startDate || endDate) {
      results = results.filter(v => {
        const vDate = new Date(v.createdAt);
        vDate.setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (vDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (vDate > end) return false;
        }
        return true;
      });
    }

    results = results.filter(v => {
      if (v.type === 'فوري سرعة' && !showInstantSpeed) return false;
      if (v.type === 'فوري حزام' && !showInstantSeatbelt) return false;
      if (v.type === 'فوري تليفون' && !showInstantPhone) return false;
      if (v.type === 'فوري أخرى' && !showInstantOther) return false;
      if (v.type === 'حزام مضاعف' && !showDoubleSeatbelt) return false;
      if (v.type === 'سرعة مضاعف' && !showDoubleSpeed) return false;
      if (v.type === 'تليفون مضاعف' && !showDoublePhone) return false;
      if (v.type === 'أخرى مضاعف' && !showDoubleOther) return false;
      return true;
    });

    setFilteredViolations(results);
  }, [
    violations, searchTerm, startDate, endDate,
    showInstantSpeed, showInstantSeatbelt, showInstantPhone, showInstantOther,
    showDoubleSeatbelt, showDoubleSpeed, showDoublePhone, showDoubleOther
  ]);

  const stats = useMemo(() => {
    const totalOriginal = filteredViolations.reduce((sum, v) => sum + v.amount, 0);
    const totalCompany = filteredViolations.reduce((sum, v) =>
      sum + Math.round(v.amount * (v.companyPercentage || 0) / 100), 0
    );
    const totalEmployee = totalOriginal - totalCompany;
    return { totalOriginal, totalCompany, totalEmployee };
  }, [filteredViolations]);

  const openImage = (url) => setSelectedImage(url);
  const closeModal = () => setSelectedImage(null);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف المخالفة؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/violations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViolations(prev => prev.filter(v => v._id !== id));
      setFilteredViolations(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      alert('فشل حذف المخالفة');
    }
  };

  const openEditModal = (v) => {
    setEditingViolation(v);
    setCompanyPercentage(v.companyPercentage || 0);
  };

  const saveCompanyPercentage = async () => {
    const percentage = Number(companyPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert('النسبة يجب أن تكون بين 0 و 100');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/violations/${editingViolation._id}/percentage`,
        { companyPercentage: percentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViolations(prev => prev.map(v => v._id === editingViolation._id ? res.data : v));
      setFilteredViolations(prev => prev.map(v => v._id === editingViolation._id ? res.data : v));
      setEditingViolation(null);
    } catch (err) {
      alert('فشل حفظ النسبة');
    }
  };

  const typeFilters = [
    { state: showInstantSpeed, set: setShowInstantSpeed, label: 'فوري سرعة', color: 'emerald-400' },
    { state: showInstantSeatbelt, set: setShowInstantSeatbelt, label: 'فوري حزام', color: 'yellow-400' },
    { state: showInstantPhone, set: setShowInstantPhone, label: 'فوري تليفون', color: 'blue-400' },
    { state: showInstantOther, set: setShowInstantOther, label: 'فوري أخرى', color: 'purple-400' },
    { state: showDoubleSeatbelt, set: setShowDoubleSeatbelt, label: 'حزام مضاعف', color: 'red-500' },
    { state: showDoubleSpeed, set: setShowDoubleSpeed, label: 'سرعة مضاعف', color: 'red-500' },
    { state: showDoublePhone, set: setShowDoublePhone, label: 'تليفون مضاعف', color: 'red-500' },
    { state: showDoubleOther, set: setShowDoubleOther, label: 'أخرى مضاعف', color: 'red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              قائمة المخالفات المرورية
            </h2>

            {/* شريط البحث والفلاتر */}
            <div className="space-y-5">
              {/* البحث + التواريخ */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث بالكود أو الاسم أو المبلغ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400 hidden md:block" />
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white" />
                  <span className="text-gray-400 hidden md:block">إلى</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white" />
                </div>
              </div>

              {/* فلاتر الأنواع */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {typeFilters.map(({ state, set, label, color }) => (
                  <label
                    key={label}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      state
                        ? `border-${color} bg-${color}/10 text-${color}`
                        : 'border-gray-600 bg-gray-700 text-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={e => set(e.target.checked)}
                      className="hidden"
                    />
                    <span className="font-medium text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-900/60 border border-red-700 rounded-xl flex items-center gap-3">
              
			<AlertCircle className="w-6 h-6 text-red-400" />
		  <p className="text-red-300 font-bold">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-20 text-gray-400 text-xl">جاري تحميل المخالفات...</div>
          ) : filteredViolations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-xl">لا توجد مخالفات مطابقة للبحث</div>
          ) : (
            <>
              {/* عرض الموبايل */}
              <div className="md:hidden space-y-4 p-6">
                {filteredViolations.map(v => {
                  const employeeAmount = Math.round(v.amount * (100 - (v.companyPercentage || 0)) / 100);
                  return (
                    <div key={v._id} className="bg-gray-700 rounded-xl p-5 border border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-white">{v.code} - {v.name}</h3>
                          <p className="text-gray-400 text-sm">{v.job}</p>
                        </div>
                        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full">
                          {v.type}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>المبلغ:</strong> {v.amount.toLocaleString('ar-EG')} ج.م</p>
                        <p><strong>نسبة الشركة:</strong> {v.companyPercentage}%</p>
                        <p className="text-emerald-400 font-bold">
                          <strong>يخصم من الموظف:</strong> {employeeAmount.toLocaleString('ar-EG')} ج.م
                        </p>
                        <p><strong>التاريخ:</strong> {new Date(v.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      {v.image && (
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`}
                          alt="مخالفة"
                          className="w-full mt-4 rounded-lg cursor-pointer"
                          onClick={() => openImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`)}
                        />
                      )}
                      {role === 'admin' && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => openEditModal(v)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
                            تعديل النسبة
                          </button>
                          <button onClick={() => handleDelete(v._id)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition">
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* الجدول للديسكتوب */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700 text-gray-300 text-sm">
                      <th className="px-6 py-4 text-right">الكود</th>
                      <th className="px-6 py-4 text-right">الاسم</th>
                      <th className="px-6 py-4 text-right">الوظيفة</th>
                      <th className="px-6 py-4 text-right">النوع</th>
                      <th className="px-6 py-4 text-right">المبلغ</th>
                      <th className="px-6 py-4 text-right">نسبة الشركة</th>
                      <th className="px-6 py-4 text-right">يخصم</th>
                      <th className="px-6 py-4 text-right">التاريخ</th>
                      <th className="px-6 py-4 text-right">الصورة</th>
                      {role === 'admin' && <th className="px-6 py-4 text-right">إجراءات</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolations.map(v => {
                      const employeeAmount = Math.round(v.amount * (100 - (v.companyPercentage || 0)) / 100);
                      return (
                        <tr key={v._id} className="bg-gray-700/50 border-b border-gray-600 hover:bg-gray-700 transition">
                          <td className="px-6 py-5 text-white font-medium">{v.code}</td>
                          <td className="px-6 py-5 text-white">{v.name}</td>
                          <td className="px-6 py-5 text-gray-300">{v.job}</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400">
                              {v.type}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-white">{v.amount.toLocaleString('ar-EG')} ج.م</td>
                          <td className="px-6 py-5 text-white">{v.companyPercentage}%</td>
                          <td className="px-6 py-5 text-emerald-400 font-bold">{employeeAmount.toLocaleString('ar-EG')} ج.م</td>
                          <td className="px-6 py-5 text-gray-300">{new Date(v.createdAt).toLocaleDateString('ar-EG')}</td>
                          <td className="px-6 py-5">
                            {v.image ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`}
                                alt="صورة"
                                className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                                onClick={() => openImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`)}
                              />
                            ) : <span className="text-gray-500">لا توجد</span>}
                          </td>
                          {role === 'admin' && (
                            <td className="px-6 py-5">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => openEditModal(v)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(v._id)} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* الإحصائيات */}
              <div className="p-6 bg-gray-700/50 border-t border-gray-600">
                <h3 className="text-xl font-bold text-white mb-4">الإحصائيات</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl text-center border border-gray-700">
                    <p className="text-gray-400 mb-2">إجمالي المخالفات</p>
                    <p className="text-3xl font-bold text-cyan-400">{stats.totalOriginal.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl text-center border border-gray-700">
                    <p className="text-gray-400 mb-2">تتحمله الشركة</p>
                    <p className="text-3xl font-bold text-emerald-400">{stats.totalCompany.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl text-center border border-gray-700">
                    <p className="text-gray-400 mb-2">يخصم من الموظفين</p>
                    <p className="text-3xl font-bold text-red-400">{stats.totalEmployee.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* مودال تعديل النسبة */}
      {editingViolation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditingViolation(null)}>
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">تعديل نسبة الشركة</h3>
            <p className="text-gray-300 mb-6">{editingViolation.code} - {editingViolation.name}</p>
            <input
              type="number"
              min="0"
              max="100"
              value={companyPercentage}
              onChange={e => setCompanyPercentage(e.target.value)}
              className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500"
              placeholder="0"
            />
            <div className="flex gap-4 mt-8">
              <button onClick={saveCompanyPercentage} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition">
                حفظ التغييرات
              </button>
              <button onClick={() => setEditingViolation(null)} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الصورة */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-8" onClick={closeModal}>
          <button onClick={closeModal} className="absolute top-6 right-6 text-white text-4xl hover:text-gray-400 transition">
            ×
          </button>
          <img src={selectedImage} alt="مخالفة" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ViolationsList;
