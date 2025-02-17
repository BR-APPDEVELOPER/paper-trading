const Position = require('../models/Position');
const History = require('../models/History');


const buy = async (req, res) => {
    const { userId, stockSymbol, buyPrice, quantity, currentStockPrice } = req.body;

    try {
        let status = 'pending';
        if (buyPrice === currentStockPrice) {
            status = 'executed';
        }

        const position = new Position({
            userId,
            stockSymbol,
            buyPrice,
            quantity,
            status,
        });

        await position.save();
        res.json({success:true, message: 'Order placed successfully', position });
    } catch (err) {
        res.status(500).json({success:false, error: err.message });
    }
};

// ✅ Get User Watchlist
const sell = async (req, res) => {
    const { userId, stockSymbol, sellPrice, marketPrice} = req.body;

    try {
        
        const position = await Position.findOne({ userId, stockSymbol, status: 'executed' });
        
        if (!position) {
            return res.json({ message: 'No purchased stock found to sell' });
        }

        if (sellPrice <= marketPrice) {
            // Sell immediately
            await Position.findOneAndDelete({ _id: position._id });

            const profit = (sellPrice - position.buyPrice) * position.quantity;

            const history = new History({
                userId,
                stockSymbol,
                buyPrice: position.buyPrice,
                sellPrice,
                quantity: position.quantity,
                profit,
            });

            await history.save();
            return res.json({ message: 'Stock sold successfully', history });
        } else {
            // If price is not reached, mark status as "waiting_to_sell"
            position.sellStatus = true;
            position.sellPrice = sellPrice;
            await position.save();
            return res.json({ message: 'Sell order placed, waiting for price to reach' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPositions = async (req, res)=>{
    const id = req.params.id
    try {
        const positions = await Position.find({userId: id});
        if(!positions){
            return res.status(400).json({message: 'NO Data found'});
        }

        return res.status(200).json({positions});
    } catch (error) {
        console.log("Error getting positions",error.message);
        
    }
};

const getHistory = async (req, res)=>{
    const id = req.params.id
    try {
        const history = await History.find({userId: id});
        if(!history){
            return res.status(400).json({message: 'NO Data found'});
        }

        return res.status(200).json({history});
    } catch (error) {
        console.log("Error getting positions",error.message);
        
    }
};


// ✅ Remove Stock from Watchlist
const removeStockFromPositions = async (req, res) => {
    const id = req.params.id;

    try {
        const deletes = await Position.findByIdAndDelete(id);

        if(!deletes){
            return res.status(404).json({success:false, message: 'No data found' });
        }

        res.status(200).json({success:true, message: 'Order cancelled from postions'});
    } catch (error) {
        res.status(500).json({success:false, error: error.message });
    }
};

module.exports = {buy, sell, getPositions, removeStockFromPositions, getHistory};
