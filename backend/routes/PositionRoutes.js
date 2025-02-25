const express = require('express');
const {buy, sell, getPositions, removeStockFromPositions, getHistory, modifyPriceAndQty} = require('../controllers/PositionController')


const router = express.Router();

// ✅ Add Stock to Watchlist
router.post('/buy', buy);
router.post('/sell', sell);
router.get('/get/:id', getPositions);
router.get('/history/get/:id', getHistory);
router.delete('/remove/:id', removeStockFromPositions);
router.patch('/modify/:id', modifyPriceAndQty);
// ✅ Get User Watchlist
//router.get('/get/:userId', getWatchlist);

// // ✅ Remove Stock from Watchlist
//router.delete('/remove', removeFromWatchlist);

module.exports = router;
