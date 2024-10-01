import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // 使用 Routes 替代 Switch
import LoginSignup from './pages/LoginPage';
import StockMarket from './pages/StockMarket';
import DetailStock from './pages/DetailStock';
import Portfolio from './pages/portfolio';
import Transaction from './pages/Transaction';
import Overview from './pages/overview';
import { AuthProvider } from '../context/AuthContext';
import './index.css';
// import Dashboard from './pages/Dashboard';
// import StockQuery from './pages/StockQuery';
// import Header from './components/Header';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>  {/* 使用 Routes 替代 Switch */}
      <Route path="/" element={<LoginSignup />} />
      <Route path="/stock-market" element={<StockMarket />} />
      <Route path="/stock/:symbol" element={<DetailStock />} />
      <Route path="/portfolio" element={<Portfolio/>} />
      <Route path="/transaction" element={<Transaction/>} />
      <Route path="/overview" element={<Overview/>} />
      </Routes>
    </Router>
    </AuthProvider>
    
  );
}

export default App;
