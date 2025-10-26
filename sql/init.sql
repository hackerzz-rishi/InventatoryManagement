-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Area Master (For grouping customers/deliveries)
CREATE TABLE IF NOT EXISTS area_master (
    area_id VARCHAR(10) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Role Master
CREATE TABLE IF NOT EXISTS role_master (
    role_id VARCHAR(10) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Master
CREATE TABLE IF NOT EXISTS user_master (
    user_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id VARCHAR(10) NOT NULL,
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role_master(role_id)
);

-- Product Master
CREATE TABLE IF NOT EXISTS product_master (
    product_id VARCHAR(10) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    reorder_level DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer Master
CREATE TABLE IF NOT EXISTS customer_master (
    customer_id VARCHAR(10) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),
    area_id VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES area_master(area_id)
);

-- GST Master
CREATE TABLE IF NOT EXISTS gst_master (
    gst_id VARCHAR(10) PRIMARY KEY,
    gst_percentage DECIMAL(5,2) NOT NULL,
    description VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pricing Master
CREATE TABLE IF NOT EXISTS pricing_master (
    pricing_id VARCHAR(10) PRIMARY KEY,
    product_id VARCHAR(10) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    gst_id VARCHAR(10) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product_master(product_id),
    FOREIGN KEY (gst_id) REFERENCES gst_master(gst_id)
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
    sales_id VARCHAR(10) PRIMARY KEY,
    customer_id VARCHAR(10) NOT NULL,
    sale_date DATE NOT NULL,
    sale_type VARCHAR(20) NOT NULL, -- 'Instore' or 'Delivery'
    payment_mode VARCHAR(10), -- 'Cash', 'Online', 'UPI'
    total_amount DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    created_by VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_master(customer_id),
    FOREIGN KEY (created_by) REFERENCES user_master(user_id)
);

-- Sales Details
CREATE TABLE IF NOT EXISTS sales_details (
    sales_detail_id VARCHAR(10) PRIMARY KEY,
    sales_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(10) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    gst_percentage DECIMAL(5,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_id) REFERENCES sales(sales_id),
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
);

-- Purchase
CREATE TABLE IF NOT EXISTS purchase (
    purchase_id VARCHAR(10) PRIMARY KEY,
    supplier_id VARCHAR(10) NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    created_by VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user_master(user_id)
);

-- Purchase Details
CREATE TABLE IF NOT EXISTS purchase_details (
    purchase_detail_id VARCHAR(10) PRIMARY KEY,
    purchase_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(10) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    gst_percentage DECIMAL(5,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchase(purchase_id),
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
);

-- Stock RECON
CREATE TABLE IF NOT EXISTS stock_recon (
    recon_id VARCHAR(10) PRIMARY KEY,
    product_id VARCHAR(10) NOT NULL,
    recon_date DATE NOT NULL,
    system_quantity DECIMAL(10,2) NOT NULL,
    physical_quantity DECIMAL(10,2) NOT NULL,
    difference DECIMAL(10,2) NOT NULL,
    remarks TEXT,
    created_by VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product_master(product_id),
    FOREIGN KEY (created_by) REFERENCES user_master(user_id)
);

-- Payroll
CREATE TABLE IF NOT EXISTS payroll (
    payroll_id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    created_by VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_master(user_id),
    FOREIGN KEY (created_by) REFERENCES user_master(user_id)
);

-- Petty Cash (For expense tracking)
CREATE TABLE IF NOT EXISTS petty_cash (
    pc_id VARCHAR(10) PRIMARY KEY,
    pc_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_by VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user_master(user_id)
);

-- Delivery Man Operations
CREATE TABLE IF NOT EXISTS delivery_man_operations (
    delivery_id VARCHAR(10) PRIMARY KEY,
    sales_id VARCHAR(10) NOT NULL,             -- Maps to S_SN (Sales No)
    employee_id VARCHAR(10) NOT NULL,          -- The delivery man (User)
    dispatch_date DATE,                        -- Maps to DM_DD
    delivered_date DATE,                       -- Maps to DM_DE
    return_date DATE,                          -- Maps to DM_RD
    mode_of_payment VARCHAR(10),               -- Maps to DM_PM (online/cash)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_id) REFERENCES sales(sales_id),
    FOREIGN KEY (employee_id) REFERENCES user_master(user_id)
);

-- Insert default roles
INSERT INTO role_master (role_id, role_name) VALUES
('ROLE_ADMIN', 'Administrator'),
('ROLE_SALES', 'Sales Staff')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- Insert default GST rates
INSERT INTO gst_master (gst_id, gst_percentage, description) VALUES
('GST_0', 0, 'GST Exempt'),
('GST_5', 5, 'GST 5%'),
('GST_12', 12, 'GST 12%'),
('GST_18', 18, 'GST 18%'),
('GST_28', 28, 'GST 28%')
ON DUPLICATE KEY UPDATE 
    gst_percentage = VALUES(gst_percentage),
    description = VALUES(description);

-- Insert default areas
INSERT INTO area_master (area_id, area_name) VALUES
('AREA_001', 'North Zone'),
('AREA_002', 'South Zone'),
('AREA_003', 'East Zone'),
('AREA_004', 'West Zone'),
('AREA_005', 'Central Zone')
ON DUPLICATE KEY UPDATE area_name = VALUES(area_name);