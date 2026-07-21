import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products as staticProducts, mapBackendProduct } from '../data/products'
import axiosClient from '../api/axiosClient'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || 'Tất cả'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(categoryFromUrl)
  const [allProducts, setAllProducts] = useState([])
  const [dbCategories, setDbCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        const [prodRes, catRes] = await Promise.all([
          axiosClient.get('/products?limit=100'),
          axiosClient.get('/categories'),
        ])

        if (!isMounted) return

        const backendProds = prodRes.data.products || []
        const mapped = backendProds.map(mapBackendProduct)

        if (mapped.length > 0) {
          setAllProducts(mapped)
        } else {
          setAllProducts(staticProducts)
        }

        if (catRes.data.data) {
          setDbCategories(catRes.data.data.map((c) => c.CategoryName))
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        if (isMounted) {
          setAllProducts(staticProducts)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((item) => item.category))
    dbCategories.forEach((cat) => set.add(cat))
    return ['Tất cả', ...Array.from(set)]
  }, [allProducts, dbCategories])

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((product) => {
        const matchSearch = product.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        const matchCategory =
          category === 'Tất cả' || product.category === category

        return matchSearch && matchCategory
      }),
    [allProducts, category, search],
  )

  return (
    <main className="page-main">
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">STYLEHUB SHOP</p>
          <h1>Tất cả sản phẩm</h1>
          <p>Tìm kiếm sản phẩm phù hợp với phong cách của bạn.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filters">
            <input
              aria-label="Tìm kiếm sản phẩm"
              placeholder="Tìm kiếm sản phẩm..."
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Lọc theo danh mục"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <p className="result-count">
            {loading ? 'Đang tải sản phẩm...' : `Tìm thấy ${filteredProducts.length} sản phẩm`}
          </p>

          {!loading && filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !loading ? (
            <div className="empty-state">
              <h2>Không tìm thấy sản phẩm</h2>
              <p>Hãy thử từ khóa hoặc danh mục khác.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default ProductsPage
