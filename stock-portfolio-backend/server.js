const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock_portfolio';

// MongoDB connection
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Portfolio schema
const Portfolio = mongoose.model('Portfolio', {
    name: String,
    stocks: [{ symbol: String, quantity: Number, purchasePrice: Number, currentPrice: Number }]
});

app.use(bodyParser.json());

app.use(cors());

// Create a new portfolio
app.post('/api/portfolios', async (req, res) => {
    try {
        const { name, stocks } = req.body;
        const portfolio = new Portfolio({ name, stocks });
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all portfolios
app.get('/api/portfolios', async (req, res) => {
    try {
        const portfolios = await Portfolio.find();
        res.json(portfolios);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a portfolio by ID
app.get('/api/portfolios/:id', async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) throw new Error('Portfolio not found');
        res.json(portfolio);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.put('/:portfolioId/stocks/:stockId', async (req, res) => {
    try {
      const { portfolioId, stockId } = req.params;
      const { name, symbol, quantity, purchasePrice, currentPrice } = req.body;
  
      // Find the portfolio by ID
      const portfolio = await Portfolio.findById(portfolioId);
  
      // Find the index of the stock to be updated
      const stockIndex = portfolio.stocks.findIndex(stock => stock._id.toString() === stockId);
  
      if (stockIndex === -1) {
        return res.status(404).json({ message: 'Stock not found in the portfolio' });
      }
  
      // Update the stock details
      portfolio.stocks[stockIndex].name = name;
      portfolio.stocks[stockIndex].symbol = symbol;
      portfolio.stocks[stockIndex].quantity = quantity;
      portfolio.stocks[stockIndex].purchasePrice = purchasePrice;
      portfolio.stocks[stockIndex].currentPrice = currentPrice;
  
      // Save the updated portfolio
      await portfolio.save();
  
      res.status(200).json(portfolio.stocks[stockIndex]);
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Route to delete a stock within a portfolio
  app.delete('/:portfolioId/stocks/:stockId', async (req, res) => {
    try {
      const { portfolioId, stockId } = req.params;
  
      // Find the portfolio by ID
      const portfolio = await Portfolio.findById(portfolioId);
  
      // Filter out the stock to be deleted
      portfolio.stocks = portfolio.stocks.filter(stock => stock._id.toString() !== stockId);
  
      // Save the updated portfolio
      await portfolio.save();
  
      res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (error) {
      console.error('Error deleting stock:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// Update a portfolio by ID
app.put('/api/portfolios/:id', async (req, res) => {
    try {
        const { name, stocks } = req.body;
        const portfolio = await Portfolio.findByIdAndUpdate(req.params.id, { name, stocks }, { new: true });
        if (!portfolio) throw new Error('Portfolio not found');
        res.json(portfolio);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Delete a portfolio by ID
app.delete('/api/portfolios/:id', async (req, res) => {
    try {
        const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
        if (!portfolio) throw new Error('Portfolio not found');
        res.json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
