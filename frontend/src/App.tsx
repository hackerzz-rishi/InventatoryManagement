import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages will be imported here as they are created
// import LoginPage from './pages/Auth/LoginPage';
// import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        {/* Routes will be added here */}
        <Route path="/" element={<div>Welcome to Inventory Management System</div>} />
      </Routes>
    </div>
  );
};

export default App;