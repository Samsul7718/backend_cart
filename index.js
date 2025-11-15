import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './product.js';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
// import { mongo } from 'mongoose';
import collection from './models/Orders.js'; 

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:[
        "http://localhost:3000",
   "http://localhost:5173",
    "http://localhost:5174"
    ],
  methods: ["GET", "POST"],
  credentials: true
}));
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.log("❌ MongoDB connection error:", err));

const port=process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send('Server is ready to serve')
})

app.get('/api/products',(req,res)=>{
    res.json(products);
})

app.post('/order', async (req, res) => {
    try {
  const razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
  })
    const options = {
        amount: req.body.amount * 100,       // convert rupees → paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`
        };
  const order=await razorpay.orders.create(options);
  if(!order){
    return res.status(500).send("Some error occured");
  }
//   save order to database
  const newOrder=await collection.create({
    orderId:order.id,
    amount:req.body.amount,
    currency:"INR",
    cartItems: req.body.cartItems,
    status:"created",
  });
  console.log("🟢 Order saved to DB:", newOrder._id)

  res.json(order);
   } catch (error) {
        res.status(500).send("Server error" + error);
    }
})

app.post('/order/validate',async(req,res)=>{
    //validate signature
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    const sha=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest=sha.digest('hex');
    if(digest !== razorpay_signature){
        console.log("🔴 Signature mismatch!");
        return res.status(400).send("Invalid transaction signature");
    }
      // Update order in DB after payment success
  const updatedOrder = await collection.findOneAndUpdate(
    { orderId: razorpay_order_id },
    {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "paid"
    },
    { new: true },
  );
  console.log("🟢 Payment verified & order updated:", updatedOrder);

    res.json({
        msg:"success",
        updatedOrder:updatedOrder,
        orderId:razorpay_order_id,
        paymentId:razorpay_payment_id
    })
  
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})