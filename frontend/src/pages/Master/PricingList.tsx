import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMasterList from './BaseMasterList';
import { IPricingMaster } from '../../types/entities';

const PricingList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { field: 'pricing_id' as const, label: 'ID', sortable: true },
    { field: 'product_id' as const, label: 'Product ID', sortable: true },
    { 
      field: 'unit_price' as const, 
      label: 'Unit Price', 
      sortable: true,
      align: 'right' as const,
      render: (value: number) => value.toFixed(2)
    }
  ];

  return (
    <BaseMasterList<IPricingMaster>
      title="Pricing Master"
      endpoint="/master/pricing"
      columns={columns}
      addButtonLabel="Add Price"
      onAdd={() => navigate('/master/pricing/new')}
      onEdit={(pricing) => navigate(`/master/pricing/${pricing.pricing_id}/edit`)}
      idField="pricing_id"
    />
  );
};

export default PricingList;