const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const staff_schema = new Schema({

  name              : { type : String,  default: ""     },
  email             : { type : String,  default: ""     },
  country_code      : { type : String,  default: ""     },
  phone_no          : { type : String,  default: ""     },
  whatsapp_number   : { type : String,  default: ""     },
  password          : { type : String,  default: ""     },
  designation       : { type : String,  default: ""     },
  role              : { type : String,  default: ""     },
  create_status     : { type : Boolean, default: false  },  // we can set here permision of particualr action 
  read_status       : { type : Boolean, default: false  },  // we can set here permision of particualr action
  update_status     : { type : Boolean, default: false  },  // we can set here permision of particualr action
  delete_status     : { type : Boolean, default: false  },  // we can set here permision of particualr action
  is_active         : { type : Boolean, default: true   },
  is_deleted        : { type : Boolean, default: false  },
},
{timestamps : true});

var staff_member = mongoose.model("staff_members", staff_schema);
module.exports = staff_member;
   