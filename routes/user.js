const router = require("express").Router();
const { response, validateObjectId } = require('../middleware/response');
const { user_authenticate, optional_token } = require('../middleware/validateToken');

// validators :-
const { email_otp_Validator, social_login_validator, email_login_validator } = require('../validator/auth');
const { user_device_validator } = require("../validator/common");


// Controller :- 
const auth = require('../controller/common/user');
const cms = require('../controller/admin/cms');
const notification = require('../controller/common/notification');
const services = require('../controller/users/services');
const category = require('../controller/admin/category');
const subscription = require('../controller/admin/subscription_plan');



// authentication routes
router.post("/update_profile", optional_token, auth().update_profile, response);
router.post("/login", email_login_validator, auth().login_by_email, response);
router.post("/social_login", social_login_validator, auth().social_login, response);
router.post("/verify_otp", email_otp_Validator, auth().verify_user_otp, response);
router.post('/update_device_token', user_device_validator,user_authenticate, auth().update_device_token, response);
router.get("/get_profile", user_authenticate, auth().get_profile, response);
router.post('/raise_ticket', user_authenticate, auth().raise_ticket, response);
router.delete('/delete_account', user_authenticate, auth().delete_account, response);
router.post("/logout", user_authenticate, auth().logout, response);


//notification routes
router.patch("/read_notification", user_authenticate, notification().read_notification, response);
router.get("/notification_list", user_authenticate, notification().list, response);
router.get("/notification_count", user_authenticate, auth().notification_count, response);


// services routes 
router.post("/add_services", user_authenticate, services().add_update, response);
router.put("/edit_services", user_authenticate, validateObjectId, services().add_update, response);
router.get("/services_detail", user_authenticate, validateObjectId, services().details, response);
router.get("/services_list", user_authenticate, services().get_list, response);
// router.get("/recent_services_list", user_authenticate, services().recent_list, response);
router.patch("/remove_services", user_authenticate, validateObjectId, services().remove, response);


//subscription routes 
router.get("/subscription_detail", user_authenticate, validateObjectId, subscription().details, response);
router.get("/subscription_list", user_authenticate, subscription().get_list, response);


// other listing and detail :-
router.get("/cms_detail", cms().details, response);
router.get("/category_list", user_authenticate, category().get_list, response);
router.get("/get_credential", user_authenticate, auth().getS3Credentials, response);



module.exports = router;