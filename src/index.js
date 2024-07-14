import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './Contexts/UserContext';
import EmployeeDetailsWrapper from './Components/EmployeeDetailsWrapper'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/employee-details/:id" element={<EmployeeDetailsWrapper />} />
        </Routes>
      </Router>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
