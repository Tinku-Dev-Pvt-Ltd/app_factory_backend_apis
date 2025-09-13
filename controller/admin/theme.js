const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let theme = require("../../service/theme");
const { uniqString, upload_s3_file } = require('../../util/helper');
const { validationResult } = require('express-validator');
const qs = require('qs');

module.exports = () => {

    const add_update = async (req, res, next) => {
        console.log("add_update theme api call successfully");
        try {
            let body = req.fields;
            let files = qs.parse(req.files);
            let { id } = body;

            const errors = await validationResult(req);
            if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

            if (id) {
                let theme_exist = await theme().fetch(id)
                if (theme_exist == null) throw { http_status: 400, msg: "not_found" };
            }

            if (files?.thumbnail.length > 0) {

                let result = files?.thumbnail.map(async (item) => {
                    let s3_result = await upload_s3_file(item.img);
                    return ({ url: s3_result });
                })

                let thumbnail = await Promise.all(result);

                console.log("\n ============= thumbnail ============")
                console.log(thumbnail);

                body.thumbnail = thumbnail;
            }

            let result = null;
            if (typeof id == "undefined" || !id) {
                body.uniq_id = `TH${uniqString()}`;
                result = await theme().add(body);
            }
            else {
                let data = await theme().update({ _id: id }, body);
                result = data;
            }

            req.data = result;
            req.http_status = 200;
            req.msg = "success";
        }
        catch (err) {
            console.log("error ======================>", err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
            req.data = {};
        }
        next();
    };

    const details = async (req, res, next) => {
        console.log("content detail api hit successfully");
        try {
            let { id } = req.params;

            let exist_record = await theme().fetch_by_aggregate({ _id: new ObjectId(id) });
            if (exist_record.length < 1) { throw { http_status: 400, msg: "not_found" }; }

            req.http_status = 200;
            req.msg = "fetched_data";
            req.data = exist_record[0];
            next();

        } catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
            req.data = {};
            return next();
        }
    };

    const get_list = async (req, res, next) => {
        try {
            let { search, page, limit, category_id, is_active } = req.query;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page !== null && limit !== null) skip = parseInt((page - 1) * limit);

            let pagination = skip != null ? [{ $skip: skip }, { $limit: limit }] : [];
            let query = { is_deleted: false };

            if (search) query.name = { $regex: search, $options: "i" };
            if (is_active) query.is_active = is_active == 'true' ? true : false;
            if (category_id) query.category_id = new ObjectId(category_id);

            console.log(' ----------------------- your final query is -------------------');
            console.log(query)

            let [data, total_count] = await Promise.all([
                theme().find(query, pagination),
                theme().count(query),
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

    const remove = async (req, res, next) => {
        try {
            let { id } = req.params;

            let data = await theme().remove(id);
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
        console.log('get category stauts change function call');
        try {
            let { id } = req.params;
            let { status } = req.fields;

            if (!status) { throw ({ http_status: 400, msg: "status_required" }) }

            let result = await theme().update(id, { is_active: status });
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
        details,
        get_list,
        remove,
        change_status,
    };
};
