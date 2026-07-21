import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products as staticProducts, mapBackendProduct } from '../data/products'
import axiosClient from '../api/axiosClient'

const defaultCategories = [
  { name: 'Áo thun', description: 'Thoải mái mỗi ngày' },
  { name: 'Áo sơ mi', description: 'Lịch sự và hiện đại' },
  { name: 'Quần jean', description: 'Bền bỉ, dễ phối đồ' },
  { name: 'Áo khoác', description: 'Hoàn thiện phong cách' },
]

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState(defaultCategories)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axiosClient.get('/products?limit=100'),
          axiosClient.get('/categories'),
        ])

        if (!isMounted) return

        const backendProds = prodRes.data.products || []
        const mapped = backendProds.map(mapBackendProduct)

        if (mapped.length > 0) {
          setFeaturedProducts(mapped.slice(0, 6))
        } else {
          setFeaturedProducts(staticProducts.filter((product) => product.featured))
        }

        if (catRes.data.data && catRes.data.data.length > 0) {
          const apiCats = catRes.data.data.map((c) => ({
            name: c.CategoryName,
            description: c.Description || 'Phong cách thời trang độc đáo',
          }))
          setCategories(apiCats)
        }
      } catch (err) {
        console.error('Error fetching home data:', err)
        if (isMounted) {
          setFeaturedProducts(staticProducts.filter((product) => product.featured))
        }
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-copy">
            <p className="eyebrow">BỘ SƯU TẬP 2026</p>
            <h1>Phong cách của bạn, lựa chọn của bạn.</h1>
            <p>
              Khám phá các thiết kế thời trang tối giản, dễ phối và phù hợp cho
              mọi ngày.
            </p>
            <div className="hero-buttons">
              <Link className="button button-dark" to="/products">
                Mua sắm ngay
              </Link>
              <a className="button button-light" href="#categories">
                Xem danh mục
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Hình minh họa thời trang">
            <div className="hero-card hero-card-one" />
            <div className="hero-card hero-card-two" />
            <span>NEW COLLECTION</span>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DANH MỤC</p>
              <h2>Mua sắm theo phong cách</h2>
            </div>
            <Link to="/products">Xem tất cả →</Link>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                className={`category-card category-${(index % 4) + 1}`}
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <span>0{index + 1}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NỔI BẬT</p>
              <h2>Sản phẩm được yêu thích</h2>
            </div>
            <Link to="/products">Xem tất cả →</Link>
          </div>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container benefits-grid">
          <article>
            <strong>01</strong>
            <h3>Miễn phí vận chuyển</h3>
            <p>Áp dụng cho đơn hàng có giá trị từ 500.000đ.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Đổi trả trong 7 ngày</h3>
            <p>Hỗ trợ đổi size hoặc sản phẩm theo chính sách cửa hàng.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Thanh toán an toàn</h3>
            <p>Hỗ trợ thanh toán COD và các phương thức trực tuyến.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default HomePage
