const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const sub_category_schema = new Schema({
 
  name        : { type : String,   default: ""    },
  image       : { type : String,   default: ""    },
  parent_id   : { type : ObjectId, default: null, ref: "categories" },
  is_active   : { type : Boolean,  default: true  },
  is_deleted  : { type : Boolean,  default: false },
},
{timestamps : true});

// Define index
sub_category_schema.index({ parent_id: 1 });

var sub_category = mongoose.model("sub_categories", sub_category_schema);
module.exports = sub_category;
   