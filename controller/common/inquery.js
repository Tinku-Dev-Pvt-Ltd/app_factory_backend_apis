let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;
let inquery = require('../../service/inquery');
let theme = require('../../service/theme');
const { validationResult } = require('express-validator');

module.exports = () => {


    const add = async (req, res, next) => {
        console.log('add inquery function call successfully');
        try {
            let body = req.fields;
            let { theme_id } = body;

            let error = validationResult(req);
            if(!error.isEmpty()) throw({http_status:400, msg:error.array()[0].msg})

            let theme_exist = await theme().fetch_by_aggregate({ _id: new ObjectId(theme_id) });
            if (theme_exist.length < 1) throw ({ http_status: 401, msg: "theme_not_found" });

            body.category_id = theme_exist[0].category_id;
            body.category_name = theme_exist[0].category_name;
            body.sub_category_id = theme_exist[0].sub_category_id;
            body.sub_category_name = theme_exist[0].sub_category_name;

            let result = await inquery().add(body);

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

    const details = async (req, res, next) => {
        console.log('get inquery detail function call');
        try {
            let { id } = req.params;

            let result = await inquery().fetch_by_aggr({ _id: new ObjectId(id) });
            if (result.length < 1) { throw ({ http_status: 400, msg: "not_found" }) }

            req.http_status = 200;
            req.msg = "fetched_data";
            req.data = result[0]
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

    const get_list = async (req, res, next) => {
        console.log("category listing api hit successfully");
        try {
            let { search, page, limit, status } = req.query;
            let role = req.role;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page != null && limit != null) skip = parseInt((page - 1) * limit);

            let query = {};
            if (search) { query.full_name = { $regex: ".*" + search + ".*", $options: "i" } }
            if (status) query.status = Number(status)
            if (role == 'user') query.is_active = true;

            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let [result, count] = await Promise.all([
                inquery().get_all(query, skip, limit,"full_name email country_code mobile status createdAt"),
                inquery().count(query)
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

    const assign_staff = async (req, res, next) => {
        try {
            let { id } = req.params;
            let { staff_id } = req.fields;

            let data = await inquery().update(id, {staff_id});
            if (data == null) { throw ({ http_status: 400, msg: "staff_not_found" }) }

            req.msg = "success";
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
        console.log('get category stauts change function call');
        try {
            let { id } = req.params;
            let { status } = req.fields;

            if (!status) { throw ({ http_status: 400, msg: "status_required" }) }

            let result = await inquery().update(id, { status });
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
        add,
        change_status,
        details,
        get_list,
        assign_staff
    }
}