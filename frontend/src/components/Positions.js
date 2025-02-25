import React, { useEffect, useState } from 'react';
import '../css/positions.css';
import axios from 'axios';
import io from "socket.io-client";
import { LiaEditSolid } from "react-icons/lia";
import ModifyAmount from './ModifyAmount';

const socket = io(process.env.REACT_APP_WEB_URL); // Replace with your server URL

const Positions = ({ title, selectedStock, getPositions, positions }) => {
    //const [positions, setPositions] = useState([]);
    const [data, setSymbolData] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [orders, setOrders] = useState([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedPositionId, setSelectedPositionId] = useState();
    const [price, setPrice] = useState();
    const [qty, setQty] = useState();
    const [stockName, setStockName] = useState();


    // useEffect(()=>{
    //     console.log("executed", orders);
    //     alert(orders.stockSymbol + "Order Executed..");
    // },[orders]);

    useEffect(() => {
        // Listen for 'orderUpdated' event
        socket.on("orderUpdated", (data) => {
            setOrders(data);
            user.balance = data?.balance || user.balance;
            sessionStorage.setItem("user", JSON.stringify(user));
            alert(data.stockSymbol + " " + data.status);
        });


        return () => {
            socket.off("orderUpdated"); // Cleanup event listener
        };
    }, []);

    const modifyPriceAndQty = async (newPrice, newQty) => {
        let oldInvestment = price * qty;
        let newInvestment = newPrice * newQty;
        let difference = oldInvestment - newInvestment;
        
        if (newPrice === price && newQty === qty) {
            alert("No changes done.")
            return;
        }

        let newBalance = user.balance + difference;
        if (newBalance < 0 ) {
            alert("Insufficient account balance.");
            return;
        }

        try {
            const res = await axios.patch(`${process.env.REACT_APP_WEB_URL}/api/position/modify/${selectedPositionId}`, {
                modifiedPrice: newPrice,
                modifiedQty: newQty
            });

            if (res.data.success) {
                await updateBalance(newBalance);
                user.balance = newBalance;
                sessionStorage.setItem("user", JSON.stringify(user));
                setDialogOpen(false);
                alert(res.data.message);
            }
            else {
                alert("Modification Error. Try again: ", res.data.message);
            }
        } catch (error) {
            alert("Modification Error. Try again");
            console.error("Error: ", error.message);
        }


    };

    const updateBalance = async (balance) => {
        try {
            const res = await axios.patch(`${process.env.REACT_APP_WEB_URL}/api/users/${user._id}`, {
                balance
            });
        } catch (error) {

        }
    };

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

    const handleSell = async (symbol) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/position/sell`, {
                userId: user._id, // Replace with actual user ID
                stockSymbol: symbol,
                sellPrice: Number(data.regularMarketPrice),
                marketPrice: Number(data.regularMarketPrice)
            });

            user.balance = response.data.user.balance;
            sessionStorage.setItem("user", JSON.stringify(user));
            alert(response.data.message);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    // ✅ Remove Stock from Watchlist
    async function cancelOrder(id, price, qty, status, symbol) {

        if (status === "executed") {
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

            } while (true); // This ensures we exit the loop when data is valid


            await handleSell(symbol);
            getPositions();

        } else {
            console.log("2", symbol);
            try {
                const res = await axios.delete(`${process.env.REACT_APP_WEB_URL}/api/position/remove/${id}`);

                if (res.data.success) {
                    user.balance = user.balance + (price * qty);
                    sessionStorage.setItem("user", JSON.stringify(user));
                    updateBalance(user.balance);
                    getPositions();
                    alert(res.data.message);
                }
            } catch (error) {
                console.error('Error removing stock:', error);
            }
        }
    };

    useEffect(() => {
        getPositions();
    }, []);


    return (
        <div className="positions">
            <h2>{title}</h2>
            {/* Example stock items */}
            <div className='positions-data'>
                {positions.length > 0 ?
                    <>
                        {
                            positions.map((position, index) => (
                                <div key={index} className={position.status === 'executed' ? "position-item executed-color" : "position-item pending-color"} onClick={() => selectedStock(position.stockSymbol)}>

                                    <label className='position-symbol'>{position.stockSymbol.toUpperCase()}</label>
                                    <div className='details'>
                                        <label className='status'>{position.status}</label>
                                        <label className='buy-price'>B:{position.buyPrice.toFixed(1)}</label>
                                        <label className='buy-qty'>Q:{position.quantity}</label>
                                        <LiaEditSolid className='edit-price' onClick={() => {
                                            setDialogOpen(true);
                                            setSelectedPositionId(position._id);
                                            setPrice(position.buyPrice);
                                            setQty(position.quantity);
                                            setStockName(position.stockSymbol);
                                        }} />
                                    </div>
                                    <button className={position.status === 'executed' ? "btn-executed-color" : "btn-pending-color"} onClick={() => cancelOrder(position._id, position.buyPrice, position.quantity, position.status, position.stockSymbol)}> {position.status === 'executed' ? "Sell" : "Cancel"}</button>

                                </div>
                            ))
                        }
                    </>
                    : <p>No positions</p>}
            </div>

            <ModifyAmount
                isOpen={isDialogOpen}
                data={{ price, qty, stockName }}
                onClose={() => setDialogOpen(false)}
                onSubmit={(price, qty) => modifyPriceAndQty(price, qty)}
            />
        </div>
    );
};

export default Positions;