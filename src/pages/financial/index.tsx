import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import AccountsReceivableSection from './sections/AccountsReceivableSection';
import ExpensesSection from './sections/ExpensesSection';

const FinancialPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} aria-label="tabs-financeiro" variant="scrollable">
          <Tab label="Contas a receber" />
          <Tab label="Despesas" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <AccountsReceivableSection />
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <ExpensesSection />
        </Box>
      )}
    </Box>
  );
};

export default FinancialPage;

