const { check } = require('express-validator');

const status_validation = [

    check(
        "id",
        "id_required")
        .notEmpty(),

    check(
        "id",
        "invalid_id")
        .isMongoId(),

    check(
        "status",
        "status_required")
        .notEmpty()
];

const cms_validation = [

    check(
        "title",
        "title_required")
        .notEmpty(),

    check(
        "type",
        "type_required")
        .notEmpty(),

    check(
        "discription",
        "discription_required")
        .notEmpty()
];

const user_device_validator = [

    // check(
    //     "device_id",
    //     "device_id_required")
    //     .notEmpty(),

    check(
        "device_type",
        "device_type_required")
        .notEmpty(),

    check(
        "device_token",
        "device_token_required")
        .notEmpty()
];

const query_validator = [

    check( "country_code",  "country_code_required") .notEmpty(),
    check( "mobile",        "mobile_required")       .notEmpty(),
    check( "theme_id",      "theme_id_required")     .notEmpty(),
    check( "theme_id",      "invalid_theme_id")      .isMongoId()
] 

const assign_staff_validator = [

    check(" staff_id", "staff_id_required")     .notEmpty(),
    check( "staff_id", "invalid_staff_id")      .notEmpty(),
    check( "query_id", "query_id_required")     .notEmpty(),
    check( "query_id", "invalid_query_id")      .isMongoId()
] 

module.exports = {
    cms_validation,
    user_device_validator,
    status_validation,
    query_validator,
    assign_staff_validator
}