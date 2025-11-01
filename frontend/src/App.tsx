import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { useAuth } from './context/AuthContext';
import SalesList from './pages/Transactions/Sales/SalesList';
import SalesForm from './pages/Transactions/Sales/SalesForm';
import PurchaseList from './pages/Transactions/Purchase/PurchaseList';
import PurchaseForm from './pages/Transactions/Purchase/PurchaseForm';
import StockReconList from './pages/Transactions/StockRecon/StockReconList';
import StockReconForm from './pages/Transactions/StockRecon/StockReconForm';
import MasterList from './pages/Master/MasterList';
import CustomerList from './pages/Master/CustomerList';
import ProductList from './pages/Master/ProductList';
import ProductForm from './pages/Master/ProductForm';
import AreaList from './pages/Master/AreaList';
import AreaForm from './pages/Master/AreaForm';
import GSTList from './pages/Master/GSTList';
import GSTForm from './pages/Master/GSTForm';
import PricingList from './pages/Master/PricingList';
import PricingForm from './pages/Master/PricingForm';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerForm from './pages/Master/CustomerForm';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  styled,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';

const drawerWidth = 240;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Masters', path: '/master', icon: <ListAltIcon /> },
    { text: 'Sales', path: '/transactions/sales', icon: <ReceiptIcon /> },
    { text: 'Purchase', path: '/transactions/purchase', icon: <ShoppingCartIcon /> },
    { text: 'Stock Recon', path: '/transactions/stock-recon', icon: <InventoryIcon /> },
  ];

  const drawer = (
    <div>
      <DrawerHeader>
        <Typography variant="h6" noWrap component="div">
          Menu
        </Typography>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Inventory Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Main open>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app">
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/sales"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SalesList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/sales/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SalesForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/sales/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SalesForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/purchase"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PurchaseList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/purchase/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PurchaseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/purchase/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PurchaseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/stock-recon"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StockReconList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/stock-recon/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StockReconForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/stock-recon/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StockReconForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MasterList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/customers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomerList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/customers/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomerForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/customers/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomerForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/products"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/products/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/products/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/areas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AreaList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/areas/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AreaForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/areas/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AreaForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/gst"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GSTList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/gst/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GSTForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/gst/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GSTForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/pricing"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PricingList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/pricing/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PricingForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/pricing/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PricingForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;