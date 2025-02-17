const express = require('express');
const {addToWatchlist, getWatchlist, removeFromWatchlist} = require('../controllers/WatchlistControllers')


const router = express.Router();

// ✅ Add Stock to Watchlist
router.post('/add', addToWatchlist);
// ✅ Get User Watchlist
router.get('/get/:userId', getWatchlist);

// // ✅ Remove Stock from Watchlist
router.delete('/remove', removeFromWatchlist);

module.exports = router;
