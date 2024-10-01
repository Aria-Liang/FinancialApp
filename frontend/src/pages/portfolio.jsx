import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Typography, TextField, Paper, IconButton, ToggleButton, ToggleButtonGroup, Pagination, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Represents Buy action
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'; // Represents Sell action
import Sidebar from '../components/Sidebar';
import TransactionDialog from './TransactionDialog'; // Import TransactionDialog for stock transactions
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext to retrieve userId

// Helper function to get company logo URL based on stock ticker
const getCompanyLogoUrl = (ticker) => {
    const domainMap = {
        AAPL: 'apple.com',
        GOOGL: 'google.com',
        TSLA: 'tesla.com',
        AMZN: 'amazon.com',
        MSFT: 'microsoft.com',
        NFLX: 'netflix.com',
        META: 'meta.com',
        BABA: 'alibaba.com',
        V: 'visa.com',
        JPM: 'jpmorganchase.com',
        BAC: 'bankofamerica.com',
        NVDA: 'nvidia.com',
        PFE: 'pfizer.com',
        NKE: 'nike.com',
        KO: 'coca-cola.com',
        MCD: 'mcdonalds.com',
        DIS: 'disney.com',
        INTC: 'intel.com',
        ORCL: 'oracle.com',
        WMT: 'walmart.com',
    };
    
    if (domainMap[ticker]) {
        return `https://logo.clearbit.com/${domainMap[ticker]}`;
    }
    return 'https://via.placeholder.com/40?text=Logo';
};

const Portfolio = () => {
    const { userId } = useContext(AuthContext); // Get userId from AuthContext
    const [portfolioData, setPortfolioData] = useState([]);
    const [summaryData, setSummaryData] = useState({ total_assets: 0, total_revenue: 0, todays_revenue: 0 });
    const [filter, setFilter] = useState('All'); // Filter: 'All', 'Gainer', 'Decliners'
    const [page, setPage] = useState(1); // Pagination state
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering stocks
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar for feedback messages
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error' for Snackbar
    const itemsPerPage = 8; // Number of stocks per page

    const [openDialog, setOpenDialog] = useState(false); // Control for opening TransactionDialog
    const [transactionType, setTransactionType] = useState(''); // 'buy' or 'sell'
    const [selectedStock, setSelectedStock] = useState(null); // Stock selected for transaction

    // Open the TransactionDialog for buying/selling stock
    const handleOpenDialog = (stock, type) => {
        setSelectedStock({ ...stock, price: stock.current_price });
        setTransactionType(type);
        setOpenDialog(true);
    };

    // Close the TransactionDialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Submit a stock transaction (buy or sell)
    const handleTransactionSubmit = async (transactionData) => {
        const { ticker, quantity, price, transactionType } = transactionData;
        const apiUrl = transactionType === 'buy' ? 'http://localhost:5000/api/buy_stock' : 'http://localhost:5000/api/sell_stock';

        const payload = {
            user_id: userId, // Use userId from AuthContext instead of hardcoded value
            ticker,
            quantity: parseFloat(quantity),
            price: parseFloat(price)
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setSnackbarMessage(`${transactionType === 'buy' ? 'Bought' : 'Sold'} ${ticker} successfully.`);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                fetchPortfolioData(); // Refresh portfolio after transaction
            } else {
                setSnackbarMessage(`Error: ${result.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (error) {
            setSnackbarMessage(`Error submitting transaction: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }

        handleCloseDialog(); // Close the dialog after transaction
    };

    // Close Snackbar
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // Fetch portfolio data from backend
    const fetchPortfolioData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/view_portfolio/${userId}`);
            const data = await response.json();
            
            if (response.ok) {
                setPortfolioData(data.portfolio);
                setSummaryData(data.summary);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
        }
    };

    // Load portfolio data on component mount
    useEffect(() => {
        if (userId) fetchPortfolioData(); // Ensure userId is present before fetching data
    }, [userId]);

    // Calculate profit or loss for a stock
    const calculateProfitLoss = (stock) => (stock.current_price - stock.avg_price) * stock.quantity;

    // Filter portfolio data based on search term and filter option
    const filteredData = portfolioData
        .filter(stock => stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(stock => {
            if (filter === 'Gainer') return calculateProfitLoss(stock) > 0;
            if (filter === 'Decliners') return calculateProfitLoss(stock) < 0;
            return true;
        });

    // Paginate the filtered data
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Handle filter change
    const handleFilterChange = (event, newFilter) => {
        setFilter(newFilter);
    };

    // Handle page change for pagination
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Sidebar>
            <Box sx={{ flexGrow: 1, p: 3 }}>
                {/* Header with search bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Portfolio</Typography>
                    <TextField
                        label="Search for stocks, ETFs & more"
                        variant="outlined"
                        InputProps={{ endAdornment: <SearchIcon /> }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: '400px' }}
                    />
                </Box>

                {/* Summary data: Today's return, Total return, Current value */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ padding: 2, background: 'linear-gradient(135deg, #a8e063, #56ab2f)', color: 'white', textAlign: 'center' }}>
                            <Typography variant="h6">Today's Return</Typography>
                            <Typography variant="h5">${summaryData.todays_revenue.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ padding: 2, background: 'linear-gradient(135deg, #6DD5FA, #2980B9)', color: 'white', textAlign: 'center' }}>
                            <Typography variant="h6">Total Return</Typography>
                            <Typography variant="h5">${summaryData.total_revenue.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ padding: 2, background: 'linear-gradient(135deg, #f7b42c, #fc575e)', color: 'white', textAlign: 'center' }}>
                            <Typography variant="h6">Current Value</Typography>
                            <Typography variant="h5">${summaryData.total_assets.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filter buttons: All, Gainer, Decliners */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} sx={{ boxShadow: 3 }}>
                        <ToggleButton value="All" sx={{ width: '150px' }}>All</ToggleButton>
                        <ToggleButton value="Gainer" sx={{ width: '150px' }}>Gainer</ToggleButton>
                        <ToggleButton value="Decliners" sx={{ width: '150px' }}>Decliners</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Snackbar for feedback messages */}
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mt: 40, mr: 2 }}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
                </Snackbar>

                {/* Portfolio table */}
                <Paper sx={{ padding: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, fontWeight: 'bold' }}>
                        <Box sx={{ width: '5%' }}>Logo</Box>
                        <Box sx={{ width: '10%' }}>Ticker</Box>
                        <Box sx={{ width: '20%' }}>Name</Box>
                        <Box sx={{ width: '10%' }}>Shares</Box>
                        <Box sx={{ width: '10%' }}>Avg Price</Box>
                        <Box sx={{ width: '10%' }}>Current Price</Box>
                        <Box sx={{ width: '10%' }}>Value</Box>
                        <Box sx={{ width: '10%' }}>Profit/Loss</Box>
                        <Box sx={{ width: '15%' }}>Actions</Box>
                    </Box>
                    {paginatedData.map((stock, index) => (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} key={index}>
                            <Box sx={{ width: '5%' }}>
                                <img src={getCompanyLogoUrl(stock.ticker)} alt={stock.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography>{stock.ticker}</Typography>
                            </Box>
                            <Box sx={{ width: '20%' }}>
                                <Typography variant="body2" color="textSecondary">{stock.name}</Typography>
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography>{stock.quantity} shares</Typography>
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography>${stock.avg_price.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography>${stock.current_price.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography>${(stock.current_price * stock.quantity).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ width: '10%' }}>
                                <Typography color={calculateProfitLoss(stock) >= 0 ? 'success' : 'error'}>
                                    {calculateProfitLoss(stock).toFixed(2)}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '15%', display: 'flex', justifyContent: 'space-between' }}>
                                <IconButton color="primary" aria-label="buy" onClick={() => handleOpenDialog(stock, 'buy')}>
                                    <AddShoppingCartIcon />
                                </IconButton>
                                <IconButton color="secondary" aria-label="sell" onClick={() => handleOpenDialog(stock, 'sell')}>
                                    <RemoveShoppingCartIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* Pagination for portfolio items */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination count={Math.ceil(filteredData.length / itemsPerPage)} page={page} onChange={handlePageChange} color="primary" />
                </Box>

                {/* Transaction dialog for buying/selling stocks */}
                <TransactionDialog
                    open={openDialog}
                    handleClose={handleCloseDialog}
                    stock={selectedStock}
                    transactionType={transactionType}
                    handleSubmit={handleTransactionSubmit}
                />
            </Box>
        </Sidebar>
    );
};

export default Portfolio;