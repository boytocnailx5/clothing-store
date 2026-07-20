import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import useAuth from '../../contexts/useAuth';
import './AdminStyles.css';

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal xem chi tiết khách hàng
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'addresses' | 'orders'

  // Form Thêm / Sửa người dùng
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

  // Tải danh sách người dùng / khách hàng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/users', {
        params: { search: searchTerm }
      });
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
  }, [searchTerm]);

  // Xem chi tiết khách hàng (Thông tin, Địa chỉ, Lịch sử mua hàng)
  const handleViewDetail = async (userId) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      setActiveTab('info');
      const res = await axiosClient.get(`/users/${userId}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể lấy thông tin chi tiết khách hàng');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Khóa hoặc Mở khóa tài khoản
  const handleToggleStatus = async (user) => {
    const currentUserId = currentUser?.userId || currentUser?.UserId;
    if (currentUserId && Number(currentUserId) === Number(user.UserId)) {
      alert('Bạn không thể tự khóa tài khoản của chính mình.');
      return;
    }

    const actionText = user.Status === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.FullName}"?`)) {
      return;
    }

    try {
      const res = await axiosClient.patch(`/users/${user.UserId}/toggle-status`);
      alert(res.data.message || 'Cập nhật trạng thái thành công');
      fetchUsers();
      if (selectedUser && selectedUser.UserId === user.UserId) {
        setSelectedUser(prev => ({
          ...prev,
          Status: prev.Status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
        }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  // Xóa tài khoản khách hàng
  const handleDelete = async (id, fullName) => {
    const currentUserId = currentUser?.userId || currentUser?.UserId;
    if (currentUserId && Number(currentUserId) === Number(id)) {
      alert('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${fullName}" không?\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      await axiosClient.delete(`/users/${id}`);
      alert(`Đã xóa thành công tài khoản "${fullName}"`);
      if (showDetailModal && selectedUser?.UserId === id) {
        setShowDetailModal(false);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa tài khoản khách hàng');
    }
  };

  // Thêm / Sửa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      Password: '',
      Role: u.Role || 'CUSTOMER',
      Status: u.Status || 'ACTIVE'
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
        setSuccess('Tạo người dùng mới thành công!');
      }

      setTimeout(() => {
        setShowForm(false);
        fetchUsers();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi xử lý thông tin người dùng');
    }
  };

  // Lọc danh sách hiển thị
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      (u.FullName && u.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.Email && u.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.Phone && u.Phone.includes(searchTerm));

    const matchesRole = roleFilter === 'ALL' || u.Role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Tính toán thống kê nhanh
  const totalCustomers = users.filter(u => u.Role === 'CUSTOMER').length;
  const totalBlocked = users.filter(u => u.Status === 'BLOCKED').length;

  const formatVND = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-status-active">Hoàn thành</span>;
      case 'SHIPPING':
        return <span className="badge badge-role-customer">Đang giao</span>;
      case 'CONFIRMED':
        return <span className="badge badge-role-admin">Đã xác nhận</span>;
      case 'CANCELLED':
        return <span className="badge badge-status-blocked">Đã hủy</span>;
      default:
        return <span className="badge badge-count">Chờ xử lý</span>;
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Khách hàng & Người dùng</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Xem thông tin, địa chỉ nhận hàng, lịch sử mua hàng, khóa/mở khóa & quản lý tài khoản.
          </p>
        </div>
        {!showForm && (
          <button className="admin-btn primary" onClick={handleCreateNew}>
            + Thêm Người Dùng Mới
          </button>
        )}
      </div>

      {/* Thẻ Thống Kê Nhanh */}
      {!showForm && (
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>👥</div>
            <div className="stat-info">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Tổng người dùng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fdf4ff', color: '#c026d3' }}>🛒</div>
            <div className="stat-info">
              <div className="stat-value">{totalCustomers}</div>
              <div className="stat-label">Tài khoản Khách hàng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>🔒</div>
            <div className="stat-info">
              <div className="stat-value">{totalBlocked}</div>
              <div className="stat-label">Tài khoản bị khóa</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Form hay Bảng */}
      {showForm ? (
        <div className="admin-card form-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dedbd5' }}>
          <h2>{editingId ? 'Chỉnh sửa Tài khoản' : 'Thêm Người dùng mới'}</h2>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: '#16a34a', marginBottom: '1rem', fontWeight: 600 }}>{success}</div>}

          <form className="admin-form" onSubmit={handleSubmitForm}>
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
              <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} placeholder="09xxxxxxx" />
            </div>

            <div className="form-group">
              <label>
                {editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu (*)'}
              </label>
              <input type="password" name="Password" value={formData.Password} onChange={handleInputChange} required={!editingId} />
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Vai trò</label>
                <select name="Role" value={formData.Role} onChange={handleInputChange}>
                  <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                  <option value="ADMIN">ADMIN (Quản trị)</option>
                </select>
              </div>
              <div>
                <label>Trạng thái</label>
                <select name="Status" value={formData.Status} onChange={handleInputChange}>
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="BLOCKED">BLOCKED (Khóa)</option>
                </select>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="admin-btn primary">Lưu lại</button>
              <button type="button" className="admin-btn secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Thanh Tìm Kiếm & Bộ Lọc */}
          <div className="admin-filters-bar" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  border: '1px solid var(--line, #dedbd5)',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '0.65rem 1rem', border: '1px solid var(--line, #dedbd5)', borderRadius: '8px', background: 'white' }}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                <option value="ADMIN">Quản trị (ADMIN)</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.65rem 1rem', border: '1px solid var(--line, #dedbd5)', borderRadius: '8px', background: 'white' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="BLOCKED">Đã khóa</option>
              </select>
              <button
                className="admin-btn secondary"
                onClick={fetchUsers}
                title="Tải lại danh sách"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Bảng Danh Sách Khách Hàng */}
          <div className="admin-table-container">
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center' }}>⏳ Đang tải dữ liệu khách hàng...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã KH</th>
                    <th>Họ và tên</th>
                    <th>Email & Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Tổng đơn hàng</th>
                    <th>Tổng chi tiêu</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const currentUserId = currentUser?.userId || currentUser?.UserId;
                    const isSelf = currentUserId && Number(currentUserId) === Number(u.UserId);

                    return (
                      <tr key={u.UserId}>
                        <td><strong>#{u.UserId}</strong></td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#111827' }}>{u.FullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Đăng ký: {u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString('vi-VN') : '-'}
                          </div>
                        </td>
                        <td>
                          <div>{u.Email}</div>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                            {u.Phone || <em style={{ color: '#9ca3af' }}>Chưa cập nhật</em>}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-role-${u.Role ? u.Role.toLowerCase() : 'customer'}`}>
                            {u.Role}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-count">
                            📦 {u.totalOrders || 0} đơn
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#059669' }}>
                            {formatVND(u.totalSpent)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge badge-status-${u.Status ? u.Status.toLowerCase() : 'active'}`}>
                            {u.Status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="text-btn view"
                              onClick={() => handleViewDetail(u.UserId)}
                              title="Xem chi tiết thông tin, địa chỉ & lịch sử mua hàng"
                            >
                              👁️ Chi tiết
                            </button>
                            <button
                              className={`text-btn ${u.Status === 'ACTIVE' ? 'lock' : 'unlock'}`}
                              disabled={isSelf}
                              onClick={() => handleToggleStatus(u)}
                              title={isSelf ? "Không thể tự khóa bản thân" : u.Status === 'ACTIVE' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              {u.Status === 'ACTIVE' ? '🔒 Khóa' : '🔓 Mở khóa'}
                            </button>
                            <button
                              className="text-btn edit"
                              onClick={() => handleEdit(u)}
                              title="Chỉnh sửa thông tin"
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="text-btn delete"
                              disabled={isSelf}
                              onClick={() => handleDelete(u.UserId, u.FullName)}
                              title={isSelf ? "Không thể tự xóa bản thân" : "Xóa tài khoản"}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-message">
                        Không tìm thấy khách hàng / người dùng nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal Xem Chi Tiết Khách Hàng */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                👤 Thông tin Chi tiết Khách hàng #{selectedUser?.UserId}
              </h2>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            {detailLoading || !selectedUser ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '3rem' }}>
                ⏳ Đang tải chi tiết thông tin khách hàng...
              </div>
            ) : (
              <>
                <div className="modal-body">
                  {/* Tabs */}
                  <div className="modal-tabs">
                    <button
                      className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      📋 Thông tin & Thống kê
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                      onClick={() => setActiveTab('addresses')}
                    >
                      📍 Địa chỉ nhận hàng ({selectedUser?.Addresses?.length || 0})
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      🛍️ Lịch sử mua hàng ({selectedUser?.Orders?.length || 0})
                    </button>
                  </div>

                  {/* Tab 1: Thông tin chung & Thống kê */}
                  {activeTab === 'info' && (
                    <div>
                      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="stat-card" style={{ background: '#f8fafc' }}>
                          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>📦</div>
                          <div className="stat-info">
                            <div className="stat-value">{selectedUser.totalOrders || 0} đơn</div>
                            <div className="stat-label">Tổng số đơn hàng</div>
                          </div>
                        </div>
                        <div className="stat-card" style={{ background: '#f8fafc' }}>
                          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>💰</div>
                          <div className="stat-info">
                            <div className="stat-value" style={{ color: '#15803d' }}>{formatVND(selectedUser.totalSpent)}</div>
                            <div className="stat-label">Tổng chi tiêu mua hàng</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Họ và tên</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>{selectedUser.FullName}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Email liên hệ</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>{selectedUser.Email}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Số điện thoại</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>{selectedUser.Phone || 'Chưa cung cấp'}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Vai trò tài khoản</p>
                          <span className={`badge badge-role-${selectedUser.Role?.toLowerCase()}`}>{selectedUser.Role}</span>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Trạng thái tài khoản</p>
                          <span className={`badge badge-status-${selectedUser.Status?.toLowerCase()}`}>
                            {selectedUser.Status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>Ngày tham gia</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>
                            {selectedUser.CreatedAt ? new Date(selectedUser.CreatedAt).toLocaleString('vi-VN') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Địa chỉ nhận hàng */}
                  {activeTab === 'addresses' && (
                    <div>
                      {selectedUser.Addresses && selectedUser.Addresses.length > 0 ? (
                        <div className="address-grid">
                          {selectedUser.Addresses.map((addr) => (
                            <div key={addr.AddressId} className={`address-card ${addr.IsDefault ? 'default' : ''}`}>
                              {addr.IsDefault && <span className="address-tag">Địa chỉ mặc định</span>}
                              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                                👤 {addr.ReceiverName} ({addr.ReceiverPhone})
                              </div>
                              <div style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.4 }}>
                                🏠 {addr.AddressDetail}, {addr.Ward}, {addr.District}, {addr.Province}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          📍 Khách hàng chưa đăng ký địa chỉ nhận hàng nào.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Lịch sử mua hàng */}
                  {activeTab === 'orders' && (
                    <div>
                      {selectedUser.Orders && selectedUser.Orders.length > 0 ? (
                        <table className="admin-table" style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th>Mã Đơn Hàng</th>
                              <th>Ngày Đặt</th>
                              <th>Thanh Toán</th>
                              <th>Trạng Thái</th>
                              <th>Tổng Tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.Orders.map((ord) => (
                              <tr key={ord.OrderId}>
                                <td><strong>#{ord.OrderCode}</strong></td>
                                <td>{ord.CreatedAt ? new Date(ord.CreatedAt).toLocaleString('vi-VN') : '-'}</td>
                                <td>
                                  <div>{ord.PaymentMethod}</div>
                                  <span style={{ fontSize: '0.75rem', color: ord.PaymentStatus === 'PAID' ? '#16a34a' : '#d97706' }}>
                                    {ord.PaymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                  </span>
                                </td>
                                <td>{getOrderStatusBadge(ord.OrderStatus)}</td>
                                <td><strong style={{ color: '#059669' }}>{formatVND(ord.TotalAmount)}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          🛍️ Khách hàng chưa có lịch sử đơn hàng nào.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className={`admin-btn ${selectedUser.Status === 'ACTIVE' ? 'warning' : 'success'}`}
                    onClick={() => handleToggleStatus(selectedUser)}
                  >
                    {selectedUser.Status === 'ACTIVE' ? '🔒 Khóa tài khoản' : '🔓 Mở khóa tài khoản'}
                  </button>
                  <button
                    className="admin-btn secondary"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
