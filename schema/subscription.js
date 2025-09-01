const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const subscription_schema = new Schema({
 
  title       : { type : String,  default: ""    },
  discription : { type : String,  default: ""    }, // it can be html or simple text , depends on frontend
  image       : { type : String,  default: ""    },
  duration    : { type : Number,  default: 0     }, // Months
  price       : { type : Number,  default: 0     }, 
  plan_type   : { type : Number,  default: 0     }, 
  is_active   : { type : Boolean, default: true  },
  is_deleted  : { type : Boolean, default: false },
},
{timestamps : true});

var subscription = mongoose.model("subscriptions", subscription_schema);
module.exports = subscription;
   