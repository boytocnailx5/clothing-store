import { Link } from 'react-router-dom'
import { useCart } from '../contexts/useCart'
import { formatCurrency } from '../data/products'

function CartPage() {
  const { items, removeItem, totalPrice, updateQuantity } = useCart()

  return (
    <main className="page-main">
      <section className="page-banner compact-banner">
        <div className="container">
          <p className="eyebrow">ĐƠN HÀNG</p>
          <h1>Giỏ hàng của bạn</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="empty-state">
              <h2>Giỏ hàng đang trống</h2>
              <p>Hãy chọn một vài sản phẩm mà bạn yêu thích.</p>
              <Link className="button button-dark" to="/products">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list">
                {items.map((item, index) => (
                  <article className="cart-item" key={`${item.product.id}-${item.size}-${item.color}`}>
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>
                      <p>Màu: {item.color} · Size: {item.size}</p>
                      <strong>{formatCurrency(item.product.price)}</strong>
                    </div>
                    <div className="quantity-control">
                      <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-button" type="button" onClick={() => removeItem(index)}>
                      Xóa
                    </button>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h2>Tóm tắt đơn hàng</h2>
                <div>
                  <span>Tạm tính</span>
                  <strong>{formatCurrency(totalPrice)}</strong>
                </div>
                <div>
                  <span>Phí vận chuyển</span>
                  <strong>{totalPrice >= 500000 ? 'Miễn phí' : formatCurrency(30000)}</strong>
                </div>
                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <strong>{formatCurrency(totalPrice + (totalPrice >= 500000 ? 0 : 30000))}</strong>
                </div>
                <button className="button button-dark full-button" type="button">
                  Tiến hành đặt hàng
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CartPage
