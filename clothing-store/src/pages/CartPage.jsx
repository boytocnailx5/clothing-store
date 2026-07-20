import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/useCart'
import { formatCurrency } from '../data/products'
import axiosClient from '../api/axiosClient'

function CartPage() {
  const { items, removeItem, totalPrice, updateQuantity } = useCart()
  
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    setIsApplying(true)
    try {
      const payload = {
        code: couponCode,
        orderTotal: totalPrice,
        items: items.map(item => ({
          ProductId: item.product.id,
          CategoryId: item.product.categoryId, // Ensure product has categoryId in data
          Price: item.product.price,
          Quantity: item.quantity
        }))
      }
      // Note: If logged in, axiosClient will send token automatically if configured
      const res = await axiosClient.post('/coupons/validate', payload)
      if (res.data.success) {
        setAppliedCoupon(res.data.data) // { isValid, coupon, discountAmount }
      }
    } catch (err) {
      setAppliedCoupon(null)
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const shippingFee = totalPrice >= 500000 ? 0 : 30000
  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount)

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
                
                <div className="coupon-section" style={{ margin: '20px 0', padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                  <p style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>Mã khuyến mãi</p>
                  
                  {appliedCoupon ? (
                    <div className="applied-coupon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '4px' }}>
                      <div>
                        <strong style={{ color: '#16a34a' }}>{appliedCoupon.coupon.Code}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Đã áp dụng giảm giá</div>
                      </div>
                      <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Gỡ</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Nhập mã..." 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <button 
                        type="button" 
                        className="button button-dark" 
                        onClick={handleApplyCoupon}
                        disabled={isApplying || !couponCode.trim()}
                        style={{ padding: '8px 16px' }}
                      >
                        {isApplying ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                  )}
                  {couponError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{couponError}</p>}
                </div>

                <div>
                  <span>Tạm tính</span>
                  <strong>{formatCurrency(totalPrice)}</strong>
                </div>
                <div>
                  <span>Phí vận chuyển</span>
                  <strong>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</strong>
                </div>
                {discountAmount > 0 && (
                  <div style={{ color: '#16a34a' }}>
                    <span>Giảm giá</span>
                    <strong>-{formatCurrency(discountAmount)}</strong>
                  </div>
                )}
                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <strong>{formatCurrency(finalTotal)}</strong>
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
