import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddViolation = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    job: '',
    type: '', // هيبقى من السيلكت
    amount: '',
    details: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // رسالة نجاح جديدة
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // قائمة أنواع المخالفات الثابتة
  const violationTypes = [
    { value: 'فوري سرعة', label: 'فوري سرعة' },
    { value: 'فوري حزام', label: 'فوري حزام' },
    { value: 'فوري تليفون', label: 'فوري تليفون' },
    { value: 'فوري أخرى', label: 'فوري أخرى' },
    { value: 'حزام مضاعف', label: 'حزام مضاعف' },
    { value: 'سرعة مضاعف', label: 'سرعة مضاعف' },
    { value: 'أخرى مضاعف', label: 'أخرى مضاعف' }
  ];

  if (role !== 'admin') {
    return (
      <div style={styles.unauthorizedContainer}>
        <div style={styles.unauthorizedCard}>
          <svg style={styles.lockIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 style={styles.unauthorizedTitle}>غير مصرح لك بالدخول لهذه الصفحة</h3>
          <p style={styles.unauthorizedText}>يجب أن تكون مسؤولاً للنفاذ إلى هذه الوظيفة</p>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية
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
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
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

      // تحديث سجل الأنشطة فورًا
      localStorage.setItem('logsNeedRefresh', Date.now().toString());

      // رسالة نجاح + إعادة تعيين النموذج
      setSuccess('تم تسجيل المخالفة بنجاح! جاهز لتسجيل مخالفة أخرى');
      setFormData({
        code: '',
        name: '',
        job: '',
        type: '',
        amount: '',
        details: ''
      });
      setImage(null);
      setPreviewImage(null);

      // إزالة رسالة النجاح بعد 4 ثواني
      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تسجيل المخالفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      fontFamily: "'Inter', sans-serif",
    },
    title: {
      margin: '0 0 32px 0',
      color: '#1a1a1a',
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#334155',
    },
    input: {
      padding: '12px 16px',
      fontSize: '15px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    select: {
      padding: '12px 16px',
      fontSize: '15px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      outline: 'none',
      cursor: 'pointer',
    },
    fileInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    fileInputLabel: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      border: '2px dashed #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    fileInputText: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#64748b',
      fontSize: '14px',
    },
    fileInputIcon: {
      width: '24px',
      height: '24px',
      color: '#3b82f6',
    },
    previewImage: {
      width: '100%',
      maxHeight: '200px',
      objectFit: 'contain',
      borderRadius: '8px',
      marginTop: '12px',
      border: '1px solid #e2e8f0',
    },
    submitButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '16px 24px',
      fontSize: '17px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 6px 12px rgba(16, 185, 129, 0.3)',
      marginTop: '10px',
    },
    success: {
      color: '#10b981',
      padding: '16px',
      backgroundColor: '#ecfdf5',
      borderRadius: '12px',
      borderLeft: '5px solid #10b981',
      fontSize: '16px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '20px',
    },
    error: {
      color: '#ef4444',
      padding: '16px',
      backgroundColor: '#fee2e2',
      borderRadius: '12px',
      borderLeft: '5px solid #ef4444',
      fontSize: '15px',
      marginBottom: '20px',
    },
    unauthorizedContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8fafc',
    },
    unauthorizedCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%',
    },
    unauthorizedTitle: {
      color: '#1e293b',
      fontSize: '24px',
      fontWeight: '700',
      margin: '20px 0 10px',
    },
    unauthorizedText: {
      color: '#64748b',
      fontSize: '16px',
      marginBottom: '24px',
    },
    lockIcon: {
      width: '64px',
      height: '64px',
      margin: '0 auto',
    },
    backButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>تسجيل مخالفة جديدة</h2>

      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>الكود</label>
          <input
            name="code"
            placeholder="أدخل الكود"
            onChange={handleChange}
            value={formData.code}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>الاسم</label>
          <input
            name="name"
            placeholder="أدخل الاسم"
            onChange={handleChange}
            value={formData.name}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>الوظيفة</label>
          <input
            name="job"
            placeholder="أدخل الوظيفة"
            onChange={handleChange}
            value={formData.job}
            required
            style={styles.input}
          />
        </div>

        {/* السيلكت الجديد لنوع المخالفة */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>نوع المخالفة</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">-- اختر نوع المخالفة --</option>
            {violationTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>المبلغ (ج.م)</label>
          <input
            name="amount"
            type="number"
            placeholder="أدخل المبلغ"
            onChange={handleChange}
            value={formData.amount}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>تفاصيل المخالفة (اختياري)</label>
          <textarea
            name="details"
            placeholder="أدخل تفاصيل إضافية إن وجدت..."
            onChange={handleChange}
            value={formData.details}
            rows={4}
            style={{...styles.input, resize: 'vertical'}}
          />
        </div>

        <div style={styles.fileInputContainer}>
          <label htmlFor="image" style={styles.fileInputLabel}>
            <span style={styles.fileInputText}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={styles.fileInputIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 018 0v1h4v-1a4 4 0 018 0v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4 4m0 0l-4 4m4-4H9" />
              </svg>
              رفع صورة المخالفة (اختياري)
            </span>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          {previewImage && <img src={previewImage} alt="معاينة الصورة" style={styles.previewImage} />}
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.submitButton}>
          {isSubmitting ? (
            <>
              جارٍ التسجيل...
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ width: '22px', height: '22px', animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M4 12a8 8 0 018-8" />
              </svg>
            </>
          ) : (
            'تسجيل المخالفة وإضافة أخرى'
          )}
        </button>
      </form>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          input:focus, textarea:focus, select:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
          }
          button:not(:disabled):hover {
            background-color: #059669;
            transform: translateY(-2px);
          }
          button:disabled {
            background-color: #94a3b8;
            cursor: not-allowed;
            transform: none;
          }
        `}
      </style>
    </div>
  );
};

export default AddViolation;
