import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/useCart'
import useAuth from '../contexts/useAuth'

function Header() {
  const { cartCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand" to="/">
          STYLE<span>HUB</span>
        </NavLink>

        <nav className="main-nav" aria-label="Điều hướng chính">
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/products">Sản phẩm</NavLink>
          <a href="/#categories">Danh mục</a>
          <a href="/#about">Giới thiệu</a>
          {user && (user.role === 'ADMIN' || user.Role === 'ADMIN') && (
            <NavLink to="/admin/users">Quản lý User</NavLink>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-greeting">
                Xin chào, <strong>{user.fullName || user.FullName || user.email}</strong>
              </span>
              <button className="text-link logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink className="text-link" to="/login">Đăng nhập</NavLink>
              <NavLink className="text-link" to="/register">Đăng ký</NavLink>
            </>
          )}
          <NavLink className="cart-link" to="/cart">
            Giỏ hàng <span>{cartCount}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Header
