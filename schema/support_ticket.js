const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const support_ticket = new Schema({

  name          : { type : String,   default: ""    },
  email         : { type : String,   default: ""    },
  country_code  : { type : String,   default: ""    },
  mobile        : { type : String,   default: ""    },
  concern       : { type : String,   default: ""    },
  admin_reply   : { type : String,   default: ""    },
  is_resolved   : { type : Boolean,  default: false },
},
{timestamps : true});

var support = mongoose.model("support_tickets", support_ticket);
module.exports = support;
   