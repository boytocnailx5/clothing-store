import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminStyles.css';

function AdminInventory() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'LOGS'
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    lowStockLimit: 10
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [thresholdInput, setThresholdInput] = useState(10);

  // Manual Adjust Modal state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newStockInput, setNewStockInput] = useState(0);
  const [adjustNoteInput, setAdjustNoteInput] = useState('Kiểm kê kho');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      if (activeTab === 'LOGS') {
        const res = await axiosClient.get('/inventory/logs?limit=50');
        setLogs(res.data.logs || []);
      } else {
        const res = await axiosClient.get(`/inventory/overview?filter=${activeTab}&search=${encodeURIComponent(searchTerm)}&threshold=${thresholdInput}`);
        setProducts(res.data.products || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeTab, thresholdInput]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  // Open Adjust Modal
  const handleOpenAdjustModal = (variant, prodName) => {
    setSelectedVariant({ ...variant, prodName });
    setNewStockInput(variant.StockQuantity);
    setAdjustNoteInput('Kiểm kê điều chỉnh kho thủ công');
  };

  // Submit Manual Stock Adjustment
  const handleSaveStockAdjust = async (e) => {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      setAdjusting(true);
      await axiosClient.put(`/inventory/variants/${selectedVariant.VariantId}/stock`, {
        newQuantity: parseInt(newStockInput),
        note: adjustNoteInput.trim()
      });
      setSelectedVariant(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi cập nhật số lượng tồn kho');
    } finally {
      setAdjusting(false);
    }
  };

  const getLogTypeBadge = (type) => {
    switch (type) {
      case 'MANUAL_UPDATE':
        return <span className="badge-type manual">📝 Cập nhật thủ công</span>;
      case 'ORDER_DEDUCT':
        return <span className="badge-type deduct">🛒 Trừ đơn hàng</span>;
      case 'ORDER_RESTORE':
        return <span className="badge-type restore">🔄 Cộng hoàn đơn</span>;
      default:
        return <span className="badge-type default">⚙ Hệ thống</span>;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Tồn kho</h1>
          <p className="admin-subtitle" style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Theo dõi tồn kho theo Màu sắc & Size, cảnh báo sản phẩm sắp hết hàng & lịch sử biến động tự động.
          </p>
        </div>

        <div className="threshold-setting">
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
            ⚠️ Ngưỡng cảnh báo sắp hết:
          </label>
          <select
            value={thresholdInput}
            onChange={(e) => setThresholdInput(parseInt(e.target.value))}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #d1d5db', fontWeight: 600 }}
          >
            <option value={5}>Dưới 5 sản phẩm</option>
            <option value={10}>Dưới 10 sản phẩm</option>
            <option value={20}>Dưới 20 sản phẩm</option>
          </select>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalStockItems?.toLocaleString()}</div>
            <div className="stat-label">Tổng tồn kho (Sản phẩm)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>👕</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Số mẫu sản phẩm</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('LOW_STOCK')}>
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>⚠️</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#d97706' }}>{stats.lowStockCount}</div>
            <div className="stat-label">Biến thể sắp hết hàng</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('OUT_OF_STOCK')}>
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>🔴</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#dc2626' }}>{stats.outOfStockCount}</div>
            <div className="stat-label">Biến thể đã hết hàng</div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="inventory-controls-bar">
        <div className="modal-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả sản phẩm
          </button>
          <button
            className={`tab-btn ${activeTab === 'LOW_STOCK' ? 'active' : ''}`}
            onClick={() => setActiveTab('LOW_STOCK')}
          >
            ⚠️ Sắp hết hàng ({stats.lowStockCount})
          </button>
          <button
            className={`tab-btn ${activeTab === 'OUT_OF_STOCK' ? 'active' : ''}`}
            onClick={() => setActiveTab('OUT_OF_STOCK')}
          >
            🔴 Hết hàng ({stats.outOfStockCount})
          </button>
          <button
            className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('LOGS')}
          >
            📜 Lịch sử biến động kho
          </button>
        </div>

        {activeTab !== 'LOGS' && (
          <form className="inventory-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="admin-btn secondary small">Tìm kiếm</button>
          </form>
        )}
      </div>

      {/* INVENTORY TABLE OR LOGS TABLE */}
      {activeTab === 'LOGS' ? (
        /* LỊCH SỬ BIẾN ĐỘNG KHO TABLE */
        <div className="admin-table-container">
          {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Đang tải lịch sử kho...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Log</th>
                  <th>Thời gian</th>
                  <th>Sản phẩm / Biến thể</th>
                  <th>Mã SKU</th>
                  <th>Số lượng thay đổi</th>
                  <th>Biến động (Cũ ➔ Mới)</th>
                  <th>Loại biến động</th>
                  <th>Ghi chú / Lý do</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.LogId}>
                    <td>#{log.LogId}</td>
                    <td>
                      <small style={{ color: '#4b5563' }}>
                        {new Date(log.CreatedAt).toLocaleString('vi-VN')}
                      </small>
                    </td>
                    <td>
                      <strong>{log.Product?.ProductName || 'Sản phẩm đã bị xóa'}</strong>
                      {log.Variant && (
                        <div>
                          <small style={{ color: '#6b7280' }}>
                            {log.Variant.Color?.ColorName} / Size {log.Variant.Size?.SizeName}
                          </small>
                        </div>
                      )}
                    </td>
                    <td><code>{log.Variant?.SKU || 'N/A'}</code></td>
                    <td>
                      <strong style={{ color: log.ChangeQuantity > 0 ? '#059669' : '#dc2626', fontSize: '1rem' }}>
                        {log.ChangeQuantity > 0 ? `+${log.ChangeQuantity}` : log.ChangeQuantity}
                      </strong>
                    </td>
                    <td>
                      <span className="stock-change-pill">
                        {log.OldQuantity} ➔ <strong>{log.NewQuantity}</strong>
                      </span>
                    </td>
                    <td>{getLogTypeBadge(log.Type)}</td>
                    <td><small>{log.Note || '-'}</small></td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-message">Chưa có lịch sử biến động kho nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* DANH SÁCH TỒN KHO THEO MÀU & SIZE TABLE */
        <div className="inventory-products-list">
          {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Đang tải tồn kho...</p> : (
            <div>
              {products.map((prod) => (
                <div key={prod.ProductId} className="inventory-product-card">
                  <div className="inv-prod-header">
                    <div className="inv-prod-info">
                      {prod.PrimaryImage ? (
                        <img src={prod.PrimaryImage} alt={prod.ProductName} className="inv-prod-thumb" />
                      ) : (
                        <div className="inv-prod-thumb-placeholder"></div>
                      )}
                      <div>
                        <h3 className="inv-prod-name">{prod.ProductName}</h3>
                        <div className="inv-prod-meta">
                          <span>ID: #{prod.ProductId}</span>
                          <span>•</span>
                          <span>Giá: <strong>{prod.BasePrice?.toLocaleString()}₫</strong></span>
                          <span>•</span>
                          <span>Tổng tồn: <strong style={{ color: prod.TotalStock > 0 ? '#059669' : '#dc2626' }}>{prod.TotalStock} cái</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="inv-prod-badges">
                      {prod.IsOutOfStock && <span className="status-badge hidden">🔴 HẾT HÀNG TOÀN BỘ</span>}
                      {prod.HasLowStock && !prod.IsOutOfStock && <span className="badge-warning-inv">⚠️ CÓ BIẾN THỂ SẮP HẾT</span>}
                    </div>
                  </div>

                  {/* VARIANT BREAKDOWN TABLE */}
                  <div className="table-responsive">
                    <table className="variant-inventory-table">
                      <thead>
                        <tr>
                          <th>Màu sắc</th>
                          <th>Kích thước</th>
                          <th>Mã SKU</th>
                          <th>Số lượng tồn kho</th>
                          <th>Trạng thái tồn</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prod.Variants.map((v) => (
                          <tr key={v.VariantId} className={v.IsOutOfStock ? 'row-out-of-stock' : v.IsLowStock ? 'row-low-stock' : ''}>
                            <td>
                              <div className="variant-label-badge">
                                {v.HexCode && <span className="color-dot-inline" style={{ backgroundColor: v.HexCode }}></span>}
                                <strong>{v.ColorName}</strong>
                              </div>
                            </td>
                            <td><span className="size-badge">Size {v.SizeName}</span></td>
                            <td><code>{v.SKU}</code></td>
                            <td>
                              <span className="stock-quantity-display">
                                {v.StockQuantity} cái
                              </span>
                            </td>
                            <td>
                              {v.IsOutOfStock ? (
                                <span className="stock-status-badge out">🔴 Hết hàng (0)</span>
                              ) : v.IsLowStock ? (
                                <span className="stock-status-badge low">⚠️ Sắp hết ({v.StockQuantity})</span>
                              ) : (
                                <span className="stock-status-badge normal">🟢 Còn hàng</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="admin-btn secondary small"
                                onClick={() => handleOpenAdjustModal(v, prod.ProductName)}
                              >
                                ✏ Điều chỉnh tồn kho
                              </button>
                            </td>
                          </tr>
                        ))}
                        {prod.Variants.length === 0 && (
                          <tr>
                            <td colSpan="6" className="empty-message">Sản phẩm này chưa được tạo biến thể kho.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="admin-card text-center" style={{ padding: '3rem' }}>
                  <p className="no-images-hint">Không tìm thấy sản phẩm nào khớp với điều kiện lọc.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL CẬP NHẬT TỒN KHO THỦ CÔNG */}
      {selectedVariant && (
        <div className="modal-overlay">
          <div className="modal-container small">
            <div className="modal-header">
              <h2>✏ Cập nhật tồn kho thủ công</h2>
              <button className="modal-close-btn" onClick={() => setSelectedVariant(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveStockAdjust}>
              <div className="modal-body">
                <div className="adjust-info-box">
                  <p>Sản phẩm: <strong>{selectedVariant.prodName}</strong></p>
                  <p>Biến thể: <strong>{selectedVariant.ColorName} / Size {selectedVariant.SizeName}</strong> (SKU: <code>{selectedVariant.SKU}</code>)</p>
                  <p>Tồn kho hiện tại: <strong style={{ color: '#2563eb' }}>{selectedVariant.StockQuantity} cái</strong></p>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Số lượng tồn kho mới (*)</label>
                  <input
                    type="number"
                    min="0"
                    value={newStockInput}
                    onChange={(e) => setNewStockInput(e.target.value)}
                    required
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                </div>

                <div className="form-group">
                  <label>Lý do / Ghi chú điều chỉnh (*)</label>
                  <select
                    value={adjustNoteInput}
                    onChange={(e) => setAdjustNoteInput(e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <option value="Kiểm kê điều chỉnh kho thủ công">Kiểm kê kho định kỳ</option>
                    <option value="Nhập hàng bổ sung">Nhập hàng bổ sung</option>
                    <option value="Hàng lỗi / Hỏng cần xuất kho">Hàng lỗi / Hỏng / Thất thoát</option>
                    <option value="Khác (Tự nhập bên dưới)">Lý do khác...</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm..."
                    value={adjustNoteInput}
                    onChange={(e) => setAdjustNoteInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="admin-btn primary" disabled={adjusting}>
                  {adjusting ? 'Đang lưu...' : '💾 Lưu số tồn mới'}
                </button>
                <button type="button" className="admin-btn secondary" onClick={() => setSelectedVariant(null)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
