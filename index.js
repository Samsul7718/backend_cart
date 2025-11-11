import express from 'express';
import dotenv from 'dotenv';
import products from './product.js';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';

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
  const options=req.body;
  const order=await razorpay.orders.create(options);
  if(!order){
    return res.status(500).send("Some error occured");
  }

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
        return res.status(400).send("Invalid transaction signature");
    }
    res.json({
        msg:"success",
        orderId:razorpay_order_id,
        paymentId:razorpay_payment_id
    })
  
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})