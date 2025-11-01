export interface APIResponse<T = void> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface APIError {
  status: 'error';
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface TransactionBase {
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface SalesDetail {
  sales_detail_id?: number;
  sales_id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

export interface Sale extends TransactionBase {
  sales_id: number;
  customer_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  details: SalesDetail[];
}

export interface PurchaseDetail {
  purchase_detail_id?: number;
  purchase_id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

export interface Purchase extends TransactionBase {
  purchase_id: number;
  supplier_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  details: PurchaseDetail[];
}

export interface StockRecon extends TransactionBase {
  recon_id: number;
  product_id: number;
  current_quantity: number;
  actual_quantity: number;
  difference: number;
  adjustment_reason: string;
}

export type TransactionType = 'sales' | 'purchase' | 'stock-recon';