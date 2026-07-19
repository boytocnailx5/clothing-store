import { Link } from 'react-router-dom'
import { formatCurrency } from '../data/products'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link className="product-image-wrap" to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.oldPrice && <span className="sale-badge">Sale</span>}
      </Link>

      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
