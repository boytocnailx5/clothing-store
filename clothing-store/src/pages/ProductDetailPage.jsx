import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../contexts/useCart'
import { formatCurrency, products } from '../data/products'

function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))
  const { addToCart } = useCart()
  const [size, setSize] = useState(product?.sizes[0] || '')
  const [color, setColor] = useState(product?.colors[0] || '')
  const [message, setMessage] = useState('')

  if (!product) {
    return (
      <main className="page-main">
        <div className="container empty-state">
          <h1>Không tìm thấy sản phẩm</h1>
          <Link className="button button-dark" to="/products">
            Quay lại sản phẩm
          </Link>
        </div>
      </main>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, size, color)
    setMessage('Đã thêm sản phẩm vào giỏ hàng.')
  }

  return (
    <main className="page-main">
      <section className="section">
        <div className="container product-detail">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <Link className="back-link" to="/products">
              ← Quay lại sản phẩm
            </Link>
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <div className="detail-price">
              <strong>{formatCurrency(product.price)}</strong>
              {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
            </div>
            <p className="detail-description">{product.description}</p>

            <div className="option-group">
              <label htmlFor="color">Màu sắc</label>
              <select id="color" value={color} onChange={(e) => setColor(e.target.value)}>
                {product.colors.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="option-group">
              <label htmlFor="size">Kích thước</label>
              <div className="size-options" id="size">
                {product.sizes.map((item) => (
                  <button
                    className={item === size ? 'active' : ''}
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button className="button button-dark full-button" type="button" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            {message && <p className="success-message">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProductDetailPage
