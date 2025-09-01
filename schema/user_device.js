const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

const device_schema = new mongoose.Schema({

    device_id    : { type: String,   default: ""     },
    device_token : { type: String,   default: ""     },
    device_type  : { type: Number,   default: 0      },             // 1 :- ios , 2:- android
    user_id      : { type: ObjectId, default: null,  ref: "user" },
    user_type    : { type: String,   default : ""    }
},
{ timestamps: true });

// Index Key :-
device_schema.index({ "user_id": 1 });

const device = mongoose.model('user_device', device_schema);
module.exports = device;
