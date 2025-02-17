import React,{useEffect, useState} from "react";
import axios from "axios";
import "../css/History.css"; // Import the CSS file

const History = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [history, setHistory] = useState([]);

    async function getHistory() {
        try {
            const res = await axios.get(`${process.env.REACT_APP_WEB_URL}/api/position/history/get/${user._id}`);
            setHistory(res.data.history);

        } catch (error) {
            console.log("Error getting data", error.message);

        }
    };
    
    useEffect(()=>{
        getHistory();
    },[]);

    return (
        <div className="history-container">
            <h2 className="history-title">Transaction History</h2>
            <div className="table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Stock Symbol</th>
                            <th>Buy Price (₹)</th>
                            <th>Sell Price (₹)</th>
                            <th>Quantity</th>
                            <th>Profit/Loss (₹)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item._id}>
                                <td>{item.stockSymbol}</td>
                                <td>{item.buyPrice}</td>
                                <td>{item.sellPrice}</td>
                                <td>{item.quantity}</td>
                                <td className={item.profit >= 0 ? "profit" : "loss"}>
                                    {item.profit >= 0 ? `+₹${item.profit}` : `-₹${Math.abs(item.profit)}`}
                                </td>
                                <td>{new Date(item.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
