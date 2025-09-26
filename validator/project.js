const { check } = require('express-validator');

const assign_theme = [

    check("customer_id", "customer_id_required").notEmpty(),
    check("customer_id", "invalid_customer_id").isMongoId(),
    check("theme_id", "theme_id_required").notEmpty(),
    check("theme_id", "invalid_theme_id").isMongoId()
];

module.exports = {
    assign_theme
}

