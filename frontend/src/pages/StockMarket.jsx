import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Paper, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom'; // For navigation between routes
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const StockMarket = () => {
  // State to store search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State to store suggested stocks list
  const [suggestedStocks, setSuggestedStocks] = useState([]);
  
  // State to store combined stock indices data (NASDAQ, S&P 500, Dow Jones)
  const [combinedData, setCombinedData] = useState({});
  
  // State to store annual returns (for NASDAQ, S&P 500, Dow Jones)
  const [annualReturns, setAnnualReturns] = useState({});
  
  // Loading states for different data
  const [loadingIndices, setLoadingIndices] = useState(true); 
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingAnnualReturns, setLoadingAnnualReturns] = useState(true);
  
  const navigate = useNavigate(); // Used for navigating to different routes

  // Fetch suggested stocks from the backend API
  const fetchSuggestedStocks = async () => {
    setLoadingStocks(true);
    try {
      const response = await fetch('http://localhost:5000/api/stocks'); // Assume the backend provides this endpoint
      const data = await response.json();
      setSuggestedStocks(data); // Update suggested stocks state
    } catch (error) {
      console.error('Error fetching suggested stocks:', error);
    } finally {
      setLoadingStocks(false); // Stop loading
    }
  };

  // Fetch real-time stock index data from the backend API
  const fetchCombinedData = async () => {
    setLoadingIndices(true);
    try {
      const response = await fetch('http://localhost:5000/api/stock-indices'); // Assume the backend provides this endpoint
      const data = await response.json();
      setCombinedData(data); // Update stock indices data state
    } catch (error) {
      console.error('Error fetching stock indices data:', error);
    } finally {
      setLoadingIndices(false); // Stop loading
    }
  };

  // Fetch annualized return data from the backend API
  const fetchAnnualReturns = async () => {
    setLoadingAnnualReturns(true);
    try {
      const response = await fetch('http://localhost:5000/api/annualized-return'); // Assume the backend provides this endpoint
      const data = await response.json();
      setAnnualReturns(data); // Update annual returns state
    } catch (error) {
      console.error('Error fetching annualized return data:', error);
    } finally {
      setLoadingAnnualReturns(false); // Stop loading
    }
  };

  // Fetch all required data on component mount
  useEffect(() => {
    fetchSuggestedStocks();
    fetchCombinedData();
    fetchAnnualReturns();
  }, []);

  // Handle search term input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submit, navigate to the specific stock's details page
  const handleSearchSubmit = () => {
    const newSymbol = searchTerm.toUpperCase();
    if (newSymbol) {
      navigate(`/stock/${newSymbol}`); // Navigate to stock detail page for the entered symbol
    }
  };

  // Refresh the suggested stocks list
  const refreshStocks = () => {
    fetchSuggestedStocks(); // Re-fetch the suggested stocks
  };

  return (
    <Sidebar>
      <Box sx={{ paddingTop: 3, paddingLeft: 5, paddingRight: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ marginBottom: 5 }}>
          Stock Market
        </Typography>

        {/* Displaying annualized returns for NASDAQ, S&P 500, and Dow Jones */}
        <Grid container spacing={10} sx={{ mb: 4 }}>
          {loadingAnnualReturns ? (
            <Typography>Loading annual returns...</Typography>
          ) : (
            <>
              {/* NASDAQ annual return */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6DD5FA 0%, #2980B9 100%)',
                    color: 'white',
                    minHeight: 120,
                    borderRadius: '25px',
                  }}
                >
                  <Typography variant="h6">NASDAQ Annual Return</Typography>
                  <Typography variant="h5">
                    {annualReturns.NASDAQ ? `${annualReturns.NASDAQ.annualized_return}%` : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              {/* S&P 500 annual return */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
                    color: 'white',
                    minHeight: 120,
                    borderRadius: '25px',
                  }}
                >
                  <Typography variant="h6">S&P 500 Annual Return</Typography>
                  <Typography variant="h5">
                    {annualReturns.SP500 ? `${annualReturns.SP500.annualized_return}%` : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              {/* Dow Jones annual return */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f7b42c 0%, #fc575e 100%)',
                    color: 'white',
                    minHeight: 120,
                    borderRadius: '25px',
                  }}
                >
                  <Typography variant="h6">Dow Jones Annual Return</Typography>
                  <Typography variant="h5">
                    {annualReturns.DowJones ? `${annualReturns.DowJones.annualized_return}%` : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>

        {/* Search bar for searching stocks */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <TextField
            label="Search for stocks, ETFs & more"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: <SearchIcon onClick={handleSearchSubmit} sx={{ cursor: 'pointer' }} />, // Search icon triggers search
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit(); // Enter key triggers search
              }
            }}
          />
        </Box>

        {/* Layout for the stock indices chart and suggested stock list */}
        <Grid container spacing={5}>
          {/* Stock indices chart */}
          <Grid item md={12} lg={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>Stock Indices (1 Month)</Typography>

              {loadingIndices ? (
                <Typography>Loading stock indices data...</Typography>
              ) : (
                combinedData && Object.keys(combinedData).length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={combinedData.DowJones.dates.map((date, index) => ({
                        time: date,
                        NASDAQ: combinedData.NASDAQ.prices[index],
                        SP500: combinedData.SP500.prices[index],
                        DowJones: combinedData.DowJones.prices[index],
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="NASDAQ" stroke="#2980B9" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="SP500" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="DowJones" stroke="#ff7300" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography>No data available for stock indices</Typography>
                )
              )}
            </Paper>
          </Grid>

          {/* Suggested stocks list */}
          <Grid item md={12} lg={6}>
            <Paper sx={{ padding: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">You may be interested in</Typography>
                <IconButton onClick={refreshStocks} aria-label="refresh">
                  <RefreshIcon />
                </IconButton>
              </Box>

              {loadingStocks ? (
                <Typography>Loading suggested stocks...</Typography>
              ) : (
                suggestedStocks.length > 0 ? (
                  suggestedStocks.map((stock) => (
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} key={stock.ticker}>
                      <Grid item xs={6} sm={2}>
                        <Typography>{stock.ticker}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography>{stock.name}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography>${stock.price.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography color={stock.change < 0 ? 'error' : 'success'}>
                          {stock.change.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                      <Typography color={stock.percentage < 0 ? 'error' : 'success'}>
                        {typeof stock.percentage === 'number' ? stock.percentage.toFixed(2) : 'N/A'}%
                      </Typography>
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <Button variant="outlined" size="small" fullWidth>
                            Add
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ))
                ) : (
                  <Typography>No suggested stocks available</Typography>
                )
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Sidebar>
  );
};

export default StockMarket;
