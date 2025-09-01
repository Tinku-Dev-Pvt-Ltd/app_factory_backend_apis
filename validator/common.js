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

module.exports = {
    cms_validation,
    user_device_validator,
    status_validation
}