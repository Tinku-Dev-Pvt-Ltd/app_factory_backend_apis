const { validationResult } = require('express-validator');
const staff = require('../../service/staff');
const { hashPassword } = require('../../util/helper');

module.exports = () => {

    const add_update = async (req, res, next) => {
        console.log("\n Update staff API Hit Successfully ✅");
        try {
            let body = req.fields;
            console.log('\n =-=-=-=-=-=-=-=- req.fields =-=-=-=-=-=-=-=- ');
            console.log(req.fields)
            let { email, mobile, country_code, id, password } = body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let email_query = { email, is_deleted: false }
            let mobile_query = { mobile, country_code, is_deleted: false }

            if (id) {
                let user_data = await staff().fetch(id);
                if (user_data == null) throw ({ http_status: 400, msg: "not_found" });

                email_query._id = { $ne: user_data._id };
                mobile_query._id = { $ne: user_data._id };
            }

            let [email_exist, mobile_exist] = await Promise.all([
                staff().fetch_by_query(email_query),
                staff().fetch_by_query(mobile_query)
            ]);

            if (email_exist != null) { throw ({ http_status: 409, msg: "email_exist" }) }
            if (mobile_exist != null) { throw ({ http_status: 409, msg: "mobile_exist" }) }
            if (password) { body.password = await hashPassword(password); }

            let result = null;
            if (id) { result = await staff().update({ _id: id }, body); }
            else { result = await staff().add(body); }

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

    const details = async (req, res, next) => {
        console.log('staff detail api hit successfully ✅');
        try {
            let { id } = req.params;

            let exist_record = await staff().fetch(id);
            if (exist_record == null) { throw ({ http_status: 400, msg: "not_found" }) }

            req.http_status = 200;
            req.msg = "fetched_data"
            req.data = exist_record

        }
        catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const get_list = async (req, res, next) => {
        console.log('staff list api hit successfully ✅');
        try {
            let { search, page, limit, status } = req.query;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page !== null && limit !== null) skip = parseInt((page - 1) * limit);

            let query = { is_deleted: false };
            if (search) query['$or'] = [
                { first_name: { $regex: search, $options: "i" } },
                { last_name: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
            ];
            if (status) query.is_active = status == 'true' ? true : status == 'false' ? false : true;

            let projection = `name email designation role is_active`

            console.log(" =-=-=-==-=-=- query =-=-=-==-=-=- ");
            console.log(query);

            let [data, total_patient] = await Promise.all([
                staff().get_all(query, skip, limit, projection),
                staff().count(query),
            ]);

            req.msg = "fetched_data";
            req.http_status = 200;
            req.data = data;
            req.count = total_patient;

        }
        catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const remove = async (req, res, next) => {
        try {
            let { id } = req.params;

            let result = await staff().update({ _id: id }, { is_deleted: true });
            if (result == null) { throw ({ http_status: 400, msg: "not_found" }) }

            req.data = result;
            req.http_status = 200;
            req.msg = "data_deleted";

        }
        catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const change_status = async (req, res, next) => {
        try {
            let { id } = req.params;
            let { status } = req.fields;

            let result = await staff().update({ _id: id }, { "is_active": status }, { new: true });
            if (result == null) { throw ({ http_status: 400, msg: "not_found" }) }

            req.msg = "status_changed";
            req.http_status = 200;
            req.data = result;

        } catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();

    };

    return {
        add_update,
        get_list,
        details,
        change_status,
        remove
    };
};
