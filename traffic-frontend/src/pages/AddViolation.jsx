// src/pages/AddViolation.jsx ← كامل 100% + الصور شغالة + كل حاجة زي ما هي
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle2, Lock, ArrowRight, Car, UserCheck, Clock, ZoomIn } from 'lucide-react';

const AddViolation = () => {
  const [userRole, setUserRole] = useState('');
  const [pendingViolations, setPendingViolations] = useState([]);
  const [showCompleteModal, setShowCompleteModal] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    carCode: '',
    amount: '',
    type: '',
    details: ''
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    employeeCode: '',
    name: '',
    job: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const violationTypes = [
    'فوري سرعة', 'فوري حزام', 'فوري تليفون', 'فوري أخرى',
    'حزام مضاعف', 'سرعة مضاعف', 'أخرى مضاعف'
  ];

  // مهم جدًا: نحافظ على /api للـ API، لكن الصور من غير /api
  const API_URL = import.meta.env.VITE_API_URL; // http://13.233.184.129:5000/api
  const IMAGE_BASE_URL = API_URL.replace('/api', ''); // http://13.233.184.129:5000

  const fetchPendingViolations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/violations/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingViolations(res.data);
    } catch (err) {
      if (err.response?.status !== 403) {
        setError('فشل جلب المخالفات المعلقة');
      }
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role')?.toLowerCase().trim();
    setUserRole(role);
    if (role === 'admin' || role === 'hr') {
      fetchPendingViolations();
    }
  }, []);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('carCode', formData.carCode);
      data.append('amount', formData.amount);
      data.append('type', formData.type);
      if (formData.details) data.append('details', formData.details);
      if (image) data.append('image', image);

      await axios.post(`${API_URL}/violations`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('تم إضافة المخالفة بنجاح (في انتظار HR)');
      setFormData({ carCode: '', amount: '', type: '', details: '' });
      setImage(null); setPreviewImage(null);
      fetchPendingViolations();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الإضافة');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteViolation = async () => {
    if (!employeeData.employeeCode || !employeeData.name || !employeeData.job) {
      setError('كل الحقول مطلوبة');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/violations/${showCompleteModal}/complete`,
        employeeData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('تم إكمال المخالفة بنجاح!');
      setShowCompleteModal(null);
      setEmployeeData({ employeeCode: '', name: '', job: '' });
      fetchPendingViolations();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في الإكمال');
    }
  };

  const isAdmin = userRole === 'admin';
  const isHR = userRole === 'hr';

  if (!isAdmin && !isHR) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700 text-center max-w-md w-full">
          <Lock className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">غير مصرح لك بالدخول</h3>
          <p className="text-gray-400 mb-8">يجب أن تكون أدمن أو HR</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-10">

        {success && (
          <div className="p-4 bg-emerald-900/50 border border-emerald-700 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <p className="text-emerald-300 font-bold">{success}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-900/60 border border-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* نموذج إضافة المخالفة (Admin فقط) */}
        {isAdmin && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white text-center mb-8 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              إضافة مخالفة جديدة (كود العربية)
            </h2>
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">كود العربية</label>
                  <input required value={formData.carCode} onChange={(e) => setFormData({...formData, carCode: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all" placeholder="مثل: 5678" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">المبلغ (ج.م)</label>
                  <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-4 focus:ring-emerald-500" placeholder="300" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">نوع المخالفة</label>
                  <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-4 focus:ring-emerald-500">
                    <option value="">-- اختر النوع --</option>
                    {violationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">تفاصيل إضافية (اختياري)</label>
                <textarea rows={3} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white resize-vertical focus:ring-4 focus:ring-emerald-500" placeholder="مثل: تجاوز السرعة في طريق القاهرة-الإسكندرية" />
              </div>
              <div>
                <label className="block text-gray-300 mb-3">صورة المخالفة (اختياري)</label>
                <label htmlFor="img-upload" className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-all">
                  <Upload className="w-12 h-12 text-emerald-500 mb-3" />
                  <p className="text-gray-400">اضغط لرفع الصورة</p>
                  <input id="img-upload" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </label>
                {previewImage && (
                  <div className="mt-4 relative">
                    <img src={previewImage} alt="معاينة" className="w-full max-h-64 object-contain rounded-xl border border-gray-600" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all">
                {loading ? 'جاري الإضافة...' : <>إضافة المخالفة وإنتظار HR <ArrowRight className="w-6 h-6" /></>}
              </button>
            </form>
          </div>
        )}

        {/* قسم المخالفات المعلقة */}
        {(isAdmin || isHR) && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
              <Clock className="w-10 h-10 text-yellow-500" />
              المخالفات المعلقة (في انتظار إكمال بيانات الموظف)
            </h2>
            {pendingViolations.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400">لا توجد مخالفات معلقة حاليًا</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingViolations.map(v => (
                  <div key={v._id} className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600 hover:border-emerald-500 transition-all shadow-lg">
                    {v.image ? (
                      <div className="relative group cursor-pointer" onClick={() => setSelectedImage(`${IMAGE_BASE_URL}/${v.image}`)}>
                        <img
                          src={`${IMAGE_BASE_URL}/${v.image}`}
                          alt="مخالفة"
                          className="w-full h-48 object-cover group-hover:brightness-75 transition-all"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=الصورة+غير+متاحة'}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-600 h-48 flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <p className="flex items-center gap-2"><Car className="w-5 h-5 text-emerald-400" /> <strong>كود العربية:</strong> {v.carCode}</p>
                      <p className="text-lg font-bold text-emerald-400">{v.amount} ج.م</p>
                      <p><strong>النوع:</strong> {v.type}</p>
                      {v.details && <p className="text-sm text-gray-400 line-clamp-2"><strong>التفاصيل:</strong> {v.details}</p>}
                      <p className="text-xs text-gray-500">تمت الإضافة: {new Date(v.createdAt).toLocaleString('ar-EG')}</p>
                      {isHR && (
                        <button
                          onClick={() => {
                            setShowCompleteModal(v._id);
                            setError('');
                          }}
                          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <UserCheck className="w-5 h-5" /> إكمال بيانات الموظف
                        </button>
                      )}
                      {isAdmin && !isHR && (
                        <div className="w-full mt-4 py-3 bg-yellow-600/20 border border-yellow-600 rounded-lg text-center text-yellow-300 font-bold">
                          في انتظار HR
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* مودال إكمال المخالفة */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">إكمال بيانات الموظف</h3>
              <div className="space-y-5">
                <input placeholder="كود الموظف" value={employeeData.employeeCode}
                  onChange={(e) => setEmployeeData({...employeeData, employeeCode: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-700 rounded-xl text-white focus:ring-4 focus:ring-emerald-500" required />
                <input placeholder="اسم الموظف" value={employeeData.name}
                  onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-700 rounded-xl text-white focus:ring-4 focus:ring-emerald-500" required />
                <input placeholder="الوظيفة" value={employeeData.job}
                  onChange={(e) => setEmployeeData({...employeeData, job: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-700 rounded-xl text-white focus:ring-4 focus:ring-emerald-500" required />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={handleCompleteViolation} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold">
                  تأكيد الإكمال
                </button>
                <button onClick={() => {
                  setShowCompleteModal(null);
                  setEmployeeData({employeeCode:'', name:'', job:''});
                  setError('');
                }} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال تكبير الصورة */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="مكبرة" className="max-w-full max-h-full rounded-xl shadow-2xl" />
            <button className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-400">×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddViolation;
