const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const messages = require("../util/messages");

const response = (req, res) => {

    console.log('http_status ==>', req.http_status);
    console.log('req.msg ==>', req.msg);
    console.log('req.count ==>', req.count);

    let obj = {
        message: messages('en')[req.msg] || "",
        status_code: req.http_status == 200 ? 1 : 0,
        data: (req.data == 0 || req.data)? req.data : {}
    };

    if (typeof req.count != 'undefined') obj['count'] = req.count || 0;
    return res.status(req.http_status).json(obj);
}

const validateObjectId = async (req, res, next) => {
    try {
        console.log("AuthMiddleware => validateObjectId");

        let id = req.body?.id || req.query?.id;

        if (!id || id == "") {
            req.code = 0;
            req.http_status = 400;
            req.msg = "id_required";
            req.data = null;
            return response(req, res, next);
        }

        let isValid = ObjectId.isValid(id)
        console.log("check object id is valid or not =>", isValid)

        if (isValid == false) {
            req.code = 0;
            req.http_status = 400;
            req.msg = "invalid_id";
            req.data = null;
            return response(req, res, next);
        }
        next()
    }
    catch (err) {
        console.log(' =-=-=-=-=- error =-=-=-=-=- ')
        console.log(err)

        req.code = 0;
        req.http_status = 500;
        req.msg = "server_error";
        return response(req, res, next);
    }
};

module.exports = { response, validateObjectId }