# Paper Trading Stock Market Application  

A **paper trading** stock market application built using the **MERN stack** and deployed on **Render**. This platform allows users to simulate real-time trading with **NSE stock data** using the **Yahoo Finance API**, providing a risk-free environment to practice stock trading strategies.  

This project was deployed in Render [Live Demo](https://paper-trading-raj.onrender.com).

## Features  

- **User Authentication:** Register and log in securely to manage your trading account.  
- **Initial Virtual Balance:** Every new user starts with **₹10,00,000** for paper trading.  
- **Stock Search & Watchlist:** Search for NSE stocks and add them to a personal watchlist.  
- **Buy & Sell Orders:**  
  - Place **buy/sell orders** with adjustable price and quantity.  
  - Modify open orders before execution.  
  - Track executed orders in the **Positions** tab.  
- **Order Management:**  
  - View all active orders in the **Orders** tab.  
  - Modify pending orders before execution.  
- **Trade History & Profit Tracking:**  
  - Check your **buy/sell history** with profit calculations.  
  - Analyze past trades to improve trading strategies.  

## Tech Stack  

- **Frontend:** ReactJS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **API:** Yahoo Finance API  
- **Deployment:** Render  

## Installation & Setup  

Follow these steps to set up and run the project locally:  

### Clone the Repository

git clone https://github.com/BR-APPDEVELOPER/paper-trading.git

**Install Project Dependencies:** `npm install`

### Backend Setup
- Install required backend dependencies: `npm install`
- Navigate to the backend directory: `cd backend`
- Start the backend server: `node server.js`

### Frontend Setup
- Install frontend dependencies: `npm install`
- Navigate to the frontend directory: `cd frontend`
- Start the frontend application: `npm start`

### Configure MongoDB
- Create a MongoDB Atlas account and set up a new cluster.
- Set a username and password for database access.
- After creating, MongoDB Atlas will generate a connection URL, similar to:
  - `mongodb+srv://<username>:<password>@cluster0.4u4rtje.mongodb.net/`
- Use this URL to connect in MongoDB Compass if needed.

**Update the .env file in the both backend & frontend directory:**
```
  MONGO_URL=mongodb+srv://<username>:<password>@cluster0.4u4rtje.mongodb.net/
  REACT_APP_WEB_URL=http://localhost:5000
```
