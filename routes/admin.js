const router = require("express").Router();
const { response, validateObjectId } = require('../middleware/response');
const { admin_decode_token } = require('../middleware/validateToken')


const { email_login_validator, forgot_validation, change_password_validation, email_otp_Validator } = require('../validator/auth');
const { cms_validation, user_device_validator } = require('../validator/common');



const auth = require("../controller/admin/auth");
const common = require('../controller/common/user');
const cms = require('../controller/admin/cms');
const user = require('../controller/admin/user');
const ticket = require('../controller/admin/support_ticket');
const category = require('../controller/admin/category');
const services = require('../controller/admin/services');
const user_services = require('../controller/users/services');
const subscription = require('../controller/admin/subscription_plan');



// authentication routes
router.post("/register", auth().register, response);
router.post("/login", email_login_validator, auth().login, response);
router.post("/forgot_password", forgot_validation, auth().forgot_password, response);
router.post("/verify_otp", email_otp_Validator, auth().verify_user_otp, response);
router.put("/reset_password",admin_decode_token, auth().reset_password, response);
router.put("/change_password", admin_decode_token, change_password_validation, auth().change_password, response);
router.post('/update_device_token', admin_decode_token, user_device_validator, common().update_device_token, response);
router.get("/logout", admin_decode_token, common().logout, response);
router.get("/get_credential", common().getS3Credentials, response);


// category routes 
router.post("/add_category", admin_decode_token, category().add_update, response);
router.put("/edit_category", admin_decode_token, validateObjectId, category().add_update, response);
router.get("/category_detail", admin_decode_token, validateObjectId, category().details, response);
router.get("/category_list", admin_decode_token, category().get_list, response);
router.patch("/change_category_status", admin_decode_token, validateObjectId, category().change_status, response);
router.patch("/remove_category", admin_decode_token, validateObjectId, category().remove, response);


// subscription routes 
router.post("/add_subscription", admin_decode_token, subscription().add_update, response);
router.put("/edit_subscription", admin_decode_token, validateObjectId, subscription().add_update, response);
router.get("/subscription_detail", admin_decode_token, validateObjectId, subscription().details, response);
router.get("/subscription_list", admin_decode_token, subscription().get_list, response);
router.patch("/change_subscription_status", admin_decode_token, subscription().change_status, response);
router.patch("/remove_subscription", admin_decode_token, validateObjectId, subscription().remove, response);


// Manage user
router.get('/user_list', admin_decode_token, user().get_list, response);
router.get('/user_detail', admin_decode_token, user().details, response);
router.patch("/update_user_status", admin_decode_token, validateObjectId, user().active_inactive, response);
router.patch("/remove_user", admin_decode_token, validateObjectId, user().remove, response);


// Manage support ticket
router.get('/ticket_list', admin_decode_token, ticket().get_list, response);
router.get('/ticket_detail', admin_decode_token, ticket().details, response);
router.patch("/update_ticket_status", admin_decode_token, validateObjectId, ticket().change_status, response);


// manage service routes
router.get("/service_detail", admin_decode_token, validateObjectId, user_services().details, response);
router.get("/service_list", admin_decode_token, services().get_list, response);
router.patch("/approved_reject_service", admin_decode_token, validateObjectId, services().approved_reject, response);
router.patch("/block_unblock_service", admin_decode_token, validateObjectId, services().block_unblock, response);


// routes for cms [ manage cms ]
router.post("/update_cms", admin_decode_token, cms_validation, cms().update_cms, response);
router.get("/cms_detail", admin_decode_token, cms().details, response);


module.exports = router;