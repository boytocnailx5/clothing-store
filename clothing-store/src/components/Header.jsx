import { NavLink } from 'react-router-dom'
import { useCart } from '../contexts/useCart'

function Header() {
  const { cartCount } = useCart()

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
        </nav>

        <div className="header-actions">
          <NavLink className="text-link" to="/login">
            Đăng nhập
          </NavLink>
          <NavLink className="cart-link" to="/cart">
            Giỏ hàng <span>{cartCount}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Header
