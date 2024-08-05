import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomizeBot from './Components/CustomizeBot';
import UploadDocument from './Components/UploadDocument';
import Chat from './Components/Chat'; // Ensure you have a Chat component
import Sidebar from './Components/Sidebar'; // Assuming you have a Sidebar component
import { Box } from '@mui/material';
import './App.css';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }} className="app" >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh', // Full viewport height
            p: 3,
          }}
          className="content"
        >
          <Routes>
            <Route path="/customize" element={<CustomizeBot />} />
            <Route path="/upload" element={<UploadDocument />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
