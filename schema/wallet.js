const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const user_wallet = new Schema({
 
  user_id              : { type : ObjectId,  default: null,  ref:"users" },
  wallet_amount        : { type : Number,    default: 0      },
},
{timestamps : true});

// Index keys :-
user_wallet.index({ user_id: 1 });

var wallet = mongoose.model("user_wallets", user_wallet);
module.exports = wallet;
   