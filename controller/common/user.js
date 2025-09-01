const { encrypt_data, hashPassword, uniqString, createJWT, checkPassword, send_email_otp, send_mobile_otp, verify_otp } = require('../../util/helper.js');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
require('dotenv').config();

const user_device = require("../../service/user_device.js");
const notification = require("../../service/notification.js");
const user = require("../../service/user.js");
const support_ticket = require("../../service/support_ticket.js");


module.exports = () => {

    const update_profile = async (req, res, next) => {
        console.log("\n Update profile API Hit Successfully ✅");
        try {
            let { email, mobile, country_code, password } = req.body;
            let body = req.body;
            let user_id = req.Id || null;
            console.log('\n =-=-=-=-=-=-=-=- req.body =-=-=-=-=-=-=-=- ');
            console.log(req.body)

            let email_query = { email, is_deleted: false }
            let mobile_query = { mobile, country_code, is_deleted: false }

            if (user_id != null) {
                email_query._id = { $ne: user_id };
                mobile_query._id = { $ne: user_id };
            }

            let [email_exist, mobile_exist] = await Promise.all([
                user().fetch_by_query(email_query),
                user().fetch_by_query(mobile_query)
            ]);

            if (email_exist != null) { throw ({ http_status: 409, msg: "email_exist" }) }
            if (mobile_exist != null) { throw ({ http_status: 409, msg: "mobile_exist" }) }

            let result = null;
            if (password) body.password = await hashPassword(password);

            if (user_id != null) {

                let user_data = await user().fetch(user_id);
                if (user_data == null) throw ({ http_status: 400, msg: "not_found" });

                result = await user().update({ _id: user_id }, body);
            }
            else {
                body.uniq_id = `USR${uniqString()}`

                let user_result = await user().add(body);
                await send_email_otp(email, 0, 'user', user_result._id)

                result = user_result;
            }

            req.data = result;
            req.msg = 'success';
            req.http_status = 200;

        } catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const get_profile = async (req, res, next) => {
        console.log("\n Get Profile API Hit Successfully ✅");
        try {
            let { id } = req.query;
            let role = req.role;
            let user_data = req.user_data;

            if (role == 'admin') {
                let data = await user().fetch(id);
                if (data == null) throw ({ msg: "not_found", http_status: 400 });
                user_data = data;
            }

            req.data = user_data;
            req.msg = 'success';
            req.http_status = 200;

        } catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const login_by_email = async (req, res, next) => {
        console.log("\n login api hit successfully ✅");
        try {
            var { email, password } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let user_result = await user().fetch_by_query({ email, is_deleted: false });
            if (user_result == null) { throw ({ http_status: 400, msg: "email_not_registered" }) }
            if (user_result?.is_active == false) { throw ({ http_status: 403, msg: "inactive_access" }) };

            let [token, password_verify] = await Promise.all([
                createJWT({ 'user_id': user_result._id, 'role': 'user' }),
                checkPassword(password, user_result.password)
            ]);

            if (password_verify == false) { throw ({ http_status: 400, msg: "incorrect_password" }) }

            let user_data = {
                "first_name": user_result.first_name,
                "image": user_result.image,
                "country_code": user_result.country_code,
                "mobile": user_result.mobile,
                "email": user_result.email
            }

            let res_obj = { token, user_data }

            if (user_result.email_verified == false) {
                await send_email_otp(email, 0, 'user', user_result._id);
                res_obj = { email_verified: false };
            }
            else { await user().update({ _id: user_result._id }, { last_loggedin: new Date() }) }

            req.http_status = 200;
            req.msg = "login_success";
            req.data = res_obj;
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
        }
        next();
    };

    const phone_verify = async (req, res, next) => {
        console.log("\n login api hit successfully ✅");
        try {
            var { country_code, mobile } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let user_data = await user().fetch_by_query({ country_code, mobile, is_deleted: false });
            if (user_data == null) { throw ({ http_status: 400, msg: "mobile_not_registered" }) }
            if (user_data?.is_active == false) { throw ({ http_status: 403, msg: "inactive_access" }) };

            await send_mobile_otp(country_code, mobile, 0, 'user', user_data._id);  // here 0 define as login OTP & 1 Define Singup OTP

            req.http_status = 200;
            req.msg = "otp_sent";
            req.data = {};
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
        }
        next();
    };

    const forgot_password = async (req, res, next) => {
        console.log("\n Forgot Password Doctor API Hit Successfully ✅");
        try {
            let { email } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let user_exist = await user().fetch_by_query({ email });
            if (user_exist == null) { throw ({ http_status: 401, msg: "not_found" }) }

            let token = await send_email_otp(email, 3, 'user');

            req.msg = 'otp_sent_on_mail';
            req.data = { "userid": user_exist._id, "token": token };
            req.http_status = 200;

        } catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const verify_user_otp = async (req, res, next) => {
        console.log("\n Verify OTP API Hit Successfully ✅");
        try {
            let { country_code, mobile, email, otp } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let query = { country_code, mobile };
            if (email) query = { email }

            let verify = await verify_otp(query, otp);
            console.log('verify ==>', verify)

            if (verify == null) { throw ({ http_status: 400, msg: "not_found" }) }
            if (verify && verify.msg == "otp_expired") { throw ({ http_status: 400, msg: "otp_expired" }) }
            if (verify && verify.msg == "Invalid_otp") { throw ({ http_status: 400, msg: "incorrect_otp" }) }
            if (verify && verify.msg == "otp_verified") {

                let token = await createJWT({ user_id: verify.user_id, role: verify.role });
                let user_data = await user().update({ _id: verify.user_id }, { last_loggedin: new Date(), is_otp_verified: true, email_verified:true });

                req.data = { token, verify, user_data };
                req.http_status = 200;
                req.msg = "otp_verified";
            }
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const reset_password = async (req, res, next) => {
        console.log("\n Reset Doctor Password API Hit Successfully ✅");
        try {
            let { password } = req.body;
            let id = req.Id;

            if (typeof password == 'undefined' || password == "" || !password) { throw ({ http_status: 400, msg: "password_required" }) }

            let payload = { password: await hashPassword(password) };
            let result = await user().update({ _id: id }, payload);

            if (result == null) { throw ({ http_status: 401, msg: "not_found" }) }

            req.msg = "password_changed";
            req.http_status = 200;
            req.data = {}
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const change_password = async (req, res, next) => {
        console.log("\n Change Doctor Password API Hit Successfully ✅");
        try {
            let { current_password, new_password } = req.body;
            let id = req.Id;
            let user_data = req.user_data;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let password_verify = await checkPassword(current_password, user_data.password);
            if (password_verify == false) throw ({ http_status: 400, msg: "incorrect_password" })

            new_password = await hashPassword(new_password);
            let result = await user().update({ _id: id }, { "password": new_password });

            req.msg = "password_changed";
            req.http_status = 200;
            req.data = result;
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const logout = async (req, res, next) => {
        console.log("\n logout api hit successfully ✅");
        try {
            let id = req.Id;

            let result = await user_device().update({ user_id: id }, { token: "" });

            req.msg = "logout";
            req.http_status = 200;
            req.data = result;
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const getS3Credentials = (req, res, next) => {
        console.log("\n S3 Credentails api hit successfully ✅");
        try {
            const accessKey = process.env.AWS_SECRET_ACCESS_KEY
            const keyId = process.env.AWS_ACCESS_KEY_ID
            const bucketName = process.env.AWS_BUCKET_NAME
            const region = process.env.AWS_REGION

            req.http_status = 200;
            req.msg = "success";
            req.data = encrypt_data({
                accessKey,
                keyId,
                bucketName,
                region
            })
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌=-=-=-=-=-=-=-=-❌");
            console.log(err)
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next()
    };

    const update_device_token = async (req, res, next) => {
        console.log("update device token api hit successfully ✅")
        let lang = req.lang;
        try {
            let user_id = req.Id;
            let user_type = req.role;
            let { device_token, device_id, device_type } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let payload = { device_token, device_id, device_type, user_id, user_type }
            var result = await user_device().update({ 'device_id': device_id }, payload);

            req.msg = 'success';
            req.http_status = 200;
            req.data = result;
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌=-=-=-=-=-=-=-=-❌");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {};
            req.lang = lang;
        }
        next();
    };

    const notification_count = async (req, res, next) => {
        console.log('notification count api hit successfully')
        try {
            let user_id = req.Id;

            let counts = await notification().count({ is_read: false, user_id });

            req.http_status = 200;
            req.data = counts;
            req.msg = "success";

        } catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const social_login = async (req, res, next) => {
        console.log("\n login api hit successfully ✅");
        try {
            let { social_id, social_type, email, image, first_name } = req.body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let query = { email, is_deleted: false, is_active: true };
            let payload = { email, image, first_name, last_loggedin: new Date() };

            if (social_type == 'G') { payload.google_id = social_id; }     //# Google
            if (social_type == 'A') { payload.apple_id = social_id; }      //# Apple
            if (social_type == 'F') { payload.facebook_id = social_id; }   //# Facebook

            let user_data = await user().fetch_by_query(query);
            if (user_data?.is_active == 2) { throw ({ http_status: 403, msg: "inactive_access" }) };
            if (user_data == null) { user_data = await user().add(payload) }

            let token = await createJWT({ user_id: user_data._id, role: 'user' });

            req.http_status = 200;
            req.msg = "success";
            req.data = { token, user_data, verify: {} };
            next();

            await user().update({ _id: user_data._id }, payload)
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
            return next();
        }
    };

    const raise_ticket = async (req, res, next) => {
        console.log("\n login api hit successfully ✅");
        try {
            let { name, email, concern } = req.body

            let payload = {
                name,
                email,
                concern,
                country_code: req.user_data.country_code,
                mobile: req.user_data.mobile,
            }

            let result = await support_ticket().add(payload);

            req.http_status = 200;
            req.msg = "success";
            req.data = result;
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
        }
        next();
    }

    const delete_account = async (req, res, next) => {
        console.log("\n login api hit successfully ✅");
        try {

            await user().update({ _id: req.Id }, { is_deleted: true, is_active: 2 });

            req.http_status = 200;
            req.msg = "success";
            req.data = {};
        }
        catch (err) {
            console.log("\n ❌=-=-=-=-=-=-=-=-❌ error ❌ =-=-=-=-=-=-=-=-❌ ");
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
        }
        next();
    }

    return {
        update_profile,
        get_profile,
        login_by_email,
        phone_verify,
        forgot_password,
        verify_user_otp,
        reset_password,
        change_password,
        update_device_token,
        logout,
        social_login,
        getS3Credentials,
        notification_count,
        raise_ticket,
        delete_account
    };
}



