import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    orderId:{type:String,required:true},
    paymentId:{type:String},
    signature:{type:String},
    amount:{type:Number,required:true},
    currency:{type:String,default:"INR"},
    status:{type:String,default:"created"},
     cartItems: [                                 
    {
      productId: String,
      title: String,
      price: Number,
      qty: Number,
    }
  ],
   createdAt: { type: Date, default: Date.now },
})

const collection= mongoose.model("Order",orderSchema);
export default collection;