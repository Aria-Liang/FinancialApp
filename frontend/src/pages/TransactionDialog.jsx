import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

// TransactionDialog component to handle buy/sell stock transactions
// Props include: open (whether dialog is open), handleClose (function to close dialog),
// stock (selected stock object), transactionType (buy or sell), and handleSubmit (function to submit transaction)
const TransactionDialog = ({ open, handleClose, stock, transactionType, handleSubmit }) => {
  const [quantity, setQuantity] = useState(''); // Stores the input quantity for buying/selling stock
  const [price, setPrice] = useState(''); // Stores the input price for the stock

  // useEffect to set the initial price based on stock data when stock changes
  useEffect(() => {
    if (stock) {
      // Use currentPrice if available, otherwise fall back to current_price or an empty string
      const initialPrice = stock.currentPrice || stock.current_price || '';
      setPrice(initialPrice);
    } else {
      setPrice(''); // Reset price if no stock is selected
    }
  }, [stock]);

  // Handle change in quantity input field
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  // Handle change in price input field
  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  // Function to handle form submission
  const onSubmit = () => {
    // Call the passed handleSubmit function with transaction data
    handleSubmit({
      ticker: stock?.ticker, // Stock ticker symbol
      quantity, // Quantity of stock to buy/sell
      price, // Price per share
      transactionType, // Either 'buy' or 'sell'
    });
    handleClose(); // Close the dialog after submitting the form
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {/* Dialog title shows either 'Buy Stock' or 'Sell Stock' based on transactionType */}
      <DialogTitle>{transactionType === 'buy' ? 'Buy Stock' : 'Sell Stock'}</DialogTitle>
      
      <DialogContent>
        {/* Display the stock name and ticker */}
        <Typography variant="h6">{stock?.name} ({stock?.ticker})</Typography>
        
        {/* Input for quantity of stock */}
        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={quantity}
          onChange={handleQuantityChange}
          margin="normal"
        />

        {/* Input for price per share */}
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={price}
          onChange={handlePriceChange}
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        {/* Cancel button to close the dialog */}
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        
        {/* Submit button to either 'Buy' or 'Sell' stock based on transactionType */}
        <Button onClick={onSubmit} color="primary">
          {transactionType === 'buy' ? 'Buy' : 'Sell'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog;
