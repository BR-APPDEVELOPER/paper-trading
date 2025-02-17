import '../css/Home.css';
import Navbar from './Navbar';
import StockData from './StockData';
import Watchlist from './Watchlist';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Positions from './Positions';

function Home() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [symbol, setSymbol] = useState('');
  const [positions, setPositions] = useState([]);
  const [watchlists, setWatchlist] = useState({});

  // Function to update stock data from Navbar
  const handleStockSearch = (newStock) => {
    setSymbol(newStock); // Add new stock to the existing data
  };

  async function getPositions() {
    try {
      const res = await axios.get(`${process.env.REACT_APP_WEB_URL}/api/position/get/${user._id}`);
      setPositions(res.data.positions);

    } catch (error) {
      console.log("Error getting data", error.message);

    }
  };

  async function getWatchlist() {
        try {
            const res = await axios.get(`${process.env.REACT_APP_WEB_URL}/api/watchlist/get/${user._id}`);
            setWatchlist(res.data.watchlist);


        } catch (error) {
            console.error('Error fetching watchlist:', error);
        }
    };


  return (
    <div >
      <Navbar onSearch={handleStockSearch} />

      <div className="container">

        <div className="watchlists">

          <Watchlist title="Watchlist 1" selectedStock={setSymbol} getWatchlist={getWatchlist} watchlists={watchlists}/>
          <Positions title="Position" selectedStock={setSymbol} getPositions={getPositions} positions={positions} />

        </div>

        <StockData newSymbol={symbol} defaultSymbol="TATAMOTORS" getWatchlist={getWatchlist}/>
      </div>
    </div>
  );
}

export default Home;
