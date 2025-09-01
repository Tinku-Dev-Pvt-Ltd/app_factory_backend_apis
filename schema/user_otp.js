const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

const otp_schema = new Schema({

  country_code   : { type : String,    default: "+91" },              // By default it just for India
  user_id        : { type : ObjectId,  default: null, ref:"users" },  
  mobile         : { type : String,    default: ""    },
  email          : { type : String,    default: ""    },
  otp            : { type : String,    default: ""    },
  user_role      : { type : String,    default: ""    },  
  type           : { type : Number,    default: 0     },  // 0: Login, 1: Singup 
  expired_at     : { type : Date,      default: null  },  // otp expired time
},
{timestamps : true});

// OTP INDEX CREATED HERE :-
otp_schema.index({user_id : 1});

var user_otp = mongoose.model("user_otp", otp_schema);
module.exports = user_otp;
   