const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId

const content_schema = new Schema({
  
  // Basic Info :-
  uniq_id           : { type : String,    default: ""    },
  title             : { type : String,    default: ""    },
  description       : { type : String,    default: ""    },
  scheduled_time    : { type : Date,      default: new Date() },
  category_id       : { type : ObjectId,  default: null, ref:"categories" },  
  user_id           : { type : ObjectId,  default: null, ref:"users" },
  image             : [{ url : {type :    String }}],
  
  // other manging keys :-
  total_views       : { type : Number,    default: 0     },
  is_active         : { type : Boolean,   default: true  },
  is_approved       : { type : Number,    default: 0     },  // 0 : Pending, 1: approved, 2 : reject
  is_deleted        : { type : Boolean,   default: false },
  is_draft          : { type : Boolean,   default: false },
},
{timestamps : true});

content_schema.index({ category_id: 1, user_id: 1 });

var content = mongoose.model("contents", content_schema);
module.exports = content;
   