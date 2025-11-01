import { AxiosError } from 'axios';
import { apiClient } from './client';
import { 
  Sale, 
  Purchase, 
  StockRecon, 
  SalesDetail, 
  PurchaseDetail,
  APIResponse,
  APIError
} from '../types/transactions';

// Helper function to handle API errors
const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const apiError: APIError = {
      status: 'error',
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code,
      errors: error.response.data.errors
    };
    throw apiError;
  }
  throw new Error('An unexpected error occurred');
};

// Sales API Types
type CreateSalePayload = {
  customer_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  notes?: string;
  details: Array<Omit<SalesDetail, 'sales_detail_id' | 'sales_id'>>;
};

type UpdateSalePayload = Partial<CreateSalePayload>;

// Sales API
export const getSales = async () => {
  try {
    const response = await apiClient.get<APIResponse<Sale[]>>('/transact/sales');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getSale = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<Sale>>(`/transact/sales/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createSale = async (sale: CreateSalePayload) => {
  try {
    const response = await apiClient.post<APIResponse<{ salesId: number }>>('/transact/sales', sale);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateSale = async (id: number, sale: UpdateSalePayload) => {
  try {
    const response = await apiClient.put<APIResponse<void>>(`/transact/sales/${id}`, sale);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteSale = async (id: number) => {
  try {
    const response = await apiClient.delete<APIResponse<void>>(`/transact/sales/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Purchase API Types
type CreatePurchasePayload = {
  supplier_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  notes?: string;
  details: Array<Omit<PurchaseDetail, 'purchase_detail_id' | 'purchase_id'>>;
};

type UpdatePurchasePayload = Partial<CreatePurchasePayload>;

// Purchase API
export const getPurchases = async () => {
  try {
    const response = await apiClient.get<APIResponse<Purchase[]>>('/transact/purchase');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getPurchase = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<Purchase>>(`/transact/purchase/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createPurchase = async (purchase: CreatePurchasePayload) => {
  try {
    const response = await apiClient.post<APIResponse<{ purchaseId: number }>>('/transact/purchase', purchase);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updatePurchase = async (id: number, purchase: UpdatePurchasePayload) => {
  try {
    const response = await apiClient.put<APIResponse<void>>(`/transact/purchase/${id}`, purchase);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deletePurchase = async (id: number) => {
  try {
    const response = await apiClient.delete<APIResponse<void>>(`/transact/purchase/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Stock Reconciliation API Types
type CreateStockReconPayload = {
  product_id: number;
  current_quantity: number;
  actual_quantity: number;
  adjustment_reason: string;
  notes?: string;
};

type UpdateStockReconPayload = Partial<CreateStockReconPayload>;

// Stock Reconciliation API
export const getStockRecons = async () => {
  try {
    const response = await apiClient.get<APIResponse<StockRecon[]>>('/transact/stock-recon');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getStockRecon = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<StockRecon>>(`/transact/stock-recon/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createStockRecon = async (recon: CreateStockReconPayload) => {
  try {
    const response = await apiClient.post<APIResponse<{ reconId: number }>>('/transact/stock-recon', recon);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateStockRecon = async (id: number, recon: UpdateStockReconPayload) => {
  try {
    const response = await apiClient.put<APIResponse<void>>(`/transact/stock-recon/${id}`, recon);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteStockRecon = async (id: number) => {
  try {
    const response = await apiClient.delete<APIResponse<void>>(`/transact/stock-recon/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};