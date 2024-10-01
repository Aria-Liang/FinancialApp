import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import 'chartjs-adapter-date-fns';
import TransactionDialog from './TransactionDialog'; // Import the transaction dialog component
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext to get userId

const DetailStock = () => {
  const theme = useTheme();
  const { userId } = useContext(AuthContext); // Get userId from AuthContext
  const [stockData, setStockData] = useState(null); // State to store stock data
  const [timeRange, setTimeRange] = useState('1y'); // Default time range for chart data
  const [chartData, setChartData] = useState(null); // State to store chart data
  const [loading, setLoading] = useState(false); // State to indicate loading status
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity: success or error

  const handleSnackbarClose = (event, reason) => {
    // Handle Snackbar close
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const { symbol } = useParams(); // Get the stock symbol from the URL

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog open/close
  const [transactionType, setTransactionType] = useState('buy'); // Transaction type, default to buy
  const [selectedStock, setSelectedStock] = useState(null); // Selected stock for transaction

  // Detect if the screen width is less than 1190px (responsive behavior)
  const isSmallScreen = useMediaQuery('(max-width:1190px)');

  // Format numbers to two decimal places
  const formatNumber = (number) => {
    return typeof number === 'number' ? number.toFixed(2) : 'N/A';
  };

  // Format the day's price range
  const formatDayRange = (range) => {
    if (!range) return 'N/A';
    const [low, high] = range.split(' - ').map((num) => parseFloat(num).toFixed(2));
    return `${low} - ${high}`;
  };

  // Get the time unit based on the selected range for the chart
  const getTimeUnit = (range) => {
    switch (range) {
      case '1d': return 'hour';
      case '5d':
      case '1mo':
      case '6mo': return 'day';
      case 'ytd':
      case '1y': return 'month';
      case '5y':
      case 'max': return 'year';
      default: return 'day';
    }
  };

  // Fetch stock data based on the symbol and time range
  useEffect(() => {
    if (symbol) {
      setLoading(true); // Set loading state to true

      fetch(`http://localhost:5000/api/stock-data?symbol=${symbol}&range=${timeRange}`)
        .then((res) => res.json())
        .then((data) => {
          // Check if the data contains chart information
          if (data.chart && data.chart.dates && data.chart.prices) {
            const chartData = {
              labels: data.chart.dates,
              datasets: [
                {
                  label: symbol,
                  data: data.chart.prices,
                  borderColor: '#1B5E20', // Chart line color
                  fill: false,
                },
              ],
            };
            setChartData(chartData); // Set chart data
          } else {
            console.error('Invalid data structure:', data);
            setChartData(null);
          }

          // Calculate change and percentChange in stock price
          const { currentPrice, previousClose } = data;
          let change = 'N/A';
          let percentChange = 'N/A';
          if (typeof currentPrice === 'number' && typeof previousClose === 'number') {
            change = currentPrice - previousClose;
            percentChange = (change / previousClose) * 100;
          }

          setStockData({
            ...data,
            change,
            percentChange,
            ticker: symbol,
          });
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setStockData(null);
          setChartData(null);
        })
        .finally(() => {
          setLoading(false); // Stop loading state
        });
    }
  }, [symbol, timeRange]);

  // Handle search for a new stock
  const handleSearch = (event) => {
    event.preventDefault();
    const newSymbol = event.target.elements.search.value.toUpperCase();
    window.location.href = `/stock/${newSymbol}`; // Redirect to the new stock's page
  };

  // Chart options with time-based x-axis
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: getTimeUnit(timeRange),
        },
      },
      y: { beginAtZero: false },
    },
  };

  // Open transaction dialog
  const handleOpenDialog = () => {
    setSelectedStock(stockData);
    setDialogOpen(true);
  };

  // Close transaction dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStock(null);
  };

  // Handle transaction submission (buy/sell)
  const handleSubmitTransaction = async (transactionData) => {
    console.log('Transaction Data:', transactionData);
    const { ticker, quantity, price } = transactionData;

    try {
      const response = await fetch('http://localhost:5000/api/buy_stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, // Use userId from AuthContext
          ticker,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
        }),
      });

      if (!response.ok) {
        // Handle error response
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transaction failed');
      }

      const result = await response.json();
      console.log('Transaction Success:', result);

      setSnackbarMessage('Transaction success!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setSnackbarMessage(error.message || 'Transaction failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      handleCloseDialog(); // Close the dialog after transaction
    }
  };

  return (
    <Sidebar>
      <Box sx={{ display: 'flex', p: { xs: 1, lg: 3 } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 5, flexDirection: { xs: 'column', md: 'row' } }}
          >
            <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
              Stock Market
            </Typography>
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                width: { xs: '50%', md: '400px' },
                display: 'flex',
              }}
            >
              <TextField
                label="Search for stocks"
                name="search"
                variant="outlined"
                sx={{ flexGrow: 1 }}
              />
              <Button type="submit" variant="contained">
                Search
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Typography variant="body1">Loading data...</Typography>
          ) : stockData ? (
            <Grid container spacing={3}>
              {/* Left section for stock details and chart */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: { xs: 2, lg: 3 } }}>
                  <Typography variant="h4">{stockData.name}</Typography>
                  <Typography variant="h5">
                    ${formatNumber(stockData.currentPrice)}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    {typeof stockData.change === 'number' ? (
                      <>
                        {stockData.change > 0 ? (
                          <ArrowUpwardIcon sx={{ color: 'green', mr: 1 }} />
                        ) : stockData.change < 0 ? (
                          <ArrowDownwardIcon sx={{ color: 'red', mr: 1 }} />
                        ) : null}
                        {`${formatNumber(stockData.change)} (${formatNumber(stockData.percentChange)}%)`}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {['1d', '5d', '1mo', '6mo', 'ytd', '1y', '5y', 'max'].map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'contained' : 'outlined'}
                        onClick={() => setTimeRange(range)}
                      >
                        {range.toUpperCase()}
                      </Button>
                    ))}
                  </Box>
                  {/* Adjust chart size based on screen size */}
                  {chartData && (
                    <Box sx={{ height: isSmallScreen ? '300px' : '500px', mt: 3 }}>
                      <Line data={chartData} options={chartOptions} />
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Right section for stock stats and transaction */}
              <Grid item xs={12} lg={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mb: { xs: 3, lg: 6 }, fontSize: '20px' }}
                  onClick={handleOpenDialog}
                >
                  + Add to Portfolio
                </Button>
                <Paper sx={{ p: { xs: 2, lg: 3 } }}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            Previous Close
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {formatNumber(stockData.previousClose)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            Day Range
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {formatDayRange(stockData.dayRange)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            Market Cap
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            ${formatNumber(stockData.marketCap / 1e12)} T
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            AVG Volume
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {formatNumber(stockData.avgVolume / 1e6)} M
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            P/E Ratio
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {formatNumber(stockData.peRatio)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            Dividend Yield
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {formatNumber(stockData.dividendYield)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '16px', lg: '20px' } }}>
                            Primary Exchange
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '14px', lg: '17px' } }}>
                            {stockData.exchange}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1">No data available</Typography>
          )}
        </Box>
      </Box>

      {/* Transaction Dialog Component */}
      {selectedStock && (
        <TransactionDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          stock={selectedStock}
          transactionType={transactionType}
          handleSubmit={handleSubmitTransaction}
        />
      )}

      {/* Snackbar for transaction status */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 22, mr: 2 }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Sidebar>
  );
};

export default DetailStock;
