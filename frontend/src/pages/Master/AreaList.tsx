import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMasterList from './BaseMasterList';
import { IAreaMaster } from '../../types/entities';

const AreaList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { field: 'area_id' as const, label: 'ID', sortable: true },
    { field: 'area_name' as const, label: 'Area Name', sortable: true }
  ];

  return (
    <BaseMasterList<IAreaMaster>
      title="Area Master"
      endpoint="/master/areas"
      columns={columns}
      addButtonLabel="Add Area"
      onAdd={() => navigate('/master/areas/new')}
      onEdit={(area) => navigate(`/master/areas/${area.area_id}/edit`)}
      idField="area_id"
    />
  );
};

export default AreaList;