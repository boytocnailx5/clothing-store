import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="page-main">
      <div className="container empty-state">
        <p className="eyebrow">LỖI 404</p>
        <h1>Trang không tồn tại</h1>
        <Link className="button button-dark" to="/">
          Về trang chủ
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
