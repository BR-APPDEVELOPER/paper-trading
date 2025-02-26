import react, { useState, useEffect } from "react";

function ModifyAmount({ isOpen, data, onClose, onSubmit }) {
  const [modifiedPrice, setModifiedPrice] = useState("");
  const [modifiedQty, setModifiedQty] = useState("");

  useEffect(() => {
    setModifiedPrice(data?.price);
    setModifiedQty(data?.qty);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="overlay">

      <div className="dialog">
        <h2>Modify {data?.stockName}</h2>
        <label>Price</label>
        <input type="number" className="modified-buy-price" value={modifiedPrice} onChange={(e) => setModifiedPrice(e.target.value)} placeholder="Modify Amount"></input>
        <label>Qty</label>
        <input type="number" className="modified-qty-price" value={modifiedQty} onChange={(e) => setModifiedQty(e.target.value)} placeholder="Modify Qty "></input>
        <div className="buttons">
          <button onClick={() => onClose()}>Cancel</button>
          <button onClick={() => onSubmit(modifiedPrice, modifiedQty)}>Modify</button>
        </div>
      </div>

    </div>
  );
}

export default ModifyAmount;