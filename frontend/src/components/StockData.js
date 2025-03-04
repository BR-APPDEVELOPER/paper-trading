import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import '../css/StockData.css';

const StockData = ({ newSymbol, defaultSymbol, getWatchlist, getPositions }) => {
    const [data, setSymbolData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [symbol, setNewSymbol] = useState();
    const [buyPrice, setBuyPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [requiredAmount, setRequiredAmount] = useState();
    const [priceChange, setPriceChange] = useState();
    const [percentageChange, setPercentageChange] = useState();
    const user = JSON.parse(sessionStorage.getItem("user"));

    async function calculateRequiredAmount(e) {

        const qty = Number(e.target.value);
        setQuantity(qty);

        const amo = buyPrice * qty;
        setRequiredAmount(amo);
    };

    //Add Stock to Watchlist
    async function addToWatchlist() {
        try {
            const res = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/watchlist/add`, {
                userId: user._id,
                //stockSymbol: symbol
                stockSymbol: newSymbol || defaultSymbol

            });

            if (res.data.success) {
                getWatchlist();
                alert("Added to Watchlist");
            } else {
                alert("Not Added to Watchlist");
            }
        } catch (error) {
            console.error('Error adding stock:', error);
        }
    };

    const updateBalance = async () => {
        try {
            const res = await axios.patch(`${process.env.REACT_APP_WEB_URL}/api/users/${user._id}`, {
                balance: Number(user.balance - requiredAmount)
            });
        } catch (error) {

        }
    }


    const handleBuy = async () => {
        if (user.balance < requiredAmount) {
            alert("Warning: Your current balance is below the required amount.");
            return;
        } else if (buyPrice === "" || quantity === "" || buyPrice === 0 || quantity === 0) {
            alert("Warning: All fields are required.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/position/buy`, {
                userId: user._id,
                stockSymbol: newSymbol || defaultSymbol,
                buyPrice: Number(buyPrice),
                quantity: Number(quantity),
                currentStockPrice: Number(data.regularMarketPrice)
            });

            if (response.data.success) {
                alert(response.data.message);
                updateBalance();
                getPositions();
                user.balance = user.balance - requiredAmount;
                sessionStorage.setItem("user", JSON.stringify(user));
                setBuyPrice('');
                setQuantity('');
                setRequiredAmount(0);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const handleSell = async () => {

        if (buyPrice === "" || quantity === "" || buyPrice === 0 || quantity === 0) {
            alert("Warning: All fields are required.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/position/sell`, {
                userId: user._id,
                stockSymbol: newSymbol || defaultSymbol,
                sellPrice: Number(buyPrice),
                marketPrice: Number(data.regularMarketPrice),
                quantity
            });

            if (response.data.success && response.data.user) {
                getPositions();
                user.balance = response.data.user?.balance;
                sessionStorage.setItem("user", JSON.stringify(user));
                alert(response.data.message);
                setBuyPrice('');
                setQuantity('');

            } else if (response.data.success && !response.data.user) {
                getPositions();
                alert(response.data.message);
                setBuyPrice('');
                setQuantity('');
            } else {
                alert(response.data.message);
            }


        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    useEffect(() => {
        const symbolToFetch = newSymbol || defaultSymbol; // Use newSymbol if available, otherwise defaultSymbol
        setNewSymbol(symbolToFetch);
        console.log(newSymbol, "s:", defaultSymbol);


        const fetchStockData = async () => {
            if (!symbolToFetch) return; // Avoid fetching if no symbol is available

            try {
                const response = await axios.get(`${process.env.REACT_APP_WEB_URL}/api/stock/${symbolToFetch}`);
                const chartData = response.data.chart.result[0];

                setSymbolData(chartData.meta);

                if (!chartData || !chartData.timestamp || !chartData.indicators.quote[0]) {
                    console.error("Invalid stock data received.");
                    return;
                }

                const formattedData = chartData.timestamp.map((time, index) => ({
                    time: time,
                    open: chartData.indicators.quote[0].open[index],
                    high: chartData.indicators.quote[0].high[index],
                    low: chartData.indicators.quote[0].low[index],
                    close: chartData.indicators.quote[0].close[index],
                }));
                setChartData(formattedData);
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };

        //Fetch data every 1 second
        const intervalId = setInterval(() => {
            fetchStockData();
        }, 1000); // 1000ms = 1s

        //Cleanup interval when component unmounts or newSymbol/defaultSymbol changes
        return () => clearInterval(intervalId);
    }, [newSymbol, defaultSymbol]); //Depend on newSymbol and defaultSymbol

    useEffect(() => {
        if (!data) return; //Ensure data exists before calculating

        const previousClose = data.chartPreviousClose || 0;
        const marketPrice = data.regularMarketPrice || 0;

        const priceChange = marketPrice - previousClose;
        const percentageChange = previousClose !== 0 ? ((priceChange / previousClose) * 100).toFixed(2) : "0.00";
        setPriceChange(priceChange);
        setPercentageChange(percentageChange);

    }, [data]); // Run whenever data changes

    return (

        <div className="stock-container">
            <div className='market-details'>
                <span className='nse'>{data.fullExchangeName}</span>
                <span className='equity'>{data.instrumentType}</span>
                <button className='btn-watchlist' onClick={addToWatchlist}>Add to watchlist</button>
            </div>

            <div className="stock-header">
                <h1>{data.longName}</h1>
                <h2>{data.symbol}</h2>
            </div>

            <div className="stock-details">
                <div className="stock-price">
                    <span className="price">₹{data.regularMarketPrice}</span>
                    <span className={priceChange > 0 ? "positive change" : "negative change"}>
                        {priceChange > 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)} ({percentageChange}%)
                    </span>
                </div>

                <div className="stock-info">
                    <div className="info-item">
                        <span className="label">Market</span>
                        <span className="value">{data.exchangeName}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Currency</span>
                        <span className="value">{data.currency}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Volume</span>
                        <span className="value">{data.regularMarketVolume}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Day High</span>
                        <span className="value">
                            ₹{data.regularMarketDayHigh}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="label">Day Low</span>
                        <span className="value">
                            ₹{data.regularMarketDayLow}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">PreviousClose</span>
                        <span className="value">{data.chartPreviousClose}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">52W High</span>
                        <span className="value">₹{data.fiftyTwoWeekHigh}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">52W Low</span>
                        <span className="value">₹{data.fiftyTwoWeekLow}</span>
                    </div>

                </div>

            </div>

            <h2 className='place-order'>Place Order</h2>
            <div className="order-group">
                <input type='number' placeholder='Enter price' className='order-price' value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}></input>
                <input type='number' placeholder='Enter Qty' className='order-qty' value={quantity} onChange={(e) => calculateRequiredAmount(e)}></input>

                <button className="buy-btn" onClick={handleBuy}>Buy</button>
                <button className="sell-btn" onClick={() => handleSell()}>Sell</button>
            </div>
            <div className='amount'>
                <span>Margin Avail: {user.balance.toFixed(2)}</span>
                <span>Req: {requiredAmount?.toFixed(2) || 0}</span>
            </div>
            {/* <Chart /> */}
        </div>

    );
};

export default StockData;