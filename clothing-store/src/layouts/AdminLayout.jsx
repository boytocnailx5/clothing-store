import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../contexts/useAuth';
import './AdminLayout.css';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          STYLE<span>ADMIN</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Bảng điều khiển
          </NavLink>
          <NavLink to="/admin/categories">
            Quản lý Danh mục
          </NavLink>
          <NavLink to="/admin/products">
            Quản lý Sản phẩm
          </NavLink>
          <NavLink to="/admin/users">
            Quản lý Người dùng
          </NavLink>
          <NavLink to="/">
            Về trang cửa hàng
          </NavLink>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-greeting">
            Xin chào, <strong>{user?.fullName || user?.email}</strong>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default AdminLayout;
