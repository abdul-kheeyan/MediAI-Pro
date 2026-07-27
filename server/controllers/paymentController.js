const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// @desc Create Razorpay Order
// @route POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    try {
        const { amount, orderType, appointmentId, items } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder_key') {
            return res.status(503).json({ message: 'Payment gateway is not configured. Please set RAZORPAY_KEY_ID in .env' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const order = await Order.create({
            user: req.user._id,
            orderType,
            appointment: appointmentId,
            items: items || [],
            totalAmount: amount,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: 'pending'
        });

        res.json({
            orderId: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            dbOrderId: order._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Verify Razorpay Payment
// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            dbOrderId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const order = await Order.findById(dbOrderId);
            if (order) {
                order.paymentStatus = 'captured';
                order.razorpayPaymentId = razorpay_payment_id;
                order.razorpaySignature = razorpay_signature;
                await order.save();

                // If it was an appointment, we could update appointment status here
                // if (order.orderType === 'appointment' && order.appointment) { ... }

                return res.status(200).json({ message: "Payment verified successfully" });
            }
        }

        res.status(400).json({ message: "Invalid signature sent!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
