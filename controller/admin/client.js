const { validationResult } = require('express-validator');
const client = require('../../service/client');

module.exports = () => {

    const update_client = async (req, res, next) => {
        console.log("\n Update client API Hit Successfully ✅");
        try {
            let body = req.fields;
            console.log('\n =-=-=-=-=-=-=-=- req.fields =-=-=-=-=-=-=-=- ');
            console.log(req.fields)
            let { email, mobile, country_code, id } = body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            let email_query = { email, is_deleted: false }
            let mobile_query = { mobile, country_code, is_deleted: false }

            if (id) {
                let user_data = await client().fetch(id);
                if (user_data == null) throw ({ http_status: 400, msg: "not_found" });

                email_query._id = { $ne: user_data._id };
                mobile_query._id = { $ne: user_data._id };
            }

            let [email_exist, mobile_exist] = await Promise.all([
                client().fetch_by_query(email_query),
                client().fetch_by_query(mobile_query)
            ]);

            if (email_exist != null) { throw ({ http_status: 409, msg: "email_exist" }) }
            if (mobile_exist != null) { throw ({ http_status: 409, msg: "mobile_exist" }) }

            let result = null;
            if (id) { result = await client().update({ _id: id }, body); }
            else { result = await client().add(body); }

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
        console.log('client detail api hit successfully ✅');
        try {
            let { id } = req.params;

            let exist_record = await client().fetch(id);
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
        console.log('client list api hit successfully ✅');
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

            let projection = `first_name last_name image country_code mobile email last_loggedin gender is_active`

            console.log(" =-=-=-==-=-=- query =-=-=-==-=-=- ");
            console.log(query);

            let [data, total_patient] = await Promise.all([
                client().get_all(query, skip, limit, projection),
                client().count(query),
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

            let result = await client().update({ _id: id }, { is_deleted: true });
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

    const active_inactive = async (req, res, next) => {
        try {
            let { id } = req.params;
            let { status } = req.fields;

            let result = await client().update({ _id: id }, { "is_active": status }, { new: true });
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
        update_client,
        get_list,
        details,
        active_inactive,
        remove
    };
};
