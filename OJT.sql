/* =====================================================
   DATABASE: CLOTHING STORE
   SQL SERVER
   ===================================================== */

IF DB_ID(N'clothing_store') IS NULL
BEGIN
    CREATE DATABASE clothing_store;
END
GO

USE clothing_store;
GO

/* =====================================================
   1. USERS
   Role chỉ có CUSTOMER và ADMIN
   ===================================================== */

CREATE TABLE Users
(
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Phone VARCHAR(20) NULL,
    PasswordHash VARCHAR(255) NOT NULL,

    Role VARCHAR(20) NOT NULL
        CONSTRAINT DF_Users_Role DEFAULT 'CUSTOMER',

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Users_Status DEFAULT 'ACTIVE',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT CK_Users_Role
        CHECK (Role IN ('CUSTOMER', 'ADMIN')),

    CONSTRAINT CK_Users_Status
        CHECK (Status IN ('ACTIVE', 'BLOCKED'))
);
GO

/* =====================================================
   2. ADDRESSES
   ===================================================== */

CREATE TABLE Addresses
(
    AddressId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,

    ReceiverName NVARCHAR(100) NOT NULL,
    ReceiverPhone VARCHAR(20) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NOT NULL,
    Ward NVARCHAR(100) NOT NULL,
    AddressDetail NVARCHAR(255) NOT NULL,

    IsDefault BIT NOT NULL
        CONSTRAINT DF_Addresses_IsDefault DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Addresses_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Addresses_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
        ON DELETE CASCADE
);
GO

/* =====================================================
   3. CATEGORIES
   ===================================================== */

CREATE TABLE Categories
(
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    ParentId INT NULL,

    CategoryName NVARCHAR(100) NOT NULL,
    Slug VARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,

    IsActive BIT NOT NULL
        CONSTRAINT DF_Categories_IsActive DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Categories_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Categories_Parent
        FOREIGN KEY (ParentId)
        REFERENCES Categories(CategoryId)
);
GO

/* =====================================================
   4. PRODUCTS
   ===================================================== */

CREATE TABLE Products
(
    ProductId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,

    ProductName NVARCHAR(200) NOT NULL,
    Slug VARCHAR(250) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,

    BasePrice DECIMAL(18,2) NOT NULL,
    SalePrice DECIMAL(18,2) NULL,

    Gender VARCHAR(20) NOT NULL
        CONSTRAINT DF_Products_Gender DEFAULT 'UNISEX',

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Products_Status DEFAULT 'ACTIVE',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Products_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Products_Categories
        FOREIGN KEY (CategoryId)
        REFERENCES Categories(CategoryId),

    CONSTRAINT CK_Products_Gender
        CHECK (Gender IN ('MALE', 'FEMALE', 'UNISEX', 'KIDS')),

    CONSTRAINT CK_Products_Status
        CHECK (Status IN ('ACTIVE', 'HIDDEN')),

    CONSTRAINT CK_Products_BasePrice
        CHECK (BasePrice >= 0),

    CONSTRAINT CK_Products_SalePrice
        CHECK (SalePrice IS NULL OR SalePrice >= 0)
);
GO

/* =====================================================
   5. PRODUCT IMAGES
   ===================================================== */

CREATE TABLE ProductImages
(
    ImageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL,

    ImageUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT NOT NULL
        CONSTRAINT DF_ProductImages_IsPrimary DEFAULT 0,

    SortOrder INT NOT NULL
        CONSTRAINT DF_ProductImages_SortOrder DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ProductImages_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ProductImages_Products
        FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId)
        ON DELETE CASCADE
);
GO

/* =====================================================
   6. SIZES
   ===================================================== */

CREATE TABLE Sizes
(
    SizeId INT IDENTITY(1,1) PRIMARY KEY,
    SizeName NVARCHAR(30) NOT NULL UNIQUE,
    SortOrder INT NOT NULL
        CONSTRAINT DF_Sizes_SortOrder DEFAULT 0
);
GO

/* =====================================================
   7. COLORS
   ===================================================== */

CREATE TABLE Colors
(
    ColorId INT IDENTITY(1,1) PRIMARY KEY,
    ColorName NVARCHAR(50) NOT NULL UNIQUE,
    HexCode VARCHAR(10) NULL
);
GO

/* =====================================================
   8. PRODUCT VARIANTS
   Mỗi biến thể gồm sản phẩm + size + màu
   ===================================================== */

CREATE TABLE ProductVariants
(
    VariantId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL,
    SizeId INT NOT NULL,
    ColorId INT NOT NULL,

    SKU VARCHAR(100) NOT NULL UNIQUE,

    StockQuantity INT NOT NULL
        CONSTRAINT DF_ProductVariants_Stock DEFAULT 0,

    AdditionalPrice DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_ProductVariants_Price DEFAULT 0,

    IsActive BIT NOT NULL
        CONSTRAINT DF_ProductVariants_IsActive DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ProductVariants_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ProductVariants_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ProductVariants_Products
        FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ProductVariants_Sizes
        FOREIGN KEY (SizeId)
        REFERENCES Sizes(SizeId),

    CONSTRAINT FK_ProductVariants_Colors
        FOREIGN KEY (ColorId)
        REFERENCES Colors(ColorId),

    CONSTRAINT UQ_ProductVariants_Product_Size_Color
        UNIQUE (ProductId, SizeId, ColorId),

    CONSTRAINT CK_ProductVariants_Stock
        CHECK (StockQuantity >= 0)
);
GO

/* =====================================================
   9. CARTS
   Mỗi khách hàng có một giỏ hàng
   ===================================================== */

CREATE TABLE Carts
(
    CartId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL UNIQUE,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Carts_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Carts_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Carts_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
        ON DELETE CASCADE
);
GO

/* =====================================================
   10. CART ITEMS
   ===================================================== */

CREATE TABLE CartItems
(
    CartItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CartId BIGINT NOT NULL,
    VariantId BIGINT NOT NULL,

    Quantity INT NOT NULL
        CONSTRAINT DF_CartItems_Quantity DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_CartItems_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_CartItems_Carts
        FOREIGN KEY (CartId)
        REFERENCES Carts(CartId)
        ON DELETE CASCADE,

    CONSTRAINT FK_CartItems_ProductVariants
        FOREIGN KEY (VariantId)
        REFERENCES ProductVariants(VariantId),

    CONSTRAINT UQ_CartItems_Cart_Variant
        UNIQUE (CartId, VariantId),

    CONSTRAINT CK_CartItems_Quantity
        CHECK (Quantity > 0)
);
GO

/* =====================================================
   11. WISHLIST
   ===================================================== */

CREATE TABLE WishlistItems
(
    WishlistItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    ProductId BIGINT NOT NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_WishlistItems_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_WishlistItems_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_WishlistItems_Products
        FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_WishlistItems_User_Product
        UNIQUE (UserId, ProductId)
);
GO

/* =====================================================
   12. ORDERS
   Lưu địa chỉ dạng snapshot để không bị thay đổi
   ===================================================== */

CREATE TABLE Orders
(
    OrderId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,

    OrderCode VARCHAR(30) NOT NULL UNIQUE,

    OrderStatus VARCHAR(30) NOT NULL
        CONSTRAINT DF_Orders_Status DEFAULT 'PENDING',

    PaymentMethod VARCHAR(20) NOT NULL
        CONSTRAINT DF_Orders_PaymentMethod DEFAULT 'COD',

    PaymentStatus VARCHAR(20) NOT NULL
        CONSTRAINT DF_Orders_PaymentStatus DEFAULT 'UNPAID',

    Subtotal DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_Orders_Discount DEFAULT 0,

    ShippingFee DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_Orders_ShippingFee DEFAULT 0,

    TotalAmount DECIMAL(18,2) NOT NULL,

    ReceiverName NVARCHAR(100) NOT NULL,
    ReceiverPhone VARCHAR(20) NOT NULL,
    ShippingAddress NVARCHAR(500) NOT NULL,

    CustomerNote NVARCHAR(500) NULL,
    CancelReason NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Orders_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Orders_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT CK_Orders_Status
        CHECK
        (
            OrderStatus IN
            (
                'PENDING',
                'CONFIRMED',
                'SHIPPING',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    CONSTRAINT CK_Orders_PaymentMethod
        CHECK
        (
            PaymentMethod IN ('COD', 'BANKING', 'VNPAY')
        ),

    CONSTRAINT CK_Orders_PaymentStatus
        CHECK
        (
            PaymentStatus IN ('UNPAID', 'PAID', 'REFUNDED')
        )
);
GO

/* =====================================================
   13. ORDER ITEMS
   Lưu tên, SKU, size, màu tại thời điểm mua
   ===================================================== */

CREATE TABLE OrderItems
(
    OrderItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId BIGINT NOT NULL,
    VariantId BIGINT NULL,

    ProductName NVARCHAR(200) NOT NULL,
    SKU VARCHAR(100) NOT NULL,
    SizeName NVARCHAR(30) NOT NULL,
    ColorName NVARCHAR(50) NOT NULL,

    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    LineTotal DECIMAL(18,2) NOT NULL,

    CONSTRAINT FK_OrderItems_Orders
        FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId)
        ON DELETE CASCADE,

    CONSTRAINT FK_OrderItems_ProductVariants
        FOREIGN KEY (VariantId)
        REFERENCES ProductVariants(VariantId)
        ON DELETE SET NULL,

    CONSTRAINT CK_OrderItems_Quantity
        CHECK (Quantity > 0)
);
GO

/* =====================================================
   14. PAYMENTS
   ===================================================== */

CREATE TABLE Payments
(
    PaymentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId BIGINT NOT NULL,

    Amount DECIMAL(18,2) NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL,

    TransactionCode VARCHAR(100) NULL,
    PaidAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Payments_Orders
        FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId)
        ON DELETE CASCADE,

    CONSTRAINT CK_Payments_Method
        CHECK (PaymentMethod IN ('COD', 'BANKING', 'VNPAY')),

    CONSTRAINT CK_Payments_Status
        CHECK
        (
            PaymentStatus IN
            (
                'PENDING',
                'SUCCESS',
                'FAILED',
                'REFUNDED'
            )
        )
);
GO

/* =====================================================
   15. REVIEWS
   ===================================================== */

CREATE TABLE Reviews
(
    ReviewId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    ProductId BIGINT NOT NULL,

    Rating INT NOT NULL,
    Comment NVARCHAR(1000) NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Reviews_Status DEFAULT 'VISIBLE',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Reviews_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Reviews_UpdatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Reviews_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_Reviews_Products
        FOREIGN KEY (ProductId)
        REFERENCES Products(ProductId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_Reviews_User_Product
        UNIQUE (UserId, ProductId),

    CONSTRAINT CK_Reviews_Rating
        CHECK (Rating BETWEEN 1 AND 5),

    CONSTRAINT CK_Reviews_Status
        CHECK (Status IN ('VISIBLE', 'HIDDEN'))
);
GO

/* =====================================================
   INDEXES
   ===================================================== */

CREATE INDEX IX_Products_CategoryId
ON Products(CategoryId);
GO

CREATE INDEX IX_Products_ProductName
ON Products(ProductName);
GO

CREATE INDEX IX_Products_Status
ON Products(Status);
GO

CREATE INDEX IX_ProductVariants_ProductId
ON ProductVariants(ProductId);
GO

CREATE INDEX IX_Orders_UserId
ON Orders(UserId);
GO

CREATE INDEX IX_Orders_OrderStatus
ON Orders(OrderStatus);
GO

CREATE INDEX IX_Orders_CreatedAt
ON Orders(CreatedAt);
GO

/* =====================================================
   DỮ LIỆU KHỞI TẠO
   ===================================================== */

INSERT INTO Sizes (SizeName, SortOrder)
VALUES
    (N'ONE SIZE', 0),
    (N'S', 1),
    (N'M', 2),
    (N'L', 3),
    (N'XL', 4),
    (N'XXL', 5);
GO

INSERT INTO Colors (ColorName, HexCode)
VALUES
    (N'Mặc định', '#CCCCCC'),
    (N'Đen', '#000000'),
    (N'Trắng', '#FFFFFF'),
    (N'Đỏ', '#FF0000'),
    (N'Xanh dương', '#0000FF'),
    (N'Xám', '#808080'),
    (N'Be', '#F5F5DC');
GO

INSERT INTO Categories (CategoryName, Slug, Description)
VALUES
    (N'Áo thun', 'ao-thun', N'Các sản phẩm áo thun'),
    (N'Áo sơ mi', 'ao-so-mi', N'Các sản phẩm áo sơ mi'),
    (N'Áo khoác', 'ao-khoac', N'Các sản phẩm áo khoác'),
    (N'Quần jean', 'quan-jean', N'Các sản phẩm quần jean'),
    (N'Quần short', 'quan-short', N'Các sản phẩm quần short'),
    (N'Váy', 'vay', N'Các sản phẩm váy'),
    (N'Phụ kiện', 'phu-kien', N'Các sản phẩm phụ kiện');
GO

PRINT N'Tạo database clothing_store thành công.';
GO