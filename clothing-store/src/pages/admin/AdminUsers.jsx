import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import useAuth from '../../contexts/useAuth';
import './AdminStyles.css';

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // State quản lý form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Phone: '',
    Password: '',
    Role: 'CUSTOMER',
    Status: 'ACTIVE'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      FullName: '',
      Email: '',
      Phone: '',
      Password: '',
      Role: 'CUSTOMER',
      Status: 'ACTIVE'
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleEdit = (u) => {
    setEditingId(u.UserId);
    setFormData({
      FullName: u.FullName || '',
      Email: u.Email || '',
      Phone: u.Phone || '',
      Password: '', // Để trống nếu giữ nguyên
      Role: u.Role || 'CUSTOMER',
      Status: u.Status || 'ACTIVE'
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleDelete = async (id, fullName) => {
    const currentUserId = currentUser?.userId || currentUser?.UserId;
    if (currentUserId && Number(currentUserId) === Number(id)) {
      alert('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${fullName}" không?`)) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate thông tin
    if (!formData.FullName || !formData.Email) {
      setError('Họ tên và Email là bắt buộc');
      return;
    }
    if (!editingId && !formData.Password) {
      setError('Mật khẩu là bắt buộc khi tạo tài khoản mới');
      return;
    }

    try {
      const payload = { ...formData };
      if (editingId && !payload.Password) {
        delete payload.Password;
      }

      if (editingId) {
        await axiosClient.put(`/users/${editingId}`, payload);
        setSuccess('Cập nhật người dùng thành công!');
      } else {
        await axiosClient.post('/users', payload);
        setSuccess('Tạo người dùng thành công!');
      }

      setTimeout(() => {
        setShowForm(false);
        fetchUsers();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi xử lý, vui lòng kiểm tra lại');
    }
  };

  // Lọc và Tìm kiếm người dùng
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.FullName && u.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.Email && u.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.Phone && u.Phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'ALL' || u.Role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Người dùng</h1>
        {!showForm && (
          <button className="admin-btn primary" onClick={handleCreateNew}>
            + Thêm Người dùng
          </button>
        )}
      </div>

      {showForm ? (
        <div className="admin-card form-card">
          <h2>{editingId ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '1rem', fontWeight: 600 }}>{success}</div>}
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên (*)</label>
              <input type="text" name="FullName" value={formData.FullName} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Email (*)</label>
              <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} disabled={!!editingId} required />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>
                {editingId ? 'Mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu (*)'}
              </label>
              <input type="password" name="Password" value={formData.Password} onChange={handleInputChange} required={!editingId} />
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Vai trò</label>
                <select name="Role" value={formData.Role} onChange={handleInputChange}>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Trạng thái</label>
                <select name="Status" value={formData.Status} onChange={handleInputChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="admin-btn primary">Thực hiện</button>
              <button type="button" className="admin-btn secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="admin-filters-bar" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  border: '1px solid var(--line, #dedbd5)',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>
            <div className="filter-dropdowns" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', border: '1px solid var(--line, #dedbd5)', borderRadius: '8px', background: 'white' }}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', border: '1px solid var(--line, #dedbd5)', borderRadius: '8px', background: 'white' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="BLOCKED">Bị chặn</option>
              </select>
              <button 
                className="admin-btn secondary" 
                onClick={fetchUsers} 
                style={{ padding: '0.6rem 1rem' }}
              >
                Tải lại
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</p> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const currentUserId = currentUser?.userId || currentUser?.UserId;
                    const isSelf = currentUserId && Number(currentUserId) === Number(u.UserId);
                    return (
                      <tr key={u.UserId}>
                        <td>#{u.UserId}</td>
                        <td><strong>{u.FullName}</strong></td>
                        <td>{u.Email}</td>
                        <td>{u.Phone || <em style={{ color: '#999' }}>Chưa cung cấp</em>}</td>
                        <td>
                          <span className={`badge badge-role-${u.Role ? u.Role.toLowerCase() : 'customer'}`}>
                            {u.Role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-status-${u.Status ? u.Status.toLowerCase() : 'active'}`}>
                            {u.Status === 'ACTIVE' ? 'Hoạt động' : 'Bị chặn'}
                          </span>
                        </td>
                        <td>{u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                        <td className="actions-cell">
                          <button className="text-btn edit" onClick={() => handleEdit(u)}>Sửa</button>
                          <button 
                            className="text-btn delete" 
                            disabled={isSelf}
                            onClick={() => handleDelete(u.UserId, u.FullName)}
                            title={isSelf ? "Không thể tự xóa bản thân" : "Xóa người dùng"}
                          >
                            Xoá
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-message">Không tìm thấy người dùng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminUsers;
