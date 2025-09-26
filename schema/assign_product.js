const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const client_product_schema = new Schema({

  customer_id   : { type : ObjectId,  default: null, ref:"customer" },
  theme_id      : { type : ObjectId,  default: null, ref:"themes"   },
  is_active     : { type : Boolean,   default: true  } 
},
{ timestamps : true });

var client_products = mongoose.model("client_products", client_product_schema);
module.exports = client_products;
   