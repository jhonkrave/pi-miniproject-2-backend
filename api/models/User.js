const mongoose = require("mongoose");

  // Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        validate: {
            validator: Number.isInteger,
        },
        min: 13,
        required: true
    },
    isActive:{
    type:Boolean,
    default:true
    },
    resetPasswordToken: {
        type: String,
        required: false,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
        default: null
    },
    loginAttempts:{
        type:Number,
        default:0
    },
    lockUntil:{
        type:Date,
        default:null
    }
    
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('User', userSchema);