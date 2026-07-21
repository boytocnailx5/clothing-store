import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../contexts/useCart'
import { formatCurrency, products as staticProducts, mapBackendProduct } from '../data/products'
import axiosClient from '../api/axiosClient'

function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get(`/products/${id}`)
        if (!isMounted) return

        if (res.data.success && res.data.data) {
          const mapped = mapBackendProduct(res.data.data)
          setProduct(mapped)
          const initialColor = mapped.colors[0] || ''
          setSize(mapped.sizes[0] || '')
          setColor(initialColor)
          
          // Select initial main image
          const matchingImg = mapped.images.find(img => img.colorName && img.colorName.toLowerCase() === initialColor.toLowerCase())
          setSelectedImage(matchingImg ? matchingImg.url : mapped.image)
        } else {
          const fallback = staticProducts.find((item) => item.id === Number(id))
          setProduct(fallback || null)
          if (fallback) {
            setSize(fallback.sizes[0] || '')
            setColor(fallback.colors[0] || '')
            setSelectedImage(fallback.image)
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err)
        if (isMounted) {
          const fallback = staticProducts.find((item) => item.id === Number(id))
          setProduct(fallback || null)
          if (fallback) {
            setSize(fallback.sizes[0] || '')
            setColor(fallback.colors[0] || '')
            setSelectedImage(fallback.image)
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProduct()
    return () => {
      isMounted = false
    }
  }, [id])

  // Handle color change: auto switch image if matching color image exists
  const handleColorChange = (newColor) => {
    setColor(newColor)
    if (product && product.images) {
      const match = product.images.find(
        (img) => img.colorName && img.colorName.toLowerCase() === newColor.toLowerCase()
      )
      if (match) {
        setSelectedImage(match.url)
      }
    }
  }

  // Handle thumbnail click: switch main image and optionally switch color
  const handleThumbnailClick = (img) => {
    setSelectedImage(img.url)
    if (img.colorName && product.colors.includes(img.colorName)) {
      setColor(img.colorName)
    }
  }

  if (loading) {
    return (
      <main className="page-main">
        <div className="container empty-state">
          <p>Đang tải chi tiết sản phẩm...</p>
        </div>
      </main>
    )
  }

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
          <div className="product-detail-media">
            <div className="product-detail-image">
              <img src={selectedImage || product.image} alt={product.name} />
            </div>

            {/* THUMBNAIL GALLERY */}
            {product.images && product.images.length > 1 && (
              <div className="product-thumbnails-gallery">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    className={`thumbnail-btn ${selectedImage === img.url ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(img)}
                    title={img.colorName ? `Màu: ${img.colorName}` : 'Ảnh sản phẩm'}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                    {img.colorName && <span className="thumb-color-tag">{img.colorName}</span>}
                  </button>
                ))}
              </div>
            )}
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
              <div className="color-options-wrap">
                <select id="color" value={color} onChange={(e) => handleColorChange(e.target.value)}>
                  {product.colors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
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
