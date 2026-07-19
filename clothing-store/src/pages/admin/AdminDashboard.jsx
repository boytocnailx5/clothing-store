import React from 'react';

function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-page-title">Bảng điều khiển</h1>
      <p>Tổng quan về cửa hàng StyleHub.</p>

      <div className="admin-dashboard-cards">
        <div className="admin-card">
          <h3>Tổng Doanh Thu Hàng Tháng</h3>
          <p className="stat">45.000.000₫</p>
        </div>
        <div className="admin-card">
          <h3>Sản Phẩm Đang Bán</h3>
          <p className="stat">128</p>
        </div>
        <div className="admin-card">
          <h3>Đơn Khách Hàng</h3>
          <p className="stat">42</p>
        </div>
        <div className="admin-card">
          <h3>Người Dùng</h3>
          <p className="stat">840</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
