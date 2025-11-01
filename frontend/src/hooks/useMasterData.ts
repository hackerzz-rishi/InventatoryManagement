import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  gst_rate: number;
}

export const useMasterData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          apiClient.get<{ status: string; data: Customer[] }>('/master/customers'),
          apiClient.get<{ status: string; data: Product[] }>('/master/products')
        ]);

        setCustomers(customersResponse.data.data);
        setProducts(productsResponse.data.data);
        setError(null);
      } catch (err) {
        setError('Error loading master data');
        console.error('Error loading master data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    customers,
    products,
    loading,
    error
  };
};