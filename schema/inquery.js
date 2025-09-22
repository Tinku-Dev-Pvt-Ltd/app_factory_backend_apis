const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;3

const queries_schema = new Schema({

  full_name          : { type : String,    default: ""   },
  compamy_name       : { type : String,    default: ""   },
  email              : { type : String,    default: ""   },
  country_code       : { type : String,    default: ""   },
  mobile             : { type : String,    default: ""   },
  subject            : { type : String,    default: ""   },
  message            : { type : String,    default: ""   },
  status             : { type : Number,    default: 0,   },   // 0: Pending, 1:active, 2:pause
  theme_id           : { type : ObjectId,  default: null, ref:"themes"         },
  sub_category_id    : { type : ObjectId,  default: null, ref:"sub_categories" },
  category_id        : { type : ObjectId,  default: null, ref:"categories"     },
  category_name      : { type : String,    default: ""   },
  sub_category_name  : { type : String,    default: ""   },
  staff_id           : { type : ObjectId,  default: null, ref:"staff_members"  },
},
{timestamps : true});

queries_schema.index({ theme_id: 1, sub_category_id: 1, category_id: 1 });

var user_queries = mongoose.model("user_queries", queries_schema);
module.exports = user_queries;