const mongoose = require("mongoose");

const DateGenerator = require("../utils/DateGenerator")

const withdrawalSchema = new mongoose.Schema({

    writer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        required:true,
    },
    phoneNo:{
        type:String,
        required:true,
    },
    pending:{
        type:Boolean,
        default:false,
    },
    requestedOn:{
        type:String,
        default:DateGenerator()
    }

})


const Withdrawal = mongoose.model("Withdrawal",withdrawalSchema);

module.exports = Withdrawal;