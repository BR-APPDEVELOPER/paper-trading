import React, { useEffect, useState } from 'react';
import '../css/Orders.css';
import axios from 'axios';
import io from "socket.io-client";
import { LiaEditSolid } from "react-icons/lia";
import ModifyAmount from './ModifyAmount';

const socket = io(process.env.REACT_APP_WEB_URL); // server URL

const Orders = ({ title, selectedStock, getPositions, positions }) => {
    //const [positions, setPositions] = useState([]);
    const [data, setSymbolData] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [orders, setOrders] = useState([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedPositionId, setSelectedPositionId] = useState();
    const [price, setPrice] = useState();
    const [qty, setQty] = useState();
    const [stockName, setStockName] = useState();
    const [type, setType] = useState();

    useEffect(() => {
        // Listen for 'orderUpdated' event from server side
        socket.on("orderUpdated", (data) => {
            setOrders(data);
            getPositions();
            user.balance = data?.balance || user.balance;
            sessionStorage.setItem("user", JSON.stringify(user));
            alert(data.stockSymbol + " " + data.status);
        });


        return () => {
            socket.off("orderUpdated"); // Cleanup event listener
        };
    }, []);

    const modifyPriceAndQty = async (newPrice, newQty) => {

        let newBalance = 0;

        if (type === "buy") {
            let oldInvestment = price * qty;
            let newInvestment = newPrice * newQty;
            let difference = oldInvestment - newInvestment;

            if (newPrice === price && newQty === qty) {
                alert("No changes done.")
                return;
            }

            newBalance = user.balance + difference;
            if (newBalance < 0) {
                alert("Insufficient account balance.");
                return;
            }
        }

        try {
            const res = await axios.patch(`${process.env.REACT_APP_WEB_URL}/api/position/modify/${selectedPositionId}`, {
                modifiedPrice: newPrice,
                modifiedQty: newQty,
                type
            });


            if (res.data.success) {
                if (type === "buy") {
                    await updateBalance(newBalance);
                    user.balance = newBalance;
                    sessionStorage.setItem("user", JSON.stringify(user));
                }
                getPositions();
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

    //cancel order from orders
    async function cancelOrder(id, price, qty) {
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
    };

    useEffect(() => {
        getPositions();
    }, []);


    return (
        <div className="orders">
            <h2>{title}</h2>
            <div className='orders-data'>
                {positions.length > 0 ?
                    <>
                        {
                            positions.map((position, index) => (
                                <div key={index} className={position.status === 'executed' ? "position-item executed-color" : "position-item pending-color"} onClick={() => selectedStock(position.stockSymbol)}>

                                    <label className='position-symbol'>{position.stockSymbol.toUpperCase()}</label>
                                    <div className='details'>

                                        {position.type === "buy" ?
                                            <>
                                                <label className='order-type type-buy'>{position.type.toUpperCase()}</label>
                                                <label className={position?.status === "executed" || position?.status === "closed" ? "status status-executed" : "status status-pending"}>
                                                    {position?.status === "executed" || position?.status === "closed" ? "EXECUTED" : "PENDING"}
                                                </label>
                                            </>
                                            :
                                            <>
                                                <label className='order-type type-sell'>{position.type.toUpperCase()}</label>
                                                <label className={position?.sellStatus === "executed" ? "status status-executed" : "status status-pending"}>
                                                    {position?.sellStatus?.toUpperCase()}
                                                </label>
                                            </>
                                        }

                                        <label className='buy-price'>{position.type === "buy" ? `B:${position?.buyPrice.toFixed(1)}` : `S:${position?.sellPrice.toFixed(1)}`}</label>
                                        <label className='buy-qty'>Q:{position.quantity}</label>
                                        <LiaEditSolid className={position?.status === "executed" || position?.status === "closed" || position?.sellStatus === "executed" ? 'edit-price disable' : 'edit-price'} onClick={() => {
                                            setDialogOpen(true);
                                            setSelectedPositionId(position._id);
                                            setPrice(position.type === "buy" ? position?.buyPrice : position?.sellPrice);
                                            setQty(position.quantity);
                                            setStockName(position.stockSymbol);
                                            setType(position.type);
                                        }} />
                                    </div>
                                    {position?.status === "pending" || position?.sellStatus === "pending" ? <>
                                        <button className="btn-cancel" onClick={() => cancelOrder(position._id, position.buyPrice, position.quantity)}>Cancel</button></>
                                        : <></>
                                    }
                                </div>
                            ))
                        }
                    </>
                    : <p>No orders</p>}
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

export default Orders;