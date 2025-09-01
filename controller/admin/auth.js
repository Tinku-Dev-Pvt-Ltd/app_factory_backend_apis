const { createJWT, generateOTP, hashPassword, verify_otp, checkPassword, send_email_otp } = require("../../util/helper.js");
const { validationResult } = require('express-validator');

const admin_service = require("../../service/admin.js");

module.exports = () => {

  const register = async (req, res, next) => {
    try {
      let { email, password, name } = req.body;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      let query = { email };
      let is_admin = await admin_service().fetch_by_query(query);
      if (is_admin) { throw ({ http_status: 409, msg: "email_exist" }) }
      else {
        password = await hashPassword(password);

        data = { email, password, name };

        let admin = await admin_service().registerAdmin(data);
        let token = await createJWT({ 'id': admin._id, isAdmin: true, role: "admin" });
        let result = await admin_service().update_by_id(admin._id, { token });

        req.data = result;
        req.msg = 'Success';
        req.code = 1;
        req.http_status = 200;
      }
    } catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = {}
    }
    next();
  };

  const login = async (req, res, next) => {
    try {
      var { email, password } = req.body;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      let admin = await admin_service().fetch_by_query({ email });
      if (admin == null) { throw ({ http_status: 401, msg: "not_found" }) }

      let passwordVerify = await checkPassword(password, admin.password);
      if (passwordVerify == false) { throw ({ http_status: 401, msg: "incorrect_password" }) }

      let token = await createJWT({ user_id: admin._id, role: "admin" })

      req.http_status = 200;
      req.msg = "login_success";
      req.data = token;
    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
    }
    next();
  };

  const forgot_password = async (req, res, next) => {
    try {
      let { email } = req.body;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      let admin = await admin_service().fetch_by_query({ email });
      if (admin == null) { throw ({ http_status: 401, msg: "not_found" }) }

      let token = await send_email_otp(email,3,'admin', admin._id);

      req.msg = 'otp_sent_on_mail';
      req.data = { "userid": admin._id, "token": token };
      req.http_status = 200;

    } catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = {}
    }
    next();
  };

  const verify_user_otp = async (req, res, next) => {
    try {
      let { email, otp } = req.body;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      let verify = await verify_otp({email}, otp);
      if (verify && verify.msg == "otp_expired") { throw ({ http_status: 400, msg: "otp_expired" }) }
      if (verify && verify.msg == "Invalid_otp") { throw ({ http_status: 400, msg: "incorrect_otp" }) }

      let is_admin = verify.role == 'admin' ? true : false;
      let token = await createJWT({ user_id: verify.user_id, role: verify.role, isAdmin: is_admin });

      req.data = { token, verify };
      req.http_status = 200;
      req.msg = "otp_verified";

    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = {}
    }
    next();
  };

  const reset_password = async (req, res, next) => {
    console.log('reset password function call successfully')
    try {
      let { password } = req.body;
      let userId = req.Id;

      if (!password) { throw ({ http_status: 400, msg: "password_required" }) }

      let encrypt_password = await hashPassword(password);
      let result = await admin_service().update_by_id(userId, { password: encrypt_password });

      req.msg = "password_changed";
      req.http_status = 200;
      req.data = result;
    }
    catch (err) {
      console.log("\n =-=-=-=-=-=-=-=- error =-=-=-=-=-=-=-=- ");
      console.log(err)

      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = {}
    }
    next();
  };

  const change_password = async (req, res, next) => {
    console.log("AdminController => changePassword");
    try {
      let { current_password, new_password } = req.body;
      let id = req.Id;
      let data = req.data

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      let password_verify = await checkPassword(current_password, data.password);
      if (password_verify == false) throw ({ http_status: 400, msg: "incorrect_password" })

      new_password = await hashPassword(new_password);
      await admin_service().update_by_id(id, { "password": new_password });

      req.msg = "password_changed";
      req.http_status = 200;
    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = {}
    }
    next();
  };

  return {
    register,
    login,
    forgot_password,
    verify_user_otp,
    reset_password,
    change_password,
  }

}



