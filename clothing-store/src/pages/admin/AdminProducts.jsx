import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminStyles.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State for file upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    ProductName: '',
    Description: '',
    BasePrice: 0,
    SalePrice: 0,
    Gender: 'UNISEX',
    CategoryId: '',
    Status: 'ACTIVE',
    ImageUrl: '' // URL of uploaded image or exiting image
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/products?limit=100'),
        axiosClient.get('/categories')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setUploadFile(null);
    setFormData({
      ProductName: '',
      Description: '',
      BasePrice: 0,
      SalePrice: 0,
      Gender: 'UNISEX',
      CategoryId: categories.length > 0 ? categories[0].CategoryId : '',
      Status: 'ACTIVE',
      ImageUrl: ''
    });
    setShowForm(true);
  };

  const handleEdit = (prod) => {
    setEditingId(prod.ProductId);
    setUploadFile(null);
    setFormData({
      ProductName: prod.ProductName,
      Description: prod.Description || '',
      BasePrice: prod.BasePrice,
      SalePrice: prod.SalePrice || 0,
      Gender: prod.Gender,
      CategoryId: prod.CategoryId || '',
      Status: prod.Status,
      ImageUrl: prod.Images && prod.Images.length > 0 ? prod.Images[0].ImageUrl : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm sẽ xóa luôn các size, màu sắc và đánh giá. Bạn chắc chứ?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const payload = { ...formData };
      
      // Upload hình ảnh trước nếu người dùng có chọn file từ PC
      let finalImageUrl = payload.ImageUrl;
      if (uploadFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', uploadFile);

        const uploadRes = await axiosClient.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          finalImageUrl = uploadRes.data.data.url;
        }
      }

      // Ép kiểu
      payload.BasePrice = parseFloat(payload.BasePrice);
      payload.SalePrice = parseFloat(payload.SalePrice) || null;
      payload.CategoryId = parseInt(payload.CategoryId);

      // Gắn hình ảnh vào data
      if (finalImageUrl) {
        payload.Images = [
          {
            ImageUrl: finalImageUrl,
            IsPrimary: true,
            SortOrder: 1
          }
        ];
      } else {
        payload.Images = [];
      }
      delete payload.ImageUrl;

      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, payload);
      } else {
        await axiosClient.post('/products', payload);
      }
      
      setShowForm(false);
      setUploadFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi xử lý, vui lòng kiểm tra lại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Sản phẩm</h1>
        {!showForm && (
          <button className="admin-btn primary" onClick={handleCreateNew}>
            + Thêm Sản phẩm
          </button>
        )}
      </div>

      {showForm ? (
        <div className="admin-card form-card">
          <h2>{editingId ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Sản phẩm (*)</label>
              <input type="text" name="ProductName" value={formData.ProductName} onChange={handleInputChange} required />
            </div>
            
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 0 }}>
              <div className="form-group">
                <label>Giá gốc (*)</label>
                <input type="number" name="BasePrice" value={formData.BasePrice} onChange={handleInputChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Giá khuyến mãi</label>
                <input type="number" name="SalePrice" value={formData.SalePrice} onChange={handleInputChange} min="0" />
              </div>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: 0 }}>
              <div className="form-group">
                <label>Giới tính</label>
                <select name="Gender" value={formData.Gender} onChange={handleInputChange}>
                  <option value="UNISEX">Unisex</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="KIDS">Trẻ em</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select name="Status" value={formData.Status} onChange={handleInputChange}>
                  <option value="ACTIVE">Đang bán</option>
                  <option value="HIDDEN">Ẩn</option>
                </select>
              </div>
              <div className="form-group">
                <label>Danh mục (*)</label>
                <select name="CategoryId" value={formData.CategoryId} onChange={handleInputChange} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ảnh sản phẩm (Tải lên từ máy)</label>
              {formData.ImageUrl && !uploadFile && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={formData.ImageUrl} alt="Current" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea name="Description" value={formData.Description} onChange={handleInputChange} rows={3} />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="admin-btn primary" disabled={uploading}>
                {uploading ? 'Đang tải lên...' : 'Thực hiện'}
              </button>
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
                  <th>Ảnh</th>
                  <th>ID</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá (VNĐ)</th>
                  <th>Kho/Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.ProductId}>
                    <td>
                      {prod.Images && prod.Images.length > 0 ? (
                        <img src={prod.Images[0].ImageUrl} alt="Product" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#e5e7eb', borderRadius: 4 }}></div>
                      )}
                    </td>
                    <td>{prod.ProductId}</td>
                    <td><strong>{prod.ProductName}</strong><br/><small style={{color:'grey'}}>{prod.Slug}</small></td>
                    <td>{prod.Category?.CategoryName || 'N/A'}</td>
                    <td>
                      {prod.SalePrice ? (
                        <span>
                          <s style={{ color: 'grey', fontSize: '0.8rem' }}>{prod.BasePrice}₫</s> <br/> 
                          <span style={{ color: 'red' }}>{prod.SalePrice}₫</span>
                        </span>
                      ) : (
                        `${prod.BasePrice}₫`
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${prod.Status.toLowerCase()}`}>
                        {prod.Status === 'ACTIVE' ? 'Đang bán' : 'Bị ẩn'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="text-btn edit" onClick={() => handleEdit(prod)}>Sửa</button>
                      <button className="text-btn delete" onClick={() => handleDelete(prod.ProductId)}>Xoá</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-message">Chưa có sản phẩm nào.</td>
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

export default AdminProducts;
