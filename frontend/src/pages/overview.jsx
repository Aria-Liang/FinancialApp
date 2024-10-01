import React, { useEffect, useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Doughnut, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import dayjs from 'dayjs';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext to get userId

// Function to get company logos from the given tickers
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

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext); // Get userId from AuthContext

  // State management for market stocks, transactions, and portfolio
  const [marketStocks, setMarketStocks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState({ total_assets: 0 });
  const [donutData, setDonutData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#e3f2fd', '#f3e5f5', '#e57373', '#ffb74d', '#4fc3f7', '#81c784'],
        hoverBackgroundColor: ['#e3f2fd', '#f3e5f5', '#e57373', '#ffb74d', '#4fc3f7', '#81c784'],
        cutout: '70%',
      },
    ],
  });
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Investment Over Time',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        tension: 0.1,
      },
    ],
  });

  // Fetch portfolio data and set up the donut chart
  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/view_portfolio/${userId}`);
      const data = await response.json();
      setPortfolio(data.portfolio);
      setSummary(data.summary);

      const labels = data.portfolio.map(stock => stock.ticker);
      const values = data.portfolio.map(stock => stock.current_value);

      setDonutData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['#e3f2fd', '#f3e5f5', '#e57373', '#ffb74d', '#4fc3f7', '#81c784'],
            hoverBackgroundColor: ['#e3f2fd', '#f3e5f5', '#e57373', '#ffb74d', '#4fc3f7', '#81c784'],
            cutout: '50%',
          },
        ],
        portfolio: data.portfolio,
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  // Fetch transaction data and set up the line chart
  const fetchTransactionData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/view_transactions/${userId}`);
      const data = await response.json();

      const investmentData = {};
      let totalInvestment = 0;

      // Calculate accumulated investment per date
      data.forEach((transaction) => {
        const date = dayjs(transaction.timestamp).format('YYYY-MM-DD');
        const investmentChange = transaction.price * transaction.quantity;

        if (transaction.transaction_type === 'buy') {
          totalInvestment += investmentChange;
        } else if (transaction.transaction_type === 'sell') {
          totalInvestment -= investmentChange;
        }

        if (!investmentData[date]) {
          investmentData[date] = totalInvestment;
        }
      });

      const sortedDates = Object.keys(investmentData).sort((a, b) => new Date(a) - new Date(b));
      const investmentValues = sortedDates.map((date) => investmentData[date]);

      setLineData({
        labels: sortedDates,
        datasets: [
          {
            label: 'Total Investment Over Time',
            data: investmentValues,
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch market stocks data
  useEffect(() => {
    fetch('http://localhost:5000/api/stocks')
      .then((response) => response.json())
      .then((data) => setMarketStocks(data))
      .catch((error) => console.error('Error fetching stocks:', error));
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/view_transactions/${userId}`);
        const data = await response.json();
        setRecentTransactions(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
      }
    };

    fetchRecentTransactions();
  }, [userId]);

  // Fetch data when the component mounts
  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
      fetchTransactionData();
    }
  }, [userId]);

  return (
    <Sidebar>
      <Box sx={{ display: 'flex', height: '90vh' }}>
        <Box sx={{ paddingInline: 4, flex: 1 }}>
          {/* Search bar and overview */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4">Overview</Typography>
            <TextField
              label="Search for stocks, ETFs & more"
              variant="outlined"
              sx={{ width: '400px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Investment Line Chart and Market Stocks */}
          <Grid container spacing={5} sx={{ flexGrow: 1 }}>
            {/* Line Chart (Total Investment) */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total Investment</Typography>
                  <Button onClick={() => navigate('/portfolio')} size="small">
                    More
                  </Button>
                </Box>
                <Line data={lineData} />
              </Paper>
            </Grid>

            {/* Market Stocks */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Market</Typography>
                  <Button onClick={() => navigate('/stock-market')} size="small" sx={{ backgroundColor: '#c8e6c9' }}>
                    More
                  </Button>
                </Box>
                <List>
                  {marketStocks.map((stock) => (
                    <ListItem
                      key={stock.ticker}
                      sx={{ alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => navigate(`/stock/${stock.ticker}`)}
                    >
                      <img
                        src={getCompanyLogoUrl(stock.ticker)}
                        alt={stock.name}
                        style={{ width: 40, height: 40, marginRight: 16 }}
                      />
                      <ListItemText
                        primary={`${stock.ticker} - ${stock.name}`}
                        secondary={`$${stock.price} (${stock.change >= 0 ? '+' : ''}${stock.change})`}
                      />
                      <Typography variant="body2" sx={{ ml: 'auto' }}>
                        {stock.percentage}%
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Donut Chart and Recent Transactions */}
          <Grid container spacing={5} sx={{ mt: -2 }}>
            {/* Donut Chart (Total Assets) */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total Assets</Typography>
                  <Button onClick={() => navigate('/portfolio')} size="small" sx={{ backgroundColor: '#c8e6c9' }}>
                    More
                  </Button>
                </Box>
                <Doughnut
                  data={donutData}
                  options={{
                    cutout: '70%',
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const stock = donutData.portfolio[tooltipItem.dataIndex];
                            const percentage = ((stock.current_value / summary.total_assets) * 100).toFixed(2);
                            return [
                              `${stock.name} (${stock.ticker})`,
                              `Value: $${stock.current_value.toFixed(2)}`,
                              `Profit/Loss: $${stock.profit_loss.toFixed(2)}`,
                              `Percentage: ${percentage}%`,
                            ];
                          },
                        },
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>

            {/* Recent Transactions */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Recent Transactions</Typography>
                  <Button onClick={() => navigate('/transaction')} size="small" sx={{ backgroundColor: '#c8e6c9' }}>
                    More
                  </Button>
                </Box>
                <TableContainer sx={{ pt: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.light.main }}>
                        <TableCell>Ticker</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.ticker}</TableCell>
                          <TableCell>{transaction.transaction_type}</TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>${transaction.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Sidebar>
  );
};

export default Dashboard;
