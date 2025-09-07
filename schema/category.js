const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const category_schema = new Schema({
 
  name        : { type : String,   default: ""    },
  image       : { type : String,   default: ""    },
  parent_id   : { type : ObjectId, default: null, ref: "categories" },
  is_active   : { type : Boolean,  default: true  },
  is_deleted  : { type : Boolean,  default: false },
},
{timestamps : true});

var categories = mongoose.model("categories", category_schema);
module.exports = categories;
   