const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { validationResult } = require('express-validator');
let assign_product = require('../../service/assign_product');

module.exports = () => {


    const add_update = async (req, res, next) => {
        console.log('add_update assign_product function call successfully');
        try {
            let body = req.fields;
            let { id } = body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }


            let result = null;
            if (!id) { result = await assign_product().add(body); }
            else {
                let data = await assign_product().update({ _id: id }, body);
                if (data == null) { throw ({ http_status: 400, msg: "not_found" }) }
                result = data;
            }

            req.data = result;
            req.http_status = 200;
            req.msg = "data_updated";
        }
        catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = null
        }
        next();
    };

    const get_list = async (req, res, next) => {
        console.log("assign_product listing api hit successfully");
        try {
            let { page, limit, status, customer_id } = req.query;
            let role = req.role;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page != null && limit != null) skip = parseInt((page - 1) * limit);

            let query = {};
            if (status) query.is_active = status == 'true' ? true : status == 'false' ? false : true;
            if (role == 'user') query.is_active = true;
            if (customer_id) query.customer_id = new ObjectId(customer_id);

            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let paginantion = skip != null ? [{$skip:skip},{$limit:limit}] : [];
            let [result, count] = await Promise.all([
                assign_product().get_all(query, paginantion),
                assign_product().count(query)
            ]);

            req.msg = "fetched_data";
            req.http_status = 200;
            req.data = result;
            req.count = count;
        }
        catch (err) {
            console.log("\n =-=-=-=-=-=-= error =-=-=-=-=-=-= ")
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = null
        }
        next();
    };

    const remove = async (req, res, next) => {
        try {
            let { id } = req.params;

            let data = await assign_product().remove(id);
            if (data == null) { throw ({ http_status: 400, msg: "not_found" }) }

            req.msg = "data_deleted";
            req.http_status = 200;
            req.data = data;

        } catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = null
        }
        next();
    };

    const change_status = async (req, res, next) => {
        console.log('get assign_product stauts change function call');
        try {
            let { id } = req.params;
            let { status } = req.fields;

            if (!status) { throw ({ http_status: 400, msg: "status_required" }) }

            let result = await assign_product().update(id, { is_active: status });
            if (result == null) { throw ({ http_status: 400, msg: "not_found" }) }

            req.http_status = 200;
            req.msg = "fetched_data";
            req.data = result
        }
        catch (err) {
            console.log("\n =-=-=-=-=-=-= error =-=-=-=-=-=-= ")
            console.log(err)

            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = null
        }
        next();
    };


    return {
        add_update,
        change_status,
        get_list,
        remove
    }
}