const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();
const connectDB = require('./config/db');
const { BuyPosition, SellPosition } = require('./models/Position');
const History = require('./models/History');
const User = require('./models/user');
const userRoutes = require('./routes/userRoutes');
const watchlistRoutes = require('./routes/WatchlistRoutes');
const positionRoutes = require('./routes/PositionRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/position', positionRoutes);

//for backend working test
app.get('/', (req, res) => {
    res.send("<h1>Paper Trading. Your server is Live</h1>");
});

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Get the latest stock price
const fetchStockPrice = async (symbol) => {
    try {
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`
        );

        return response.data.chart.result[0].meta.regularMarketPrice || null;
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error.message);
        return null;
    }
};

io.on('connection', (socket) => {
    console.log('New client connected');
    setInterval(async () => {
        try {
            const positions = await BuyPosition.distinct('stockSymbol');


            for (const stockSymbol of positions) {
                const currentStockPrice = await fetchStockPrice(stockSymbol); // Fetch real-time price

                if (!currentStockPrice) {
                    console.log(`Skipping ${stockSymbol}, unable to fetch stock price.`);
                    continue;
                }

                // Auto Buy if price matches
                const buyOrders = await BuyPosition.find({ stockSymbol, status: 'pending' }); //type 'buy'

                for (let order of buyOrders) {
                    if (order.buyPrice === currentStockPrice) {
                        order.status = 'executed';
                        await order.save();
                        io.emit('orderUpdated', { userId: order.userId, stockSymbol, status: 'Buy order executed' });
                    }
                }

                // Auto Sell if price matches
                const sellOrders = await SellPosition.find({ stockSymbol, sellStatus: 'pending' }); //type 'sell'
                for (let order of sellOrders) {
                    if (currentStockPrice >= order.sellPrice) {
                        const profit = (order.sellPrice - order.buyPrice) * order.quantity;

                        const history = new History({
                            userId: order.userId,
                            stockSymbol,
                            buyPrice: order.buyPrice,
                            sellPrice: order.sellPrice,
                            quantity: order.quantity,
                            profit,
                        });

                        await history.save();

                        //const buy = await BuyPosition.findOne({userId: order.userId, stockSymbol, status: 'executed'});
                        const buy = await BuyPosition.findById(order.sellId);
                        if (buy) {

                            if (buy.remainingQuantity === order.quantity) {
                                buy.status = 'closed';
                            } else {
                                buy.remainingQuantity = (buy.remainingQuantity - order.quantity);
                            }

                            await buy.save();
                        }

                        const sell = await SellPosition.findById(order._id);
                        if (sell) {
                            sell.sellStatus = 'executed';
                            await sell.save();
                        }

                        const user = await User.findById(order.userId);
                        await User.findByIdAndUpdate(user._id,
                            { $set: { balance: (user.balance + profit) } }
                        );

                        io.emit('orderUpdated', { userId: order.userId, stockSymbol, status: 'Sell order executed', profit, balance: user.balance + profit });
                    }
                }
            }
        } catch (error) {
            console.error("Error updating stock prices:", error.message);
        }

    }, 5000); // Runs every 5 seconds

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
