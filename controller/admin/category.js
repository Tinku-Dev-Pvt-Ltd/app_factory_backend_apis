let mongoose = require('mongoose');
let ObjectId = mongoose.SchemaTypes.ObjectId;
let category = require('../../service/category');
const { upload_s3_file } = require('../../util/helper');

module.exports = () => {


    const add_update = async (req, res, next) => {
        console.log('add_update category function call successfully');
        try {
            let body = req.fields;
            let file = req.files.image;
            let { id, name, parent_id = null } = body;

            if (!name) throw ({ http_status: 400, msg: "name_required" });

            let query = !id ? { name } : { _id: { $ne: id }, name };

            let category_exist = await category().fetch_by_query(query);
            if (category_exist != null) throw ({ http_status: 401, msg: "category_exist" });

            let payload = { name }
            if (!['', "", null].includes(parent_id)) payload.parent_id = parent_id;
            if (file) {
                console.log('\n file found to upload on s3 bucket cloud')
                let s3_result = await upload_s3_file(file);
                if (s3_result) payload.image = s3_result;
            }
            
            let result = null;
            if (!id) { result = await category().add(payload); }
            else {
                let data = await category().update({ _id: id }, payload);
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

    const details = async (req, res, next) => {
        console.log('get category detail function call');
        try {
            let { id } = req.params;

            let result = await category().fetch(id);
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

    const get_list = async (req, res, next) => {
        console.log("category listing api hit successfully");
        try {
            let { search, page, limit, status, parent_id, type } = req.query;
            let role = req.role;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if(page != null && limit != null) skip = parseInt((page - 1) * limit);

            let query = { is_deleted: false };
            if (search) { query.name = { $regex: ".*" + search + ".*", $options: "i" } }
            if (status) query.is_active = status == 'true' ? true : status == 'false' ? false : true;
            if (parent_id && !type) query.parent_id = new ObjectId(parent_id)
            if (type == '1' && !parent_id) query.parent_id = null;                   // for getting all category
            if (type == '2' && !parent_id) query.parent_id = { $ne: null };          // for getting all sub category
            if (role == 'user') query.is_active = true;

            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let pagination = skip != null ? [{$skip : skip}, {$limit : limit}] : [];
            let [result, count] = await Promise.all([
                category().get_all(query, pagination),
                category().count(query)
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

            let data = await category().remove(id);
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

            let result = await category().update(id, { is_active: status });
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
        details,
        get_list,
        remove
    }
}