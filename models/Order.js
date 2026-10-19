const mongoose =   require('mongoose')
const OrderSchema = new mongoose.Schema({
    razorpayOrderId:{
        type: String,
        require:true,
        unique:true
    },
    amount:{
        type:Number,
        require:true
    },
    currency:{
        type:String,
        default: 'INR'
    },
    paymentStatus:{
        type:String,
        default:'created',
        enum: ['created', 'authorized', 'captured', 'failed']
    },
    razorpay_payment_id:{
        type: String,
        default: null
    }
},{timestamps:true})

module.exports = mongoose.model(
    'Order',
    OrderSchema,
    'orders'
);