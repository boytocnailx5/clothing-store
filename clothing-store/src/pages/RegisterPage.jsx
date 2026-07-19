import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [errorMsg, setErrorMsg] = useState('')

  const updateField = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    try {
      const response = await axiosClient.post('/auth/register', formData)
      if (response.data.success) {
        alert('Đăng ký thành công! Hãy đăng nhập.')
        navigate('/login')
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
    }
  }

  return (
    <main className="page-main auth-page">
      <section className="auth-card">
        <p className="eyebrow">THÀNH VIÊN MỚI</p>
        <h1>Tạo tài khoản</h1>
        <p>Đăng ký để mua hàng và theo dõi trạng thái đơn hàng.</p>

        {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Họ và tên</label>
          <input id="fullName" name="fullName" required value={formData.fullName} onChange={updateField} />

          <label htmlFor="registerEmail">Email</label>
          <input id="registerEmail" name="email" required type="email" value={formData.email} onChange={updateField} />

          <label htmlFor="phone">Số điện thoại</label>
          <input id="phone" name="phone" value={formData.phone} onChange={updateField} />

          <label htmlFor="registerPassword">Mật khẩu</label>
          <input id="registerPassword" minLength="6" name="password" required type="password" value={formData.password} onChange={updateField} />

          <button className="button button-dark full-button" type="submit">
            Đăng ký
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
