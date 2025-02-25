const History = require('../models/History');
const User = require('../models/user');
const {Position, BuyPosition, SellPosition } = require('../models/Position');


const buy = async (req, res) => {
    const { userId, stockSymbol, buyPrice, quantity, currentStockPrice } = req.body;

    try {
        let status = 'pending';
        if (buyPrice === currentStockPrice) {
            status = 'executed';
        }

         const position = new BuyPosition({
             type:"buy",
             userId,
             stockSymbol,
             buyPrice,
             quantity,
             status,
         });

        await position.save();

        res.json({success:true, message: 'Order placed successfully', position});
    } catch (err) {
        console.log(err.message);
        
        res.status(500).json({success:false, error: err.message });
    }
};

// ✅ Get User Watchlist
const sell = async (req, res) => {
    const { userId, stockSymbol, sellPrice, marketPrice} = req.body;

    try {
        
        const position = await BuyPosition.findOne({userId, stockSymbol, status: 'executed' });
        
        if (!position) {
            return res.json({success:false, message: 'No executed stock found to sell' });
        }

        if (sellPrice <= marketPrice) {
            // Sell immediately
            const sellPosition = new SellPosition({
                type: "sell",
                userId,
                stockSymbol,
                buyPrice: position.buyPrice,
                sellPrice,
                quantity: position.quantity,
                sellStatus: 'closed',
            });

            await sellPosition.save();

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

            const user = await User.findById(userId);
            if(user){
                user.balance = user.balance + (position.buyPrice * position.quantity) + profit;
                await user.save();
            }

            return res.json({success:true, message: 'Stock sold successfully', history, user});
        } else {
            // If price is not reached, mark status as "waiting_to_sell"
            const sell = new SellPosition({
                type: "sell",
                userId,
                stockSymbol,
                buyPrice: position.buyPrice,
                sellPrice,
                quantity: position.quantity,
                sellStatus: "executed",
            });

            await sell.save();
            return res.json({success:true, message: 'Sell order placed, waiting for price to reach' });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({success:false, message: err.message });
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
        console.log("Error getting in getPositions: ", error.message);
        
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

const modifyPriceAndQty = async(req, res)=>{
    const {modifiedPrice, modifiedQty} = req.body;
    const id = req.params.id;

    try {
        const modified = await Position.findByIdAndUpdate(
            id,
            {
                $set: {buyPrice: modifiedPrice,
                quantity: modifiedQty}
            });
        
            if(!modified){
                res.status(200).json({success:false, message:"Error"});        
            }

            res.status(200).json({success:true, message:"Successfully Modified"});
    } catch (error) {
        res.status(400).json({success:false, message:"Error"});
    }
};

module.exports = {buy, sell, getPositions, removeStockFromPositions, getHistory, modifyPriceAndQty};
