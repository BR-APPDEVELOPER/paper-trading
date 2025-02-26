import React, { useEffect, useState } from 'react';
import '../css/positions.css';
import axios from 'axios';

const Positions = ({ title, selectedStock, getExecutedPositions, positions }) => {
    //const [positions, setPositions] = useState([]);
    const [data, setSymbolData] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));


    const fetchStockCurrentPrice = async (symbol) => {

        try {
            const response = await axios.get(`${process.env.REACT_APP_WEB_URL}/api/stock/${symbol}`);
            const chartData = response.data.chart.result[0];

            setSymbolData(chartData.meta);

            if (!chartData || !chartData.timestamp || !chartData.indicators.quote[0]) {
                console.error("Invalid stock data received.");
                return;
            }

        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    };

    const handleSell = async (symbol, quantity) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/position/sell`, {
                userId: user._id,
                stockSymbol: symbol,
                sellPrice: Number(data.regularMarketPrice),
                marketPrice: Number(data.regularMarketPrice),
                quantity
            });

            user.balance = response.data.user.balance;
            sessionStorage.setItem("user", JSON.stringify(user));
            alert(response.data.message);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    //sell Stock from positions
    async function sellOrder(symbol, quantity) {
        var c = 1;

        do {
            // Wait for data to be fetched and updated
            await fetchStockCurrentPrice(symbol);

            // Wait for a short delay to ensure data updates
            await new Promise(resolve => setTimeout(resolve, 500));

            if (data.length !== 0) {
                break;
            }

            if (c === 10) {
                alert("Warning: Problem in Selling. Try again");
                return;
            }

            c = c + 1;

        } while (true);


        await handleSell(symbol, quantity);
        getExecutedPositions();
    };

    useEffect(() => {
        getExecutedPositions();
    }, []);


    return (
        <div className="positions">
            <h2>{title}</h2>
            <div className='positions-data'>
                {positions.length > 0 ?
                    <>
                        {
                            positions.map((position, index) => (
                                <div key={index} className={position.status === 'executed' ? "position-item executed-color" : "position-item pending-color"} onClick={() => selectedStock(position.stockSymbol)}>

                                    <label className='position-symbol'>{position.stockSymbol.toUpperCase()}</label>
                                    <div className='details'>
                                        <label className={position.type === "buy" ? 'order-type type-buy' : 'order-type type-sell'}>{position.type.toUpperCase()}</label>

                                        {position.type === "buy" ? <>
                                            <label className='buy-price'>B:{position.buyPrice.toFixed(1)}</label>
                                            <label className='buy-qty'>Q:{position.quantity}</label>
                                            <label className='buy-status'>{position.status === "executed" ? "OPEN" : "CLOSED"}</label>
                                        </>
                                            :
                                            <>
                                                <label className='buy-price'>S:{position.sellPrice.toFixed(1)}</label>
                                                <label className='buy-qty'>Q:{position.quantity}</label>
                                                <label className='buy-status'>CLOSED</label>
                                            </>
                                        }
                                    </div>

                                    {(position.type === "buy" && position.status !== "closed") && (
                                        <button className="btn-executed-color" onClick={() => sellOrder(position.stockSymbol, position.remainingQuantity)}>Sell</button>
                                    )}


                                </div>
                            ))
                        }
                    </>
                    : <p>No positions</p>}
            </div>
        </div>
    );
};

export default Positions;