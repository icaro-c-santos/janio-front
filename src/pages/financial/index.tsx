import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';

const FinancialPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} aria-label="tabs-financeiro" variant="scrollable">
          <Tab label="Contas a pagar" />
          <Tab label="Contas a receber" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Typography color="text.secondary">Em breve: listagem de contas a pagar</Typography>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography color="text.secondary">Em breve: listagem de contas a receber</Typography>
        </Box>
      )}
    </Box>
  );
};

export default FinancialPage;
