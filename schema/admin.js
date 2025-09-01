const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const adminSchema = new Schema({

  name          : { type: String,  default  : ""     },
  email         : { type: String,  required : true   },
  password      : { type: String,  required : true   },
  device_token  : { type: String,  default  : ""     },
},
{ timestamps: true });

var Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
