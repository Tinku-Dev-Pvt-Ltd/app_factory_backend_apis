const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let services = require("../../service/services");


module.exports = () => {

    const get_list = async (req, res, next) => {
        try {
            let { search, page, limit, category_id, status, user_id } = req.query;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page !== null && limit !== null) skip = parseInt((page - 1) * limit);

            let query = { is_deleted: false, is_draft: false };

            if (search) query.name = { $regex: search, $options: "i" };
            if (status) query.is_approved = Number(status);
            if (category_id) query.category_id = new ObjectId(category_id);
            if (user_id) query.user_id = new ObjectId(user_id);

            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let [data, total_count] = await Promise.all([
                services().list_by_admin_aggregate(query, skip, limit),
                services().count(query),
            ]);

            req.msg = "fetched_data";
            req.http_status = 200;
            req.data = data;
            req.count = total_count;

        }
        catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    };

    const block_unblock = async (req, res, next) => {
        try {
            let { id } = req.params;

            let data = await services().fetch(id);
            if (data == null) { throw ({ http_status: 400, msg: "not_found" }) }

            let status = data.is_active != true ? true : false
            let result = await services().update({ _id: id }, { "is_active": status, }, { new: true });

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

    const approved_reject = async (req, res, next) => {
        try {
            let { id } = req.params;
            let { status } = req.body;

            let result = await services().update({ _id: id }, { "is_approved": status }, { new: true });
            if (result == null) throw ({ http_stauts: 400, msg: "not_found" })

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

    // Date        :- 30-08-2025
    // Author Note :- Might be chances is there to add this functionality

    // const pinned_service = async (req, res, next) => {
    //     try {
    //         let { id } = req.body;

    //         let data = await services().fetch(id);
    //         if (data == null) { throw ({ http_status: 400, msg: "not_found" }) }

    //         let status = data.is_pinned_out != true ? true : false
    //         let payload = { is_pinned_out: status, pinned_date : status == true ? new Date() : null }
    //         let result = await services().update({ _id: id }, payload, { new: true });

    //         req.msg = "status_changed";
    //         req.http_status = 200;
    //         req.data = result;

    //     } catch (err) {
    //         console.log(err);
    //         req.http_status = err.http_status || 500;
    //         req.msg = err.msg || "server_error"
    //         req.data = {}
    //     }
    //     next();

    // };

    return {
        get_list,
        block_unblock,
        approved_reject,

        // ------------- ( Not in use ) -----------------
        // pinned_content
    };
};
