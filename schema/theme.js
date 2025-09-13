const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId

const theme_schema = new Schema({
  
  // Basic Info :-
  uniq_id           : { type : String,    default: ""    },
  title             : { type : String,    default: ""    },
  description       : { type : String,    default: ""    },
  category_id       : { type : ObjectId,  default: null, ref:"categories" },
  thumbnail         : [{ url : {type :    String }}],

  // Meta Info :-
  meta_title        : { type : String,    default: ""    },
  meta_description  : { type : String,    default: ""    },
  keywords          : { type : String,    default: ""    },
  canonical_url     : { type : String,    default: ""    },
  robots_meta_tag   : { type : String,    default: ""    },
  json_ld           : { type : String,    default: ""    },
  heading           : { type : String,    default: ""    },
  images_alt_text   : { type : String,    default: ""    },

  
  // other manging keys :-
  is_active         : { type : Boolean,   default: true  },
  is_deleted        : { type : Boolean,   default: false },
  is_draft          : { type : Boolean,   default: false },
},
{timestamps : true});

theme_schema.index({ category_id: 1});

var themes = mongoose.model("themes", theme_schema);
module.exports = themes;
   