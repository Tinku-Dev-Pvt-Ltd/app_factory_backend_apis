const { check } = require('express-validator');

const email_login_validator = [

    check("email", "email_required").notEmpty(),
    check("email", "invalid_email").isEmail(),
    check("password", "password_required").notEmpty()
];

const login_phone_validator = [

    check("country_code", "country_code_required").notEmpty(),
    check("mobile", "mobile_required").notEmpty()
];

const social_login_validator = [

    check("social_id", "social_id").notEmpty(),
    check("social_type", "social_type").notEmpty(),
    // check("email", "email_required").notEmpty(),
];

const forgot_validation = [

    check("email", "email_required").notEmpty(),
    check("email", "invalid_email").isEmail(),
];

const change_password_validation = [

    check("current_password", "current_password_required").notEmpty(),
    check("new_password", "new_password_required").notEmpty(),
];

const phone_otp_Validator = [

    check("mobile", "mobile_required").notEmpty(),
    check("otp", "otp_required").notEmpty(),
    check("otp", "invalid_otp").isNumeric(),
    check("otp", "otp_six_digit").isLength(6)
]
const email_otp_Validator = [

    check("email", "email_required").notEmpty(),
    check("otp", "otp_required").notEmpty(),
    check("otp", "invalid_otp").isNumeric(),
    check("otp", "otp_six_digit").isLength(6)
]

const device_validator = [

    check("deviceToken", "device_token_required").notEmpty(),
    check("deviceId", "device_id_required").notEmpty()
]

module.exports = {
    phone_otp_Validator,
    email_otp_Validator,
    email_login_validator,
    forgot_validation,
    change_password_validation,
    device_validator,
    login_phone_validator,
    social_login_validator
}
