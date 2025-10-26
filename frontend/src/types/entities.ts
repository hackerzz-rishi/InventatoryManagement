// Common timestamp fields interface
interface TimeStamps {
  created_at: Date;
  updated_at: Date;
}

// User related interfaces
export interface IRole extends TimeStamps {
  role_id: string;
  role_name: string;
}

export interface IUser extends TimeStamps {
  user_id: string;
  username: string;
  password: string;
  role_id: string;
  email: string | null;
  is_active: boolean;
}

// Master data interfaces
export interface IProductMaster extends TimeStamps {
  product_id: string;
  product_name: string;
  description: string | null;
  unit: string;
  stock_quantity: number;
  reorder_level: number;
}

export interface ICustomerMaster extends TimeStamps {
  customer_id: string;
  customer_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
}

export interface IGSTMaster extends TimeStamps {
  gst_id: string;
  gst_percentage: number;
  description: string | null;
}

export interface IPricingMaster extends TimeStamps {
  pricing_id: string;
  product_id: string;
  base_price: number;
  gst_id: string;
  effective_from: Date;
  effective_to: Date | null;
}

// Transaction interfaces
export interface ISales extends TimeStamps {
  sales_id: string;
  customer_id: string;
  sale_date: Date;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  created_by: string;
}

export interface ISalesDetails extends TimeStamps {
  sales_detail_id: string;
  sales_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;
}

export interface IPurchase extends TimeStamps {
  purchase_id: string;
  supplier_id: string;
  purchase_date: Date;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  created_by: string;
}

export interface IPurchaseDetails extends TimeStamps {
  purchase_detail_id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;
}

export interface IStockRecon extends TimeStamps {
  recon_id: string;
  product_id: string;
  recon_date: Date;
  system_quantity: number;
  physical_quantity: number;
  difference: number;
  remarks: string | null;
  created_by: string;
}

export interface IPayroll extends TimeStamps {
  payroll_id: string;
  user_id: string;
  pay_period_start: Date;
  pay_period_end: Date;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date: Date | null;
  created_by: string;
}