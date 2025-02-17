const express = require('express');
const {buy, sell, getPositions, removeStockFromPositions, getHistory} = require('../controllers/PositionController')


const router = express.Router();

// ✅ Add Stock to Watchlist
router.post('/buy', buy);
router.post('/sell', sell);
router.get('/get/:id', getPositions);
router.get('/history/get/:id', getHistory);
router.delete('/remove/:id', removeStockFromPositions);
// ✅ Get User Watchlist
//router.get('/get/:userId', getWatchlist);

// // ✅ Remove Stock from Watchlist
//router.delete('/remove', removeFromWatchlist);

module.exports = router;
