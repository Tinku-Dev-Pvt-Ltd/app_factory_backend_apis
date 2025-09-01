const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const user_schema = new Schema({
  
  // Personal Information :-
  uniq_id                    : { type: String,    default: ""     },
  first_name                 : { type: String,    default: ""     },
  last_name                  : { type: String,    default: ""     },
  image                      : { type: String,    default: ""     },
  country_code               : { type: String,    default: ""     },
  mobile                     : { type: String,    default: ""     },
  email                      : { type: String,    default: ""     },
  password                   : { type: String,    default: ""     },
  last_loggedin              : { type: Date,      default: null   }, 
  is_active                  : { type: Boolean,   default: 1      }, 
  is_deleted                 : { type: Boolean,   default: false  },
  is_otp_verified            : { type: Boolean,   default: false  },
  email_verified             : { type: Boolean,   default: false  },
  google_id                  : { type: String,    default: ""     }, 
  apple_id                   : { type: String,    default: ""     },
  facebook_id                : { type: String,    default: ""     },
},
{ timestamps: true });


var users = mongoose.model("users", user_schema);
module.exports = users;
   