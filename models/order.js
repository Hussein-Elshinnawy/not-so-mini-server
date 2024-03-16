const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        required: true,
    }],
    shippingAddress: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});
exports.Order = mongoose.model('Order', orderSchema);
