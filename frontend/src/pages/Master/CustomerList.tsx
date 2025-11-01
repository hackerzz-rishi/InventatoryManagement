import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMasterList from './BaseMasterList';
import { ICustomerMaster } from '../../types/entities';

const CustomerList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { field: 'customer_id' as const, label: 'ID', sortable: true },
    { field: 'customer_name' as const, label: 'Name', sortable: true },
    { field: 'contact_person' as const, label: 'Contact Person', sortable: true },
    { field: 'email' as const, label: 'Email', sortable: true },
    { field: 'phone' as const, label: 'Phone', sortable: true },
    { field: 'gst_number' as const, label: 'GST Number', sortable: true }
  ];

  return (
    <BaseMasterList<ICustomerMaster>
      title="Customer Master"
      endpoint="/master/customers"
      columns={columns}
      addButtonLabel="Add Customer"
      onAdd={() => navigate('/master/customers/new')}
      onEdit={(customer) => navigate(`/master/customers/${customer.customer_id}/edit`)}
      idField="customer_id"
    />
  );
};

export default CustomerList;