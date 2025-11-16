import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViolationsList = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // تشيك بوكسات الأنواع
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
        console.error('خطأ في جلب المخالفات:', err);
        setError('حدث خطأ أثناء تحميل المخالفات، يرجى المحاولة لاحقاً');
      } finally {
        setIsLoading(false);
      }
    };
    fetchViolations();
  }, [navigate]);

  useEffect(() => {
    let results = violations;

    // بحث بالاسم أو الكود أو المبلغ
    if (searchTerm) {
      results = results.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.amount.toString().includes(searchTerm)
      );
    }

    // فلتر التاريخ
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

    // فلتر الأنواع
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
    if (!confirm('هل أنت متأكد من حذف المخالفة؟')) return;
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

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <header style={styles.header}>
          <h2 style={styles.title}>قائمة المخالفات</h2>

          {/* حقل البحث + التاريخ + التشيك بوكسات - دايمًا ظاهرين */}
          <div style={styles.searchBar}>
            <div style={styles.searchInputWrapper}>
              <svg style={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="ابحث بالكود أو الاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.dateFilters}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
              <span style={{ margin: '0 8px', color: '#aaa' }}>إلى</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
            </div>
          </div>

          {/* تشيك بوكسات الأنواع */}
          <div style={styles.typeFilters}>
            {[
              { s: showInstantSpeed, set: setShowInstantSpeed, label: 'فوري سرعة', c: '#4ADE80' },
              { s: showInstantSeatbelt, set: setShowInstantSeatbelt, label: 'فوري حزام', c: '#FBBF24' },
              { s: showInstantPhone, set: setShowInstantPhone, label: 'فوري تليفون', c: '#60A5FA' },
              { s: showInstantOther, set: setShowInstantOther, label: 'فوري أخرى', c: '#A78BFA' },
              { s: showDoubleSeatbelt, set: setShowDoubleSeatbelt, label: 'حزام مضاعف', c: '#F87171' },
              { s: showDoubleSpeed, set: setShowDoubleSpeed, label: 'سرعة مضاعف', c: '#F87171' },
              { s: showDoublePhone, set: setShowDoublePhone, label: 'تليفون مضاعف', c: '#F87171' },
              { s: showDoubleOther, set: setShowDoubleOther, label: 'أخرى مضاعف', c: '#F87171' },
            ].map(({ s, set, label, c }) => (
              <label key={label} style={{ ...styles.checkboxLabel, borderColor: s ? c : '#555' }}>
                <input type="checkbox" checked={s} onChange={e => set(e.target.checked)} style={{ display: 'none' }} />
                <span style={{ ...styles.checkboxText, color: s ? c : '#888' }}>{label}</span>
              </label>
            ))}
          </div>
        </header>

        {error && <p style={styles.error}>{error}</p>}

        {isLoading ? (
          <div style={styles.loading}>جاري التحميل...</div>
        ) : filteredViolations.length === 0 ? (
          <p style={styles.noData}>لا توجد مخالفات مطابقة للبحث</p>
        ) : (
          <>
            {/* Cards للموبايل + جدول للديسكتوب */}
            <div className="violations-responsive">
              {/* Mobile Cards */}
              <div className="mobile-view">
                {filteredViolations.map(v => {
                  const employeeAmount = Math.round(v.amount * (100 - (v.companyPercentage || 0)) / 100);
                  return (
                    <div key={v._id} style={styles.mobileCard}>
                      <div style={styles.mobileCardHeader}>
                        <strong>{v.code} - {v.name}</strong>
                        <span style={styles.mobileJob}>{v.job}</span>
                      </div>
                      <div style={styles.mobileCardBody}>
                        <p><strong>النوع:</strong> <span style={{ color: '#60A5FA' }}>{v.type}</span></p>
                        <p><strong>المبلغ:</strong> {v.amount.toLocaleString('ar-EG')} ج.م</p>
                        <p><strong>نسبة الشركة:</strong> {v.companyPercentage}%</p>
                        <p style={{ color: '#4ADE80', fontWeight: 'bold' }}>
                          <strong>يخصم:</strong> {employeeAmount.toLocaleString('ar-EG')} ج.م
                        </p>
                        <p><strong>التاريخ:</strong> {new Date(v.createdAt).toLocaleDateString('ar-EG')}</p>
                        {v.image && (
                          <img
                            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`}
                            alt="مخالفة"
                            style={styles.mobileImage}
                            onClick={() => openImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`)}
                          />
                        )}
                        {role === 'admin' && (
                          <div style={styles.mobileActions}>
                            <button onClick={() => openEditModal(v)} style={styles.mobileEditBtn}>تعديل النسبة</button>
                            <button onClick={() => handleDelete(v._id)} style={styles.mobileDeleteBtn}>حذف</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <table className="desktop-table" style={styles.desktopTable}>
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>الاسم</th>
                    <th>الوظيفة</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>نسبة الشركة</th>
                    <th>يخصم</th>
                    <th>التاريخ</th>
                    <th>الصورة</th>
                    {role === 'admin' && <th>إجراءات</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredViolations.map(v => {
                    const employeeAmount = Math.round(v.amount * (100 - (v.companyPercentage || 0)) / 100);
                    return (
                      <tr key={v._id}>
                        <td>{v.code}</td>
                        <td>{v.name}</td>
                        <td>{v.job}</td>
                        <td>{v.type}</td>
                        <td>{v.amount} ج.م</td>
                        <td>{v.companyPercentage > 0 ? `${v.companyPercentage}%` : <span style={{color:'#F23F43'}}>0%</span>}</td>
                        <td style={{color:'#4ADE80',fontWeight:'bold'}}>{employeeAmount.toLocaleString('ar-EG')} ج.م</td>
                        <td>{new Date(v.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td>
                          {v.image ? (
                            <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`} alt="صورة" style={styles.tableImage} onClick={() => openImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}/${v.image}`)} />
                          ) : 'لا توجد'}
                        </td>
                        {role === 'admin' && (
                          <td>
                            <button onClick={() => openEditModal(v)} style={styles.editBtn}>تعديل</button>
                            <button onClick={() => handleDelete(v._id)} style={styles.deleteBtn}>حذف</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* الإحصائيات */}
            <div style={styles.stats}>
              <h3>الإحصائيات</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statBox}><span>إجمالي المخالفات</span><strong style={{color:'#00D4FF'}}>{stats.totalOriginal.toLocaleString('ar-EG')} ج.م</strong></div>
                <div style={styles.statBox}><span>تتحمله الشركة</span><strong style={{color:'#4ADE80'}}>{stats.totalCompany.toLocaleString('ar-EG')} ج.م</strong></div>
                <div style={styles.statBox}><span>يخصم من الموظفين</span><strong style={{color:'#F23F43'}}>{stats.totalEmployee.toLocaleString('ar-EG')} ج.م</strong></div>
              </div>
            </div>
          </>
        )}

        {/* مودال تعديل النسبة */}
        {editingViolation && (
          <div style={styles.modal} onClick={() => setEditingViolation(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3>تعديل نسبة الشركة</h3>
              <p>{editingViolation.code} - {editingViolation.name}</p>
              <input type="number" min="0" max="100" value={companyPercentage} onChange={e => setCompanyPercentage(e.target.value)} style={styles.modalInput} />
              <div style={styles.modalBtns}>
                <button onClick={saveCompanyPercentage} style={styles.saveBtn}>حفظ</button>
                <button onClick={() => setEditingViolation(null)} style={styles.cancelBtn}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* مودال الصورة */}
        {selectedImage && (
          <div style={styles.modal} onClick={closeModal}>
            <div style={styles.imageModal} onClick={e => e.stopPropagation()}>
              <button style={styles.closeImage} onClick={closeModal}>✕</button>
              <img src={selectedImage} alt="مخالفة" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-table { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-view { display: none; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#18191A', color: '#E4E6EB', padding: '16px', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' },
  innerContainer: { maxWidth: '1400px', margin: '0 auto', backgroundColor: '#242526', borderRadius: '16px', overflow: 'hidden' },
  header: { padding: '20px', backgroundColor: '#242526', borderBottom: '1px solid #333' },
  title: { margin: '0 0 16px', fontSize: '28px', fontWeight: '800', color: '#fff' },
  searchBar: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' },
  searchInputWrapper: { position: 'relative', flex: '1', minWidth: '250px' },
  searchInput: { width: '100%', padding: '14px 45px 14px 16px', borderRadius: '12px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', fontSize: '16px' },
  searchIcon: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
  dateFilters: { display: 'flex', alignItems: 'center', gap: '8px' },
  dateInput: { padding: '12px', borderRadius: '10px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' },
  typeFilters: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  checkboxText: { fontWeight: '600', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '60px', fontSize: '18px', color: '#999' },
  noData: { textAlign: 'center', padding: '80px', fontSize: '20px', color: '#999' },
  mobileCard: { backgroundColor: '#333', borderRadius: '16px', margin: '16px', padding: '20px', border: '1px solid #444' },
  mobileCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '18px' },
  mobileJob: { fontSize: '14px', color: '#aaa' },
  mobileCardBody: { lineHeight: '1.8' },
  mobileImage: { width: '100%', borderRadius: '12px', marginTop: '12px', cursor: 'pointer' },
  mobileActions: { display: 'flex', gap: '10px', marginTop: '16px' },
  mobileEditBtn: { backgroundColor: '#0866FF', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '14px' },
  mobileDeleteBtn: { backgroundColor: '#F23F43', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '14px' },
  desktopTable: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  tableImage: { width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' },
  editBtn: { backgroundColor: '#0866FF', color: 'white', padding: '6px 12px', borderRadius: '6px', marginLeft: '6px' },
  deleteBtn: { backgroundColor: '#F23F43', color: 'white', padding: '6px 12px', borderRadius: '6px' },
  stats: { margin: '32px 20px', backgroundColor: '#1e1f20', padding: '20px', borderRadius: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' },
  statBox: { backgroundColor: '#333', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  modalContent: { backgroundColor: '#242526', padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '400px', textAlign: 'center' },
  modalInput: { width: '100%', padding: '16px', margin: '16px 0', backgroundColor: '#333', border: '1px solid #444', borderRadius: '12px', color: '#fff', fontSize: '18px' },
  modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' },
  saveBtn: { backgroundColor: '#0866FF', color: 'white', padding: '12px 32px', borderRadius: '12px', fontWeight: '700' },
  cancelBtn: { backgroundColor: '#444', color: '#fff', padding: '12px 32px', borderRadius: '12px' },
  imageModal: { position: 'relative', maxWidth: '95%', maxHeight: '95%' },
  closeImage: { position: 'absolute', top: '-50px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer' },
  error: { backgroundColor: '#4F2122', color: '#F23F43', padding: '16px', borderRadius: '12px', textAlign: 'center', margin: '20px' },
};

export default ViolationsList;
