import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminStyles.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Global Colors & Sizes Attribute Modal state
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [attrTab, setAttrTab] = useState('colors'); // 'colors' | 'sizes'
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeSort, setNewSizeSort] = useState(1);

  const [formData, setFormData] = useState({
    ProductName: '',
    Description: '',
    BasePrice: 0,
    SalePrice: 0,
    Gender: 'UNISEX',
    CategoryId: '',
    Status: 'ACTIVE'
  });

  // State for multiple images: array of { id, ImageUrl, IsPrimary, ColorName, file, previewUrl }
  const [imagesList, setImagesList] = useState([]);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // State for Product Variants (Màu sắc x Kích thước)
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState([]);
  const [variantsList, setVariantsList] = useState([]); // array of { ColorId, SizeId, ColorName, SizeName, SKU, StockQuantity, AdditionalPrice, IsActive }
  const [bulkStockValue, setBulkStockValue] = useState(50);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, colorRes, sizeRes] = await Promise.all([
        axiosClient.get('/products?limit=100'),
        axiosClient.get('/categories'),
        axiosClient.get('/attributes/colors'),
        axiosClient.get('/attributes/sizes')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.data || []);
      setAvailableColors(colorRes.data || []);
      setAvailableSizes(sizeRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu sản phẩm/danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- ATTRIBUTE MANAGEMENT (COLOR & SIZE) ---
  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    try {
      await axiosClient.post('/attributes/colors', {
        ColorName: newColorName.trim(),
        HexCode: newColorHex
      });
      setNewColorName('');
      const res = await axiosClient.get('/attributes/colors');
      setAvailableColors(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thêm màu');
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (!window.confirm('Xóa màu sắc này?')) return;
    try {
      await axiosClient.delete(`/attributes/colors/${colorId}`);
      const res = await axiosClient.get('/attributes/colors');
      setAvailableColors(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa màu');
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;
    try {
      await axiosClient.post('/attributes/sizes', {
        SizeName: newSizeName.trim().toUpperCase(),
        SortOrder: parseInt(newSizeSort) || 0
      });
      setNewSizeName('');
      const res = await axiosClient.get('/attributes/sizes');
      setAvailableSizes(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thêm kích thước');
    }
  };

  const handleDeleteSize = async (sizeId) => {
    if (!window.confirm('Xóa kích thước này?')) return;
    try {
      await axiosClient.delete(`/attributes/sizes/${sizeId}`);
      const res = await axiosClient.get('/attributes/sizes');
      setAvailableSizes(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa kích thước');
    }
  };

  // --- IMAGE MANAGEMENT ---
  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random()}`,
      ImageUrl: '',
      previewUrl: URL.createObjectURL(file),
      file: file,
      IsPrimary: imagesList.length === 0 && idx === 0,
      ColorName: availableColors.length > 0 ? availableColors[0].ColorName : 'Mặc định'
    }));

    setImagesList(prev => [...prev, ...newItems]);
    e.target.value = null;
  };

  const handleAddUrlImage = () => {
    if (!customUrlInput.trim()) return;
    const newItem = {
      id: `url-${Date.now()}-${Math.random()}`,
      ImageUrl: customUrlInput.trim(),
      previewUrl: customUrlInput.trim(),
      file: null,
      IsPrimary: imagesList.length === 0,
      ColorName: availableColors.length > 0 ? availableColors[0].ColorName : 'Mặc định'
    };
    setImagesList(prev => [...prev, newItem]);
    setCustomUrlInput('');
  };

  const handleSetPrimaryImage = (targetId) => {
    setImagesList(prev =>
      prev.map(img => ({
        ...img,
        IsPrimary: img.id === targetId
      }))
    );
  };

  const handleImageColorChange = (targetId, colorName) => {
    setImagesList(prev =>
      prev.map(img => (img.id === targetId ? { ...img, ColorName: colorName } : img))
    );
  };

  const handleRemoveImage = (targetId) => {
    setImagesList(prev => {
      const filtered = prev.filter(img => img.id !== targetId);
      if (filtered.length > 0 && !filtered.some(img => img.IsPrimary)) {
        filtered[0].IsPrimary = true;
      }
      return filtered;
    });
  };

  // --- PRODUCT VARIANT MATRIX CREATOR & MANAGEMENT ---
  const handleToggleColorSelect = (colorId) => {
    setSelectedColorIds(prev =>
      prev.includes(colorId) ? prev.filter(id => id !== colorId) : [...prev, colorId]
    );
  };

  const handleToggleSizeSelect = (sizeId) => {
    setSelectedSizeIds(prev =>
      prev.includes(sizeId) ? prev.filter(id => id !== sizeId) : [...prev, sizeId]
    );
  };

  const generateVariantSKU = (productName, colorName, sizeName) => {
    const cleanProd = (productName || 'PROD')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8);

    const cleanColor = (colorName || 'CLR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4);

    const cleanSize = (sizeName || 'SZ')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    return `${cleanProd}-${cleanColor}-${cleanSize}`;
  };

  // Build matrix of combinations from selected colors and sizes
  const handleGenerateVariantMatrix = () => {
    if (selectedColorIds.length === 0 || selectedSizeIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 Màu sắc và 1 Kích thước để tạo ma trận!');
      return;
    }

    const newVariants = [];
    selectedColorIds.forEach(cId => {
      const colorObj = availableColors.find(c => c.ColorId === cId);
      selectedSizeIds.forEach(sId => {
        const sizeObj = availableSizes.find(s => s.SizeId === sId);
        
        // Check if already exists in variantsList
        const existing = variantsList.find(v => v.ColorId === cId && v.SizeId === sId);
        if (existing) {
          newVariants.push(existing);
        } else {
          newVariants.push({
            VariantId: null,
            ColorId: cId,
            SizeId: sId,
            ColorName: colorObj ? colorObj.ColorName : 'Color',
            HexCode: colorObj ? colorObj.HexCode : null,
            SizeName: sizeObj ? sizeObj.SizeName : 'Size',
            SKU: generateVariantSKU(formData.ProductName, colorObj?.ColorName, sizeObj?.SizeName),
            StockQuantity: parseInt(bulkStockValue) || 20,
            AdditionalPrice: 0,
            IsActive: true
          });
        }
      });
    });

    setVariantsList(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    setVariantsList(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleToggleVariantStatus = (index) => {
    setVariantsList(prev =>
      prev.map((v, i) => (i === index ? { ...v, IsActive: !v.IsActive } : v))
    );
  };

  const handleRemoveVariant = (index) => {
    setVariantsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyBulkStock = () => {
    const val = parseInt(bulkStockValue) || 0;
    setVariantsList(prev => prev.map(v => ({ ...v, StockQuantity: val })));
  };

  // --- FORM ACTIONS ---
  const handleCreateNew = () => {
    setEditingId(null);
    setImagesList([]);
    setVariantsList([]);
    setSelectedColorIds([]);
    setSelectedSizeIds([]);
    setCustomUrlInput('');
    setFormData({
      ProductName: '',
      Description: '',
      BasePrice: 0,
      SalePrice: 0,
      Gender: 'UNISEX',
      CategoryId: categories.length > 0 ? categories[0].CategoryId : '',
      Status: 'ACTIVE'
    });
    setShowForm(true);
  };

  const handleEdit = (prod) => {
    setEditingId(prod.ProductId);
    setCustomUrlInput('');
    setFormData({
      ProductName: prod.ProductName,
      Description: prod.Description || '',
      BasePrice: prod.BasePrice,
      SalePrice: prod.SalePrice || 0,
      Gender: prod.Gender,
      CategoryId: prod.CategoryId || '',
      Status: prod.Status
    });

    if (prod.Images && prod.Images.length > 0) {
      setImagesList(
        prod.Images.map((img, idx) => ({
          id: `existing-${img.ImageId || idx}`,
          ImageUrl: img.ImageUrl,
          previewUrl: img.ImageUrl,
          file: null,
          IsPrimary: !!img.IsPrimary,
          ColorName: img.ColorName || (availableColors[0]?.ColorName || 'Mặc định')
        }))
      );
    } else {
      setImagesList([]);
    }

    if (prod.Variants && prod.Variants.length > 0) {
      setVariantsList(
        prod.Variants.map(v => ({
          VariantId: v.VariantId,
          ColorId: v.ColorId,
          SizeId: v.SizeId,
          ColorName: v.Color?.ColorName || 'Color',
          HexCode: v.Color?.HexCode || null,
          SizeName: v.Size?.SizeName || 'Size',
          SKU: v.SKU,
          StockQuantity: v.StockQuantity,
          AdditionalPrice: v.AdditionalPrice,
          IsActive: v.IsActive !== false
        }))
      );
      setSelectedColorIds([...new Set(prod.Variants.map(v => v.ColorId))]);
      setSelectedSizeIds([...new Set(prod.Variants.map(v => v.SizeId))]);
    } else {
      setVariantsList([]);
      setSelectedColorIds([]);
      setSelectedSizeIds([]);
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm sẽ xóa toàn bộ biến thể và bộ ảnh của sản phẩm. Bạn có chắc chứ?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      // Upload image files if selected from PC
      const uploadedImages = [];
      for (let i = 0; i < imagesList.length; i++) {
        const item = imagesList[i];
        let finalUrl = item.ImageUrl;

        if (item.file) {
          const formDataUpload = new FormData();
          formDataUpload.append('image', item.file);

          const uploadRes = await axiosClient.post('/upload', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            finalUrl = uploadRes.data.data.url;
          }
        }

        if (finalUrl) {
          uploadedImages.push({
            ImageUrl: finalUrl,
            IsPrimary: item.IsPrimary,
            SortOrder: i + 1,
            ColorName: item.ColorName === 'Mặc định' ? null : item.ColorName
          });
        }
      }

      if (uploadedImages.length > 0 && !uploadedImages.some(img => img.IsPrimary)) {
        uploadedImages[0].IsPrimary = true;
      }

      // Format Variants Payload
      const formattedVariants = variantsList.map(v => ({
        ColorId: v.ColorId,
        SizeId: v.SizeId,
        SKU: v.SKU.trim(),
        StockQuantity: parseInt(v.StockQuantity) || 0,
        AdditionalPrice: parseFloat(v.AdditionalPrice) || 0,
        IsActive: v.IsActive !== false
      }));

      const payload = {
        ...formData,
        BasePrice: parseFloat(formData.BasePrice),
        SalePrice: parseFloat(formData.SalePrice) || null,
        CategoryId: parseInt(formData.CategoryId),
        Images: uploadedImages,
        Variants: formattedVariants
      };

      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, payload);
      } else {
        await axiosClient.post('/products', payload);
      }

      setShowForm(false);
      setImagesList([]);
      setVariantsList([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi xử lý, vui lòng kiểm tra lại mã SKU hoặc dữ liệu nhập');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Sản phẩm & Biến thể</h1>
          <p className="admin-subtitle" style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Quản lý kho hàng, tạo ma trận biến thể (Màu sắc x Kích thước S/M/L/XL), SKU, số lượng tồn kho & giá riêng.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn secondary" onClick={() => setShowAttrModal(true)}>
            🎨 Quản lý Màu sắc & Kích thước
          </button>

          {!showForm && (
            <button className="admin-btn primary" onClick={handleCreateNew}>
              + Thêm Sản phẩm mới
            </button>
          )}
        </div>
      </div>

      {/* FORM SẢN PHẨM & QUẢN LÝ BIẾN THỂ */}
      {showForm ? (
        <div className="admin-card form-card-wide">
          <div className="form-card-header">
            <h2>{editingId ? `Chỉnh sửa Sản phẩm #${editingId}` : 'Thêm Sản phẩm mới'}</h2>
            <button type="button" className="text-btn" onClick={() => setShowForm(false)}>✕ Đóng</button>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            {/* THÔNG TIN CƠ BẢN */}
            <div className="form-section-box">
              <h3 className="section-title">1. Thông tin cơ bản</h3>

              <div className="form-group">
                <label>Tên Sản phẩm (*)</label>
                <input type="text" name="ProductName" value={formData.ProductName} onChange={handleInputChange} required placeholder="Ví dụ: Áo Polo nam TORANO ESTP038" />
              </div>
              
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Giá gốc (VNĐ) (*)</label>
                  <input type="number" name="BasePrice" value={formData.BasePrice} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Giá khuyến mãi (VNĐ)</label>
                  <input type="number" name="SalePrice" value={formData.SalePrice} onChange={handleInputChange} min="0" placeholder="Để 0 nếu không giảm" />
                </div>
                <div className="form-group">
                  <label>Danh mục (*)</label>
                  <select name="CategoryId" value={formData.CategoryId} onChange={handleInputChange} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Giới tính / Dòng sản phẩm</label>
                  <select name="Gender" value={formData.Gender} onChange={handleInputChange}>
                    <option value="UNISEX">Unisex (Nam & Nữ)</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="KIDS">Trẻ em</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái sản phẩm</label>
                  <select name="Status" value={formData.Status} onChange={handleInputChange}>
                    <option value="ACTIVE">🟢 Đang bán</option>
                    <option value="HIDDEN">🔴 Ẩn sản phẩm</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả sản phẩm</label>
                <textarea name="Description" value={formData.Description} onChange={handleInputChange} rows={3} placeholder="Nhập mô tả chi tiết chất liệu, phom dáng, hướng dẫn bảo quản..." />
              </div>
            </div>

            {/* QUẢN LÝ BỘ ẢNH NHIỀU MÀU SẮC */}
            <div className="form-section-box">
              <h3 className="section-title">2. Bộ ảnh sản phẩm theo Màu sắc</h3>
              
              <div className="image-upload-tools">
                <label className="upload-btn-label">
                  📷 Chọn ảnh từ máy tính (Nhiều ảnh)
                  <input type="file" accept="image/*" multiple onChange={handleFilesSelect} hidden />
                </label>

                <div className="url-input-wrap">
                  <input
                    type="url"
                    placeholder="Hoặc dán link ảnh (URL)..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                  />
                  <button type="button" className="admin-btn secondary small" onClick={handleAddUrlImage}>
                    + Thêm URL
                  </button>
                </div>
              </div>

              <div className="images-grid">
                {imagesList.map((img, idx) => (
                  <div key={img.id} className={`image-card-item ${img.IsPrimary ? 'is-primary' : ''}`}>
                    <div className="image-preview-wrapper">
                      <img src={img.previewUrl} alt={`Preview ${idx + 1}`} />
                      {img.IsPrimary && <span className="primary-badge">Ảnh chính</span>}
                    </div>

                    <div className="image-card-controls">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="primaryImageRadio"
                          checked={img.IsPrimary}
                          onChange={() => handleSetPrimaryImage(img.id)}
                        />
                        <span>Ảnh hiển thị chính</span>
                      </label>

                      <div className="control-row">
                        <label>Gán màu sắc ảnh:</label>
                        <select
                          value={img.ColorName}
                          onChange={(e) => handleImageColorChange(img.id, e.target.value)}
                        >
                          {availableColors.map((c) => (
                            <option key={c.ColorId} value={c.ColorName}>
                              {c.ColorName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button type="button" className="remove-img-btn" onClick={() => handleRemoveImage(img.id)}>
                        🗑 Xóa ảnh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {imagesList.length === 0 && <p className="no-images-hint">Chưa có ảnh nào. Vui lòng tải ảnh lên hoặc thêm URL ảnh.</p>}
            </div>

            {/* QUẢN LÝ BIẾN THỂ VÀ TỒN KHO (MÀU SẮC x KÍCH THƯỚC) */}
            <div className="form-section-box variant-matrix-section">
              <div className="section-header-flex">
                <h3 className="section-title">3. Quản lý Biến thể (Màu sắc x Kích thước S/M/L/XL & Tồn kho)</h3>
                <span className="variant-count-badge">Tổng biến thể: {variantsList.length}</span>
              </div>

              {/* MATRIX BUILDER SELECTORS */}
              <div className="matrix-builder-container">
                <div className="attr-selector-group">
                  <h4>a. Chọn Màu sắc áp dụng:</h4>
                  <div className="checkbox-tags-wrap">
                    {availableColors.map(color => {
                      const isChecked = selectedColorIds.includes(color.ColorId);
                      return (
                        <label key={color.ColorId} className={`attr-tag-btn ${isChecked ? 'selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColorSelect(color.ColorId)}
                          />
                          {color.HexCode && <span className="color-dot-inline" style={{ backgroundColor: color.HexCode }}></span>}
                          {color.ColorName}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="attr-selector-group" style={{ marginTop: '1rem' }}>
                  <h4>b. Chọn Kích thước áp dụng (S, M, L, XL...):</h4>
                  <div className="checkbox-tags-wrap">
                    {availableSizes.map(size => {
                      const isChecked = selectedSizeIds.includes(size.SizeId);
                      return (
                        <label key={size.SizeId} className={`attr-tag-btn ${isChecked ? 'selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSizeSelect(size.SizeId)}
                          />
                          Size {size.SizeName}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="matrix-action-bar">
                  <button type="button" className="admin-btn primary" onClick={handleGenerateVariantMatrix}>
                    ⚡ Tạo / Cập nhật Ma trận biến thể ({selectedColorIds.length} màu × {selectedSizeIds.length} size)
                  </button>

                  <div className="bulk-stock-setter">
                    <span>Số tồn mặc định:</span>
                    <input
                      type="number"
                      min="0"
                      value={bulkStockValue}
                      onChange={(e) => setBulkStockValue(e.target.value)}
                      style={{ width: '80px' }}
                    />
                    <button type="button" className="admin-btn secondary small" onClick={handleApplyBulkStock}>
                      Áp dụng cho tất cả
                    </button>
                  </div>
                </div>
              </div>

              {/* BẢNG DANH SÁCH BIẾN THỂ */}
              {variantsList.length > 0 ? (
                <div className="table-responsive">
                  <table className="variant-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Biến thể</th>
                        <th>Mã SKU (*)</th>
                        <th>Số lượng tồn (*</th>
                        <th>Giá phụ thu (+VNĐ)</th>
                        <th>Trạng thái bán</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsList.map((v, idx) => (
                        <tr key={idx} className={!v.IsActive ? 'variant-disabled' : ''}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="variant-label-badge">
                              {v.HexCode && <span className="color-dot-inline" style={{ backgroundColor: v.HexCode }}></span>}
                              <strong>{v.ColorName}</strong> / <span className="size-badge">Size {v.SizeName}</span>
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="sku-input"
                              value={v.SKU}
                              onChange={(e) => handleVariantChange(idx, 'SKU', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="stock-input"
                              min="0"
                              value={v.StockQuantity}
                              onChange={(e) => handleVariantChange(idx, 'StockQuantity', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="price-input"
                              min="0"
                              value={v.AdditionalPrice}
                              onChange={(e) => handleVariantChange(idx, 'AdditionalPrice', e.target.value)}
                              placeholder="+0"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-btn ${v.IsActive ? 'active' : 'inactive'}`}
                              onClick={() => handleToggleVariantStatus(idx)}
                            >
                              {v.IsActive ? '🟢 Đang bán' : '🔴 Ngừng bán / Ẩn'}
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="text-btn delete"
                              onClick={() => handleRemoveVariant(idx)}
                            >
                              🗑 Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-variants-hint">
                  Chưa có biến thể nào. Hãy chọn các Màu sắc và Size ở trên rồi bấm <strong>"⚡ Tạo ma trận biến thể"</strong>.
                </p>
              )}
            </div>

            <div className="form-actions sticky-actions">
              <button type="submit" className="admin-btn primary large" disabled={uploading}>
                {uploading ? '⏳ Đang lưu dữ liệu & Tải ảnh...' : '💾 Lưu Sản phẩm & Bộ biến thể'}
              </button>
              <button type="button" className="admin-btn secondary large" onClick={() => setShowForm(false)}>
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* TABLE SẢN PHẨM */
        <div className="admin-table-container">
          {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Đang tải danh sách sản phẩm...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>ID</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Danh mục</th>
                  <th>Ảnh màu</th>
                  <th>Số biến thể / Tồn kho</th>
                  <th>Giá (VNĐ)</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const totalStock = prod.Variants ? prod.Variants.reduce((sum, v) => sum + (v.StockQuantity || 0), 0) : 0;
                  const variantCount = prod.Variants ? prod.Variants.length : 0;

                  return (
                    <tr key={prod.ProductId}>
                      <td>
                        {prod.Images && prod.Images.length > 0 ? (
                          <img src={prod.Images[0].ImageUrl} alt="Product" className="product-table-thumb" />
                        ) : (
                          <div className="product-table-thumb-placeholder"></div>
                        )}
                      </td>
                      <td>#{prod.ProductId}</td>
                      <td>
                        <strong>{prod.ProductName}</strong>
                        <br/>
                        <small style={{ color: '#6b7280' }}>Slug: {prod.Slug}</small>
                      </td>
                      <td>{prod.Category?.CategoryName || 'Chưa phân loại'}</td>
                      <td>
                        <span className="badge-count">
                          📷 {prod.Images ? prod.Images.length : 0} ảnh
                        </span>
                      </td>
                      <td>
                        {variantCount > 0 ? (
                          <div>
                            <span className="variant-tag-badge">🧩 {variantCount} biến thể</span>
                            <br/>
                            <small style={{ color: totalStock > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                              Tồn: {totalStock} cái
                            </small>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Chưa tạo biến thể</span>
                        )}
                      </td>
                      <td>
                        {prod.SalePrice ? (
                          <span>
                            <s style={{ color: 'grey', fontSize: '0.8rem' }}>{prod.BasePrice?.toLocaleString()}₫</s> <br/> 
                            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{prod.SalePrice?.toLocaleString()}₫</span>
                          </span>
                        ) : (
                          <strong>{prod.BasePrice?.toLocaleString()}₫</strong>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${prod.Status.toLowerCase()}`}>
                          {prod.Status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="text-btn edit" onClick={() => handleEdit(prod)}>✏ Sửa & Biến thể</button>
                        <button className="text-btn delete" onClick={() => handleDelete(prod.ProductId)}>🗑 Xóa</button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="9" className="empty-message">Chưa có sản phẩm nào trong hệ thống.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL QUẢN LÝ MÀU SẮC VÀ KÍCH THƯỚC SYSTEM ATTRIBUTES */}
      {showAttrModal && (
        <div className="modal-overlay">
          <div className="modal-container medium">
            <div className="modal-header">
              <h2>🎨 Quản lý Hệ thống Màu sắc & Kích thước</h2>
              <button className="modal-close-btn" onClick={() => setShowAttrModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-tabs">
                <button
                  className={`tab-btn ${attrTab === 'colors' ? 'active' : ''}`}
                  onClick={() => setAttrTab('colors')}
                >
                  Màu sắc ({availableColors.length})
                </button>
                <button
                  className={`tab-btn ${attrTab === 'sizes' ? 'active' : ''}`}
                  onClick={() => setAttrTab('sizes')}
                >
                  Kích thước ({availableSizes.length})
                </button>
              </div>

              {attrTab === 'colors' ? (
                <div>
                  <form className="inline-add-form" onSubmit={handleAddColor}>
                    <input
                      type="text"
                      placeholder="Tên màu mới (e.g. Xanh rêu)..."
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      required
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      title="Chọn mã màu"
                    />
                    <button type="submit" className="admin-btn primary small">+ Thêm Màu</button>
                  </form>

                  <div className="attr-list-grid">
                    {availableColors.map(color => (
                      <div key={color.ColorId} className="attr-item-card">
                        <div className="attr-info">
                          <span className="color-swatch-box" style={{ backgroundColor: color.HexCode || '#ccc' }}></span>
                          <strong>{color.ColorName}</strong>
                          <span className="hex-code-text">{color.HexCode || '#N/A'}</span>
                        </div>
                        <button className="text-btn delete" onClick={() => handleDeleteColor(color.ColorId)}>Xóa</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <form className="inline-add-form" onSubmit={handleAddSize}>
                    <input
                      type="text"
                      placeholder="Tên Size (e.g. 4XL)..."
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Thứ tự"
                      value={newSizeSort}
                      onChange={(e) => setNewSizeSort(e.target.value)}
                      style={{ width: '80px' }}
                    />
                    <button type="submit" className="admin-btn primary small">+ Thêm Size</button>
                  </form>

                  <div className="attr-list-grid">
                    {availableSizes.map(size => (
                      <div key={size.SizeId} className="attr-item-card">
                        <div className="attr-info">
                          <span className="size-label-box">{size.SizeName}</span>
                          <span className="sort-text">Thứ tự: {size.SortOrder}</span>
                        </div>
                        <button className="text-btn delete" onClick={() => handleDeleteSize(size.SizeId)}>Xóa</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowAttrModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
