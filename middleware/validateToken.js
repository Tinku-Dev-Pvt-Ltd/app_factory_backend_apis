const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const admin = require('../service/admin');
const user = require('../service/user');
const { response } = require('../middleware/response');

const admin_decode_token = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (token == "" || !token) { return res.status(401).json({ status_code: 0, message: "invalid_token", data: {} }) };

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        console.log("decode ==========>", decode)

        let user_data = await admin().fetch_by_query({ _id: decode.user_id });
        if (user_data == null) { return res.status(403).json({ message: "access_denied",status_code: 0, data:{} }) }

        req.Id = user_data._id;
        req.data = user_data;
        req.role = "admin";
        req.lang = 'en';

        next()
    }
    catch (error) {
        console.log(error)
        req.msg = error.msg || error.name == "JsonWebTokenError" ? "access_denied" : error.name;
        req.http_status = error.name === 'TokenExpiredError' ? 498 : error.name == "JsonWebTokenError" ? 403 :error.http_status;
        req.data = {};
        req.lang = 'en';

        return response(req, res);
    }
}

const user_authenticate = async (req, res, next) => {
    console.log(' =-=-=-=-=-=- user auth middleware call =-=-=-=-=-=- ')
    try {
        const token = req.headers.token;
        if (token == "" || !token) { throw ({ msg: "invalid_token", http_status: 400 }) }

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        console.log("\n =-=-=-=-=-=-=-=- decode token =-=-=-=-=-=-=-=- ");
        console.log(decode);

        let user_data = await user().fetch(decode.user_id);

        if (user_data == null) { throw ({ msg: "invalid_token", http_status: 403 }) }
        if (user_data?.is_active == 2) { throw ({ http_status: 403, msg: "inactive_access" }) };

        req.Id   = user_data._id;
        req.role = "user";
        req.user_data = user_data;

        next()
    }
    catch (error) {
        console.log(error)
        req.msg = error.msg || error.name == "JsonWebTokenError" ? "access_denied" : error.name;
        req.http_status = error.name === 'TokenExpiredError' ? 498 : error.name == "JsonWebTokenError" ? 403 :error.http_status;
        req.data = {};
        req.lang = 'en';

        return response(req, res)
    }
}

const optional_token = async (req, res, next) => {
    console.log('optional token call');
    try {
        const token = req.headers.token;
        if (token == "" || !token) return next();

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        console.log("\n =-=-=-=-=-=-=-=- decode token =-=-=-=-=-=-=-=- ");
        console.log(decode);

        let result = await user().fetch(decode.user_id);
        if (result == null) return next();

        console.log("\n =-=-=-=-=-=-=-=- decode result =-=-=-=-=-=-=-=- ");
        console.log(result);

        req.role = 'user';
        req.Id = result._id;
        req.user_data = result;
        next()

    } catch (error) {
        console.log('\n =-=-=-=--=-=- error =-=-=-=--=-=- ');
        console.log(error);

        req.msg = error.msg || error.name == "JsonWebTokenError" ? "access_denied" : error.name;
        req.http_status = error.name === 'TokenExpiredError' ? 498 : error.name == "JsonWebTokenError" ? 403 :error.http_status;
        req.data = {};
        req.lang = 'en';

        return response(req, res)
    }
}

module.exports = {
    admin_decode_token,
    optional_token,
    user_authenticate
}