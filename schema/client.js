const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const client_schema = new Schema({
  
  // Personal Information :-
  first_name                 : { type: String,    default: ""     },
  last_name                  : { type: String,    default: ""     },
  country_code               : { type: String,    default: ""     },
  mobile                     : { type: String,    default: ""     },
  whatsapp_number            : { type: String,    default: ""     },
  email                      : { type: String,    default: ""     },
  status                     : { type: String,    default: ""     },
  is_active                  : { type: Boolean,   default: 1      }, 
  is_deleted                 : { type: Boolean,   default: false  },
  is_otp_verified            : { type: Boolean,   default: false  },
},
{ timestamps: true });

var clients = mongoose.model("clients", client_schema);
module.exports = clients;
   