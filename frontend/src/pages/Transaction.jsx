import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Pagination,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext for user ID

// Function to map stock tickers to company domains for logo retrieval
const getCompanyLogoUrl = (ticker) => {
  const domainMap = {
    AAPL: 'apple.com',
    GOOGL: 'google.com',
    TSLA: 'tesla.com',
    AMZN: 'amazon.com',
    MSFT: 'microsoft.com',
    NFLX: 'netflix.com',
    META: 'facebook.com',
    NVDA: 'nvidia.com',
    BABA: 'alibaba.com',
    V: 'visa.com',
    JPM: 'jpmorganchase.com',
    JNJ: 'jnj.com',
    DIS: 'disney.com',
    PYPL: 'paypal.com',
  };
  return domainMap[ticker] ? `https://logo.clearbit.com/${domainMap[ticker]}` : 'https://via.placeholder.com/40?text=Logo';
};

const Transaction = () => {
  const theme = useTheme();
  const { userId } = useContext(AuthContext); // Get user ID from AuthContext
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1); // Current page number for pagination
  const itemsPerPage = 8; // Number of transactions per page
  const [stockData, setStockData] = useState([]); // Store company information
  const [currentIndex, setCurrentIndex] = useState(0); // Current index for stock slide
  const itemsPerSlide = 5; // Number of stocks per slide

  // State for sorting transactions
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc', // 'asc' for ascending or 'desc' for descending
  });

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/view_transactions/${userId}`);
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data); // Initially show all transactions
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStockData = async (page) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stocks?page=${page}&limit=${itemsPerSlide}`);
      const data = await response.json();
      setStockData(data); // Store stock data
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };
  // Fetch user transactions and stock data on component mount
  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchStockData(1); // Fetch first page of stock data
    }
  }, [userId]);

  // Search and filter transactions based on user input
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = transactions.filter(transaction =>
      transaction.ticker.toLowerCase().includes(value) ||
      transaction.transaction_type.toLowerCase().includes(value)
    );

    setFilteredTransactions(filtered);
    setPage(1); // Reset to the first page after filtering
  };

  // Sort transactions by key (e.g., date, amount)
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter transactions based on current config
  const sortedTransactions = useMemo(() => {
    let sortableTransactions = [...filteredTransactions];
    if (sortConfig.key) {
      sortableTransactions.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Convert timestamp to numeric value for sorting
        if (sortConfig.key === 'timestamp') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [filteredTransactions, sortConfig]);

  // Paginate transactions based on the current page
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, page, itemsPerPage]);

  // Change page for pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Navigate to previous set of stocks
  const handlePrevClick = () => {
    fetchStockData();
  };

  // Navigate to next set of stocks
  const handleNextClick = () => {
    fetchStockData();
  };

  // Define table columns for transactions
  const columns = [
    { label: 'Action', key: 'transaction_type' },
    { label: 'Date', key: 'timestamp' },
    { label: 'Amount', key: 'quantity' },
    { label: 'Price', key: 'price' },
    { label: 'Company', key: 'ticker' },
  ];

  return (
    <Sidebar>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with title and search bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
            Transaction
          </Typography>
          <TextField
            label="Search for stocks, ETFs & more"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '400px' }}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
          />
        </Box>

        {/* Transaction history */}
        <Typography variant="h6" sx={{ mb: 2 }}>History Stock Order</Typography>
        <Paper sx={{ mb: 4 }}>
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)', // 5 equal columns
              gap: 0,
              fontWeight: 'bold',
              backgroundColor: theme.palette.light.main,
              padding: 1.5,
              margin: 0,
            }}
          >
            {columns.map((column) => (
              <Box
                key={column.key}
                onClick={() => handleSort(column.key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: sortConfig.key === column.key ? theme.palette.primary.main : 'inherit',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  {column.label}
                  {sortConfig.key === column.key && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Display sorted transactions */}
          {paginatedTransactions.map((transaction, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)', // 5 equal columns
                gap: 0,
                mt: 1,
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                paddingY: 1,
              }}
            >
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {transaction.transaction_type.toUpperCase()} {transaction.ticker}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {new Date(transaction.timestamp).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {transaction.quantity}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ${transaction.price.toFixed(2)}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {transaction.ticker}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredTransactions.length / itemsPerPage)} // Calculate total number of pages
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        {/* More Stock Section */}
        <Typography variant="h6" sx={{ mb: 2 }}>More Stock</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, width: '100%' }}>
          {/* Left arrow */}
          <IconButton onClick={handlePrevClick} disabled={currentIndex === 0}>
            <ArrowBackIosIcon />
          </IconButton>

          {/* Stock cards displayed in a row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            flex: 1,
            overflow: 'hidden',
          }}>
            {stockData.map((stock, index) => (
              <Paper key={index} sx={{ padding: 2, textAlign: 'center' }}>
                <img
                  src={getCompanyLogoUrl(stock.ticker)}
                  alt={stock.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <Typography variant="body1">{stock.ticker}</Typography>
                <Typography variant="body2">{stock.name}</Typography>
                <Typography variant="body2">${stock.price}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Right arrow */}
          <IconButton onClick={handleNextClick}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>
    </Sidebar>
  );
};

export default Transaction;
