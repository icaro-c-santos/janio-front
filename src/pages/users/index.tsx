import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import CustomersSection from './sections/CustomersSection';
import SuppliersSection from './sections/SuppliersSection';

const UsersPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} aria-label="tabs-usuarios" variant="scrollable">
          <Tab label="Clientes" />
          <Tab label="Fornecedores" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <CustomersSection />
      )}

      {tab === 1 && (
        <SuppliersSection />
      )}
    </Box>
  );
};

export default UsersPage;
