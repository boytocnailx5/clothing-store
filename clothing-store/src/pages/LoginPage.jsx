import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../contexts/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data.data;

      // Gọi hàm login từ AuthContext để lưu state và localStorage
      login(user, token);

      if (user.role === "ADMIN") {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể kết nối đến máy chủ"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Mật khẩu
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Đang đăng nhập..."
            : "Đăng nhập"}
        </button>

        <p>
          Chưa có tài khoản?{" "}
          <Link to="/register">
            Đăng ký
          </Link>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;