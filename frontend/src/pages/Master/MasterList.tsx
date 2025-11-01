import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Container,
  Grid
} from '@mui/material';
import {
  People as CustomersIcon,
  Inventory as ProductsIcon,
  LocationOn as AreasIcon,
  Calculate as GSTIcon,
  PriceChange as PricingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface MasterModule {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const masterModules: MasterModule[] = [
  {
    title: 'Customers',
    description: 'Manage customer information and details',
    icon: <CustomersIcon sx={{ fontSize: 40 }} />,
    path: '/master/customers'
  },
  {
    title: 'Products',
    description: 'Manage products and their details',
    icon: <ProductsIcon sx={{ fontSize: 40 }} />,
    path: '/master/products'
  },
  {
    title: 'Areas',
    description: 'Manage geographical areas and zones',
    icon: <AreasIcon sx={{ fontSize: 40 }} />,
    path: '/master/areas'
  },
  {
    title: 'GST Rates',
    description: 'Configure GST rates and categories',
    icon: <GSTIcon sx={{ fontSize: 40 }} />,
    path: '/master/gst'
  },
  {
    title: 'Pricing',
    description: 'Manage product pricing and discounts',
    icon: <PricingIcon sx={{ fontSize: 40 }} />,
    path: '/master/pricing'
  }
];

const MasterList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Master Data Management
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
          {masterModules.map((module) => (
            <Box key={module.title}>
              <Card>
                <CardActionArea onClick={() => navigate(module.path)}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ mb: 2, color: 'primary.main' }}>
                      {module.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default MasterList;