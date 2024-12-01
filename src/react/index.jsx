import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import BrowseHistoryList from '../content';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';

const container = document.getElementById('root');
const root = createRoot(container);


root.render(
  <React.StrictMode>
    {/* <Paper square sx={{ pb: '50px', marginTop: '50px'}}> */}
    <App />
    {/* </Paper> */}
    <AppBar position="fixed" color="f0" sx={{ top: 'auto', bottom: 0 }}>
    <Accordion>
      <AccordionSummary
        aria-controls="panel2-content"
        id="panel2-header"
      >
        <Typography>Recent Browsing History</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <BrowseHistoryList divName="history-data" />
        </Typography>
      </AccordionDetails>
    </Accordion>
    </AppBar>
  </React.StrictMode>
);
