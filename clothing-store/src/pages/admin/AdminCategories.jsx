import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminStyles.css';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    CategoryName: '',
    Description: '',
    ParentId: '',
    IsActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch as flat list so ALL categories appear in the table
      const res = await axiosClient.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ CategoryName: '', Description: '', ParentId: '', IsActive: true });
    setShowForm(true);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.CategoryId);
    setFormData({
      CategoryName: cat.CategoryName,
      Description: cat.Description || '',
      ParentId: cat.ParentId === null ? '' : cat.ParentId,
      IsActive: cat.IsActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá danh mục này?')) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.ParentId === '') payload.ParentId = null;

      if (editingId) {
        await axiosClient.put(`/categories/${editingId}`, payload);
      } else {
        await axiosClient.post('/categories', payload);
      }
      
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Danh mục</h1>
        {!showForm && (
          <button className="admin-btn primary" onClick={handleCreateNew}>
            + Thêm mới
          </button>
        )}
      </div>

      {showForm ? (
        <div className="admin-card form-card">
          <h2>{editingId ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Danh mục (*)</label>
              <input 
                type="text" 
                name="CategoryName" 
                value={formData.CategoryName} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                name="Description" 
                value={formData.Description} 
                onChange={handleInputChange} 
                rows={3} 
              />
            </div>
            
            <div className="form-group">
              <label>Danh mục cha (nếu có)</label>
              <select name="ParentId" value={formData.ParentId} onChange={handleInputChange}>
                <option value="">[ Thư mục gốc ]</option>
                {categories.map((c) => {
                  // Cannot make a category its own parent
                  if (c.CategoryId === editingId) return null;
                  return (
                    <option key={c.CategoryId} value={c.CategoryId}>
                      {c.CategoryName}
                    </option>
                  );
                })}
              </select>
            </div>
            
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
                  <th>ID</th>
                  <th>Tên Danh mục</th>
                  <th>Gốc/Con</th>
                  <th>Đường dẫn (Slug)</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const parent = categories.find(c => c.CategoryId === cat.ParentId);
                  return (
                    <tr key={cat.CategoryId}>
                      <td>{cat.CategoryId}</td>
                      <td><strong>{cat.CategoryName}</strong></td>
                      <td>{cat.ParentId ? `Con của: ${parent?.CategoryName || cat.ParentId}` : 'Thư mục gốc'}</td>
                      <td>{cat.Slug}</td>
                      <td className="actions-cell">
                        <button className="text-btn edit" onClick={() => handleEdit(cat)}>Sửa</button>
                        <button className="text-btn delete" onClick={() => handleDelete(cat.CategoryId)}>Xoá</button>
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-message">Chưa có danh mục nào.</td>
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

export default AdminCategories;
