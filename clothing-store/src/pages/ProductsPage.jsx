import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || 'Tất cả'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(categoryFromUrl)

  const categories = ['Tất cả', ...new Set(products.map((item) => item.category))]

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchSearch = product.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        const matchCategory =
          category === 'Tất cả' || product.category === category

        return matchSearch && matchCategory
      }),
    [category, search],
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

          <p className="result-count">Tìm thấy {filteredProducts.length} sản phẩm</p>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Không tìm thấy sản phẩm</h2>
              <p>Hãy thử từ khóa hoặc danh mục khác.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ProductsPage
