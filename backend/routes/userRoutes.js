const express = require('express');
const { createUser, loginUser, updateBalance, getUserData, getStockData} = require('../controllers/userController');

const router = express.Router();

//user request
router.post('/users/signup', createUser);
router.post('/users/login', loginUser);
router.get('/users/:email', getUserData);
router.patch('/users/:id', updateBalance);
router.get('/stock/:symbol', getStockData);


module.exports = router;