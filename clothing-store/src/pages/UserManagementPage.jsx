import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import useAuth from '../contexts/useAuth';

function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Phone: '',
    Password: '',
    Role: 'CUSTOMER',
    Status: 'ACTIVE'
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/users');
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error('Không thể tải danh sách người dùng');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalType('create');
    setFormData({
      FullName: '',
      Email: '',
      Phone: '',
      Password: '',
      Role: 'CUSTOMER',
      Status: 'ACTIVE'
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      FullName: user.FullName || '',
      Email: user.Email || '',
      Phone: user.Phone || '',
      Password: '', // Để trống nếu không muốn đổi password
      Role: user.Role || 'CUSTOMER',
      Status: user.Status || 'ACTIVE'
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Basic validation
    if (!formData.FullName || !formData.Email) {
      setFormError('Họ tên và Email là bắt buộc');
      return;
    }
    if (modalType === 'create' && !formData.Password) {
      setFormError('Mật khẩu là bắt buộc khi tạo tài khoản mới');
      return;
    }

    try {
      const payload = { ...formData };
      // Nếu là edit và mật khẩu trống, xóa password để tránh ghi đè password rỗng
      if (modalType === 'edit' && !payload.Password) {
        delete payload.Password;
      }

      if (modalType === 'create') {
        const response = await axiosClient.post('/users', payload);
        if (response.data && response.data.success) {
          setFormSuccess('Tạo người dùng thành công!');
          setTimeout(() => {
            setIsModalOpen(false);
            fetchUsers();
          }, 1000);
        }
      } else {
        const response = await axiosClient.put(`/users/${selectedUser.UserId}`, payload);
        if (response.data && response.data.success) {
          setFormSuccess('Cập nhật người dùng thành công!');
          setTimeout(() => {
            setIsModalOpen(false);
            fetchUsers();
          }, 1000);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleDeleteUser = async (userId, fullName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${fullName}" không?`)) {
      try {
        const response = await axiosClient.delete(`/users/${userId}`);
        if (response.data && response.data.success) {
          alert('Xóa người dùng thành công!');
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  // Client-side filtering & searching
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.FullName && user.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.Email && user.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.Phone && user.Phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'ALL' || user.Role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <main className="page-main">
      {/* Banner */}
      <section className="page-banner compact-banner">
        <div className="container">
          <div className="banner-content-layout">
            <div>
              <span className="eyebrow">Dành cho Admin</span>
              <h1>Quản lý Người dùng</h1>
              <p>Danh sách tài khoản khách hàng và nhân viên trong hệ thống.</p>
            </div>
            <button className="button button-dark" onClick={handleOpenCreateModal}>
              + Thêm người dùng mới
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section">
        <div className="container">
          {/* Filters & Search */}
          <div className="admin-filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdowns">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="BLOCKED">Bị chặn</option>
              </select>
              <button className="button button-light" onClick={fetchUsers} title="Làm mới">
                🔄 Tải lại
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-responsive-wrapper">
            {isLoading ? (
              <div className="loading-state">Đang tải danh sách người dùng...</div>
            ) : error ? (
              <div className="error-state">
                <p>Lỗi: {error}</p>
                <button className="button button-dark" onClick={fetchUsers}>Thử lại</button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <h2>Không tìm thấy người dùng</h2>
                <p>Không có kết quả nào phù hợp với bộ lọc tìm kiếm.</p>
              </div>
            ) : (
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
                  {filteredUsers.map((user) => (
                    <tr key={user.UserId}>
                      <td><strong>#{user.UserId}</strong></td>
                      <td>{user.FullName}</td>
                      <td>{user.Email}</td>
                      <td>{user.Phone || <em className="muted-text">Chưa cung cấp</em>}</td>
                      <td>
                        <span className={`badge badge-role-${user.Role ? user.Role.toLowerCase() : 'customer'}`}>
                          {user.Role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-status-${user.Status ? user.Status.toLowerCase() : 'active'}`}>
                          {user.Status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td>{user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action edit"
                            onClick={() => handleOpenEditModal(user)}
                            title="Sửa thông tin"
                          >
                            📝 Sửa
                          </button>
                          <button
                            className="btn-action delete"
                            disabled={currentUser && currentUser.userId === user.UserId}
                            onClick={() => handleDeleteUser(user.UserId, user.FullName)}
                            title={currentUser && currentUser.userId === user.UserId ? "Không thể tự xóa bản thân" : "Xóa người dùng"}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{modalType === 'create' ? 'Tạo Người Dùng Mới' : 'Sửa Thông Tin Người Dùng'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              {formError && <div className="form-alert error">{formError}</div>}
              {formSuccess && <div className="form-alert success">{formSuccess}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="FullName">Họ tên *</label>
                  <input
                    type="text"
                    id="FullName"
                    name="FullName"
                    value={formData.FullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Email">Email *</label>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    disabled={modalType === 'edit'} // Không cho sửa email khi edit
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Phone">Số điện thoại</label>
                  <input
                    type="text"
                    id="Phone"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Password">
                    {modalType === 'create' ? 'Mật khẩu *' : 'Mật khẩu mới (bỏ trống nếu giữ nguyên)'}
                  </label>
                  <input
                    type="password"
                    id="Password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleInputChange}
                    required={modalType === 'create'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Role">Vai trò</label>
                  <select
                    id="Role"
                    name="Role"
                    value={formData.Role}
                    onChange={handleInputChange}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Status">Trạng thái</label>
                  <select
                    id="Status"
                    name="Status"
                    value={formData.Status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-light" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="button button-dark">
                  {modalType === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled JSX for Premium Dashboard Design */}
      <style>{`
        .banner-content-layout {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .admin-filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
        }

        .search-box input {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 12px 20px;
          outline: none;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-box input:focus {
          border-color: #778c26;
          box-shadow: 0 0 0 3px rgba(214, 255, 66, 0.3);
        }

        .filter-dropdowns {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-dropdowns select {
          padding: 12px 18px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: white;
          color: var(--ink);
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        .table-responsive-wrapper {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: white;
          overflow-x: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }

        .admin-table th {
          background: #fcfbfa;
          padding: 16px 20px;
          font-weight: 700;
          color: var(--muted);
          border-bottom: 1px solid var(--line);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--line);
          color: #333;
        }

        .admin-table tr:last-child td {
          border-bottom: none;
        }

        .admin-table tr:hover td {
          background: #fdfdfc;
        }

        .badge {
          display: inline-block;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 999px;
          text-transform: uppercase;
        }

        .badge-role-admin {
          background: #f3e8ff;
          color: #6b21a8;
        }

        .badge-role-customer {
          background: #e2e8f0;
          color: #475569;
        }

        .badge-status-active {
          background: #f0fdf4;
          color: #166534;
        }

        .badge-status-blocked {
          background: #fef2f2;
          color: #991b1b;
        }

        .muted-text {
          color: var(--muted);
          font-style: italic;
          font-size: 0.85rem;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          border: 1px solid var(--line);
          background: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-action.edit:hover {
          background: #f5f2ec;
          border-color: var(--ink);
        }

        .btn-action.delete:hover:not(:disabled) {
          background: #fee2e2;
          color: #b91c1c;
          border-color: #fca5a5;
        }

        .btn-action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-card {
          background: white;
          border: 1px solid var(--line);
          width: min(580px, 100%);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fcfbfa;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
          letter-spacing: -0.02em;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: var(--muted);
          line-height: 1;
        }

        .modal-close-btn:hover {
          color: var(--ink);
        }

        .modal-form {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 500px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--ink);
        }

        .form-group input,
        .form-group select {
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 8px;
          outline: none;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #778c26;
          box-shadow: 0 0 0 3px rgba(214, 255, 66, 0.3);
        }

        .modal-footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-alert {
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .form-alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .form-alert.success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .loading-state,
        .error-state {
          padding: 60px;
          text-align: center;
          color: var(--muted);
          font-weight: 600;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

export default UserManagementPage;
