const mongoose = require('mongoose');
const PositionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stockSymbol: { type: String, required: true },
    buyPrice: { type: Number, required: true },
    sellPrice: {type: Number, default: 0},
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'executed'], default: 'pending' }, // 'waiting' if not matched yet
    sellStatus: { type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Position', PositionSchema);
