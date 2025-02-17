const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require("axios");

const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create a new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ username, email, password: hashedPassword });

        // Return success response
        res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMath = await bcrypt.compare(password, user.password);
        if (!isMath) {
            return res.status(401).json({ success: false, message: "Invalid username and password" });
        }

        const token = jwt.sign({ userId: user._id }, "hi_da", { expiresIn: "2h" });
        res.status(200).json({ success: true, message: "Login in success", token, user });
    } catch (error) {
        console.error("Error in login", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getUserData = async (req, res) => {
    const email = req.params.email;
    console.log(email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false });
        }

        return res.json({ success: true, user });
    } catch (error) {

    }
};

const getStockData = async (req, res) => {
    try {
        const symbol = req.params.symbol;
        if (!symbol) {
            return res.status(400).json({ error: "Stock symbol is required" });
        }

        //console.log("Fetching data for:", symbol);

        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`,
        );
        // const response = await axios.get(
        //     `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1mo`,
        // );
        // console.log("Response received:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
};

const updateBalance = async (req, res) => {
    const { balance } = req.body;
    const id = req.params.id;

    try {
        const updated = await User.findByIdAndUpdate(id,
            { $set: { balance } });
        
            return res.status(200).json({message:"Balance updated"});
    } catch (error) {

    }
}
module.exports = { createUser, loginUser, getUserData, getStockData, updateBalance };