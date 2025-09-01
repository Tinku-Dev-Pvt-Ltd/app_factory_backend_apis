const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const cms_schema = new Schema({

  title       : { type : String,  default: ""   },
  discription : { type : String,  default: ""   },
  type        : { type : Number,  default : 0   }
},
{timestamps : true});

var cms = mongoose.model("cms", cms_schema);
module.exports = cms;
   