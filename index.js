import express from 'express';
import dotenv from 'dotenv';
import products from './product.js';
import cors from 'cors';
import razorpay from 'razorpay';

const app=express();
app.use(cors({
    origin:[
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

app.post('/order',(req,res)=>{
    
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})