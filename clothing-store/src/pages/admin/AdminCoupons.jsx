import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminStyles.css';

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Code: '',
    Name: '',
    Description: '',
    DiscountType: 'FIXED_AMOUNT',
    DiscountValue: '',
    MinOrderValue: 0,
    MaxDiscountAmount: '',
    UsageLimit: '',
    UsageLimitPerUser: '',
    ApplyTo: 'ALL',
    CategoryIds: [],
    ProductIds: [],
    StartDate: '',
    EndDate: '',
    IsActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCoupons, resCats, resProds] = await Promise.all([
        axiosClient.get('/coupons'),
        axiosClient.get('/categories'),
        axiosClient.get('/products')
      ]);
      setCoupons(resCoupons.data.data || []);
      setCategories(resCats.data.data || []);
      setProducts(resProds.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'CategoryIds' || name === 'ProductIds') {
      // For multi-select
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(Number(options[i].value));
        }
      }
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    const now = new Date();
    // default to current date formatted for input type="datetime-local" (YYYY-MM-DDThh:mm)
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setFormData({
      Code: '',
      Name: '',
      Description: '',
      DiscountType: 'FIXED_AMOUNT',
      DiscountValue: '',
      MinOrderValue: 0,
      MaxDiscountAmount: '',
      UsageLimit: '',
      UsageLimitPerUser: '',
      ApplyTo: 'ALL',
      CategoryIds: [],
      ProductIds: [],
      StartDate: localNow,
      EndDate: '',
      IsActive: true
    });
    setShowForm(true);
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.CouponId);
    
    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      Code: coupon.Code,
      Name: coupon.Name,
      Description: coupon.Description || '',
      DiscountType: coupon.DiscountType,
      DiscountValue: coupon.DiscountValue,
      MinOrderValue: coupon.MinOrderValue,
      MaxDiscountAmount: coupon.MaxDiscountAmount || '',
      UsageLimit: coupon.UsageLimit === null ? '' : coupon.UsageLimit,
      UsageLimitPerUser: coupon.UsageLimitPerUser === null ? '' : coupon.UsageLimitPerUser,
      ApplyTo: coupon.ApplyTo,
      CategoryIds: coupon.Categories ? coupon.Categories.map(c => c.CategoryId) : [],
      ProductIds: coupon.Products ? coupon.Products.map(p => p.ProductId) : [],
      StartDate: formatDateTime(coupon.StartDate),
      EndDate: formatDateTime(coupon.EndDate),
      IsActive: coupon.IsActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá mã này?')) return;
    try {
      await axiosClient.delete(`/coupons/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axiosClient.patch(`/coupons/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi chuyển trạng thái mã');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Cleanup numeric fields
      payload.UsageLimit = payload.UsageLimit === '' ? null : Number(payload.UsageLimit);
      payload.UsageLimitPerUser = payload.UsageLimitPerUser === '' ? null : Number(payload.UsageLimitPerUser);
      payload.MaxDiscountAmount = payload.MaxDiscountAmount === '' ? null : Number(payload.MaxDiscountAmount);
      payload.EndDate = payload.EndDate === '' ? null : new Date(payload.EndDate).toISOString();
      payload.StartDate = new Date(payload.StartDate).toISOString();

      if (editingId) {
        await axiosClient.put(`/coupons/${editingId}`, payload);
      } else {
        await axiosClient.post('/coupons', payload);
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi lưu mã giảm giá');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Mã Giảm Giá</h1>
        {!showForm && (
          <button className="admin-btn primary" onClick={handleCreateNew}>
            + Thêm mới
          </button>
        )}
      </div>

      {showForm ? (
        <div className="admin-card form-card">
          <h2>{editingId ? 'Chỉnh sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group-row">
              <div className="form-group">
                <label>Mã Code (*)</label>
                <input type="text" name="Code" value={formData.Code} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Tên Chương Trình (*)</label>
                <input type="text" name="Name" value={formData.Name} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea name="Description" value={formData.Description} onChange={handleInputChange} rows={2} />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Loại Giảm Giá</label>
                <select name="DiscountType" value={formData.DiscountType} onChange={handleInputChange}>
                  <option value="FIXED_AMOUNT">Số Tiền (VND)</option>
                  <option value="PERCENTAGE">Phần Trăm (%)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mức Giảm (*)</label>
                <input type="number" step="0.01" name="DiscountValue" value={formData.DiscountValue} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Đơn tối thiểu</label>
                <input type="number" step="0.01" name="MinOrderValue" value={formData.MinOrderValue} onChange={handleInputChange} required />
              </div>
            </div>

            {formData.DiscountType === 'PERCENTAGE' && (
              <div className="form-group">
                <label>Giảm tối đa (VND) - Bỏ trống nếu không giới hạn</label>
                <input type="number" step="0.01" name="MaxDiscountAmount" value={formData.MaxDiscountAmount} onChange={handleInputChange} />
              </div>
            )}

            <div className="form-group-row">
              <div className="form-group">
                <label>Tổng lượt dùng (Bỏ trống: Vô hạn)</label>
                <input type="number" name="UsageLimit" value={formData.UsageLimit} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Lượt dùng / Mỗi KH (Bỏ trống: Vô hạn)</label>
                <input type="number" name="UsageLimitPerUser" value={formData.UsageLimitPerUser} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Ngày bắt đầu (*)</label>
                <input type="datetime-local" name="StartDate" value={formData.StartDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc (Bỏ trống: Không hết hạn)</label>
                <input type="datetime-local" name="EndDate" value={formData.EndDate} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Áp dụng cho</label>
              <select name="ApplyTo" value={formData.ApplyTo} onChange={handleInputChange}>
                <option value="ALL">Tất cả sản phẩm</option>
                <option value="CATEGORY">Theo danh mục</option>
                <option value="PRODUCT">Theo sản phẩm cụ thể</option>
              </select>
            </div>

            {formData.ApplyTo === 'CATEGORY' && (
              <div className="form-group">
                <label>Chọn danh mục (Giữ Ctrl / Cmd để chọn nhiều)</label>
                <select multiple name="CategoryIds" value={formData.CategoryIds} onChange={handleInputChange} style={{ height: '100px' }}>
                  {categories.map(c => (
                    <option key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.ApplyTo === 'PRODUCT' && (
              <div className="form-group">
                <label>Chọn sản phẩm (Giữ Ctrl / Cmd để chọn nhiều)</label>
                <select multiple name="ProductIds" value={formData.ProductIds} onChange={handleInputChange} style={{ height: '100px' }}>
                  {products.map(p => (
                    <option key={p.ProductId} value={p.ProductId}>{p.ProductName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="admin-btn primary">Lưu lại</button>
              <button type="button" className="admin-btn secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="admin-table-container">
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Tên</th>
                  <th>Mức giảm</th>
                  <th>Hạn dùng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.CouponId}>
                    <td><strong>{coupon.Code}</strong></td>
                    <td>{coupon.Name}</td>
                    <td>
                      {coupon.DiscountType === 'FIXED_AMOUNT' ? 
                        `${Number(coupon.DiscountValue).toLocaleString()}đ` : 
                        `${coupon.DiscountValue}%`}
                    </td>
                    <td>
                      {coupon.EndDate ? new Date(coupon.EndDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td>
                      <button 
                        className={`status-badge ${coupon.IsActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggle(coupon.CouponId)}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {coupon.IsActive ? 'Đang bật' : 'Đã tắt'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button className="text-btn edit" onClick={() => handleEdit(coupon)}>Sửa</button>
                      <button className="text-btn delete" onClick={() => handleDelete(coupon.CouponId)}>Xoá</button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-message">Chưa có mã giảm giá nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
