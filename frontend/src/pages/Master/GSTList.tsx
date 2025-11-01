import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMasterList from './BaseMasterList';
import { IGSTMaster } from '../../types/entities';

const GSTList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { field: 'gst_id' as const, label: 'ID', sortable: true },
    { field: 'gst_percentage' as const, label: 'Percentage', sortable: true },
    { field: 'description' as const, label: 'Description', sortable: true }
  ];

  return (
    <BaseMasterList<IGSTMaster>
      title="GST Master"
      endpoint="/master/gst"
      columns={columns}
      addButtonLabel="Add GST Rate"
      onAdd={() => navigate('/master/gst/new')}
      onEdit={(gst) => navigate(`/master/gst/${gst.gst_id}/edit`)}
      idField="gst_id"
    />
  );
};

export default GSTList;