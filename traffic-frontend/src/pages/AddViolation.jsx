import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

const AddViolation = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    job: '',
    type: '',
    amount: '',
    details: ''
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const violationTypes = [
    { value: 'فوري سرعة', label: 'فوري سرعة' },
    { value: 'فوري حزام', label: 'فوري حزام' },
    { value: 'فوري تليفون', label: 'فوري تليفون' },
    { value: 'فوري أخرى', label: 'فوري أخرى' },
    { value: 'حزام مضاعف', label: 'حزام مضاعف' },
    { value: 'سرعة مضاعف', label: 'سرعة مضاعف' },
    { value: 'أخرى مضاعف', label: 'أخرى مضاعف' }
  ];

  // صفحة "غير مصرح" بنفس ستايل Login
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700 text-center max-w-md w-full">
          <Lock className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">غير مصرح لك بالدخول</h3>
          <p className="text-gray-400 mb-8">يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition-all hover:scale-105"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (image) data.append('image', image);

      await axios.post(`${import.meta.env.VITE_API_URL}/violations`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      localStorage.setItem('logsNeedRefresh', Date.now().toString());
      setSuccess('تم تسجيل المخالفة بنجاح! جاهز لتسجيل مخالفة أخرى');

      setFormData({ code: '', name: '', job: '', type: '', amount: '', details: '' });
      setImage(null);
      setPreviewImage(null);

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تسجيل المخالفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            تسجيل مخالفة جديدة
          </h2>

          {success && (
            <div className="mb-6 p-4 bg-emerald-900/50 border border-emerald-700 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-emerald-300 font-bold">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/60 border border-red-700 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-300 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">الكود</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="أدخل الكود"
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">الاسم</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="أدخل الاسم"
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">الوظيفة</label>
                <input
                  name="job"
                  value={formData.job}
                  onChange={handleChange}
                  required
                  placeholder="أدخل الوظيفة"
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">نوع المخالفة</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">-- اختر نوع المخالفة --</option>
                  {violationTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">المبلغ (ج.م)</label>
                <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="مثال: 300"
                  className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">تفاصيل إضافية (اختياري)</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={4}
                placeholder="أي تفاصيل إضافية..."
                className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-vertical"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-3">صورة المخالفة (اختياري)</label>
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-all"
              >
                <Upload className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="text-gray-400">اضغط لرفع صورة أو اسحبها هنا</p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {previewImage && (
                <div className="mt-4">
                  <img src={previewImage} alt="معاينة" className="w-full max-h-64 object-contain rounded-xl border border-gray-600" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                ${isSubmitting 
                  ? 'bg-emerald-700 opacity-80 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]'
                }`}
            >
              {isSubmitting ? (
                <>جاري التسجيل...</>
              ) : (
                <>
                  تسجيل المخالفة وإضافة أخرى
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddViolation;
