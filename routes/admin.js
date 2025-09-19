const router = require("express").Router();
const { response, validateObjectId } = require('../middleware/response');
const { admin_token } = require('../middleware/validateToken')


const { email_login_validator, forgot_validation, change_password_validation, email_otp_Validator } = require('../validator/auth');
const { cms_validation, user_device_validator } = require('../validator/common');


const auth = require("../controller/admin/auth");
const common = require('../controller/common/user');
const cms = require('../controller/admin/cms');
const user = require('../controller/admin/user');
const client = require('../controller/admin/client');
const ticket = require('../controller/admin/support_ticket');
const category = require('../controller/admin/category');
const sub_category = require('../controller/admin/sub_category');
const themes = require('../controller/admin/theme');
const staff = require('../controller/admin/staff');
const subscription = require('../controller/admin/subscription_plan');



// authentication routes
router.post("/register", auth().register, response);
router.post("/login", email_login_validator, auth().login, response);
router.post("/forgot_password", forgot_validation, auth().forgot_password, response);
router.post("/verify_otp", email_otp_Validator, auth().verify_user_otp, response);
router.put("/reset_password", admin_token, auth().reset_password, response);
router.put("/change_password", admin_token, change_password_validation, auth().change_password, response);
router.post('/update_device_token', admin_token, user_device_validator, common().update_device_token, response);
router.get("/logout", admin_token, common().logout, response);


// category routes 
router.post("/category", admin_token, category().add_update, response);
router.put("/category", admin_token, validateObjectId, category().add_update, response);
router.get("/category_list", admin_token, category().get_list, response);
router.get("/category/:id", admin_token, validateObjectId, category().details, response);
router.patch("/category/:id", admin_token, validateObjectId, category().change_status, response);
router.delete("/category/:id", admin_token, validateObjectId, category().remove, response);


// sub category routes 
router.post("/sub_category", admin_token, sub_category().add_update, response);
router.put("/sub_category", admin_token, validateObjectId, sub_category().add_update, response);
router.get("/sub_category_list", admin_token, sub_category().get_list, response);
router.get("/sub_category/:id", admin_token, validateObjectId, sub_category().details, response);
router.patch("/sub_category/:id", admin_token, validateObjectId, sub_category().change_status, response);
router.delete("/sub_category/:id", admin_token, validateObjectId, sub_category().remove, response);


// staff member routes 
router.post("/staff", admin_token, staff().add_update, response);
router.put("/staff", admin_token, validateObjectId, staff().add_update, response);
router.get("/staff_list", admin_token, staff().get_list, response);
router.get("/staff/:id", admin_token, validateObjectId, staff().details, response);
router.patch("/staff/:id", admin_token, validateObjectId, staff().change_status, response);
router.delete("/staff/:id", admin_token, validateObjectId, staff().remove, response);


// subscription routes 
router.post("/subscription", admin_token, subscription().add_update, response);
router.put("/subscription", admin_token, validateObjectId, subscription().add_update, response);
router.get("/subscription_list", admin_token, subscription().get_list, response);
router.get("/subscription/:id", admin_token, validateObjectId, subscription().details, response);
router.patch("/subscription/:id", admin_token, subscription().change_status, response);
router.delete("/subscription/:id", admin_token, validateObjectId, subscription().remove, response);


// Manage user
router.get('/user_list', admin_token, user().get_list, response);
router.get('/user/:id', admin_token, user().details, response);
router.patch("/user/:id", admin_token, validateObjectId, user().active_inactive, response);
router.delete("/user/:id", admin_token, validateObjectId, user().remove, response);


// Manage client
router.post("/client", admin_token, client().update_client, response);
router.put("/client", admin_token, validateObjectId, client().update_client, response);
router.get('/client_list', admin_token, client().get_list, response);
router.get('/client/:id', admin_token, client().details, response);
router.patch("/client/:id", admin_token, validateObjectId, client().active_inactive, response);
router.delete("/client/:id", admin_token, validateObjectId, client().remove, response);


// Manage support ticket
router.get('/ticket_list', admin_token, ticket().get_list, response);
router.get('/ticket/:id', admin_token, ticket().details, response);
router.patch("/ticket/:id", admin_token, validateObjectId, ticket().change_status, response);


// manage service routes
router.post("/theme", themes().add_update, response);
router.put("/theme", admin_token, validateObjectId, themes().add_update, response);
router.get("/theme_list", admin_token, themes().get_list, response);
router.get("/theme/:id", admin_token, validateObjectId, themes().details, response);
router.delete("/theme/:id", admin_token, validateObjectId, themes().remove, response);


// routes for cms [ manage cms ]
router.post("/cms", admin_token, cms_validation, cms().update_cms, response);
router.get("/cms_detail", admin_token, cms().details, response);


module.exports = router;