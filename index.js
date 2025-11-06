import express from 'express';
import dotenv from 'dotenv';
import products from './product.js';

dotenv.config();

const port=process.env.PORT || 3000;


const app=express();

app.get('/',(req,res)=>{
    res.send('Server is ready to serve')
})

app.get('/api/products',(req,res)=>{
    res.json(products);
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})