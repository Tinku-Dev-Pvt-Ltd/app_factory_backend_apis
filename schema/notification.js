const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const notifyschema = new mongoose.Schema({

    title               : { type: String,   default: ""    },
    description         : { type: String,   default: ""    },
    is_read             : { type: Boolean,  default: false },
    notification_type   : { type: Number,   default: 1     }, // 1 :- user interaction
    user_id             : { type: ObjectId, default: null, ref: "user" },
    other_user_id       : { type: ObjectId, default: null, ref: "user" },
    user_img            : { type: String,   default: ""    },
    action_id           : { type: ObjectId, default: null  },
    user_type           : { type: String,   default: ""    },  // string:-  user, admin
    user_name           : { type: String,   default: ""    },
},
{ timestamps: true });

const notification = mongoose.model('notification', notifyschema);
module.exports = notification;