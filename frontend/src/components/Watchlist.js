import React, { useEffect, useState } from 'react';
import '../css/Watchlist.css';
import axios from 'axios';

const Watchlist = ({ title, selectedStock, getWatchlist, watchlists }) => {
    // const [watchlists, setWatchlist] = useState({});
    const user = JSON.parse(sessionStorage.getItem("user"));

    //Remove Stock from Watchlist
    async function removeFromWatchlist(stockSymbol) {
        try {
            const res = await axios.delete(`${process.env.REACT_APP_WEB_URL}/api/watchlist/remove`, { data: { userId: user._id, stockSymbol } });
            getWatchlist();
        } catch (error) {
            console.error('Error removing stock:', error);
        }
    };

    useEffect(() => {
        getWatchlist();

    }, [watchlists]);

    return (
        <div className="watchlist">
            <h2>{title}</h2>
            <div className='watchlist-data'>
                {watchlists?.stocks?.length > 0 ? (
                    <>
                        {watchlists.stocks.map((stockSymbol, index) => (
                            <div key={index} className="stock-item" onClick={() => selectedStock(stockSymbol)}>
                                {stockSymbol.toUpperCase()} <button onClick={() => removeFromWatchlist(stockSymbol)}>Remove</button>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Loading or no stocks in your watchlist.</p>
                )}
            </div>
        </div>
    );
};

export default Watchlist;