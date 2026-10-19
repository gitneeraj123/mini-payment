const crypto = require('crypto');
const Order = require('./models/Order');
const express = require('express');
const mongoose = require('mongoose')
const Razorpay  =  require('razorpay')
require('dotenv').config();
// Store created orders temporarily for this learning project.
const orders = new Map();
const app = express();
const PORT = 3000;
app.use(express.static('public'));
app.use(express.json());

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb successfully connected")
    }catch(error){
        console.log("mongodb connectiong failed", error.message)
        process.exit(1)
    }
}

connectDB()

app.get('/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

const instance = new Razorpay({  key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET })

app.post('/create-order', async (req, res) => {
    try {
        const options = {
            amount: 50000,
            currency: 'INR',
            receipt: 'receipt_001'
        };
        const order = await instance.orders.create(options);
        const savedOrder = await Order.create({
            razorpayOrderId :order.id,
            amount : order.amount,
            currency: order.currency,
            paymentStatus:'created'
        })
        console.log('Order saved in MongoDB:', savedOrder.razorpayOrderId);
        res.json(order);
    } catch (error) {
        console.error('Razorpay error:', error);
        res.status(500).json({
            error: error.error?.description || error.message || 'Unable to create order'
        });
    }
});



app.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Validate request data
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            });
        }

        // 2. Find the original order in MongoDB
        const order = await Order.findOne({
            razorpayOrderId: razorpay_order_id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // 3. Verify the Razorpay signature
        const crypto = require('crypto');

        const body =
            order.razorpayOrderId + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                'sha256',
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest('hex');

        const expected = Buffer.from(expectedSignature, 'hex');
        const received = Buffer.from(razorpay_signature, 'hex');

        const isValid =
            expected.length === received.length &&
            crypto.timingSafeEqual(expected, received);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // 4. Fetch the payment details directly from Razorpay
        const payment = await instance.payments.fetch(
            razorpay_payment_id
        );

        // 5. Confirm payment matches the original order
        if (
            payment.order_id !== order.razorpayOrderId ||
            payment.amount !== order.amount ||
            payment.currency !== order.currency
        ) {
            return res.status(400).json({
                success: false,
                message: 'Payment details do not match the order'
            });
        }

        // 6. Save payment ID and actual status in MongoDB
        order.razorpayPaymentId = payment.id;
        order.paymentStatus = payment.status;
        await order.save();

        console.log('Payment ID saved:', payment.id);
        console.log('Payment status:', payment.status);

        // 7. Return success only for captured payments
        if (payment.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: 'Payment is not captured',
                paymentStatus: payment.status
            });
        }

        return res.json({
            success: true,
            message: 'Payment verified and captured',
            paymentId: payment.id,
            paymentStatus: payment.status
        });

    } catch (error) {
        console.error('Payment verification error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
