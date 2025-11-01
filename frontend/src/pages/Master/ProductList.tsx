import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMasterList from './BaseMasterList';
import { IProductMaster } from '../../types/entities';

const ProductList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { field: 'product_id' as const, label: 'ID', sortable: true },
    { field: 'product_name' as const, label: 'Name', sortable: true },
    { field: 'description' as const, label: 'Description', sortable: true },
    { field: 'unit' as const, label: 'Unit', sortable: true },
    { 
      field: 'stock_quantity' as const, 
      label: 'Stock', 
      sortable: true,
      align: 'right' as const 
    },
    { 
      field: 'reorder_level' as const, 
      label: 'Reorder Level', 
      sortable: true,
      align: 'right' as const 
    }
  ];

  return (
    <BaseMasterList<IProductMaster>
      title="Product Master"
      endpoint="/master/products"
      columns={columns}
      addButtonLabel="Add Product"
      onAdd={() => navigate('/master/products/new')}
      onEdit={(product) => navigate(`/master/products/${product.product_id}/edit`)}
      idField="product_id"
    />
  );
};

export default ProductList;