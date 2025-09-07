let subscription = require('../../service/plans');

module.exports = () => {


    const add_update = async (req, res, next) => {
        try {
            let body = req.body;
            let { id } = body;

            let result = null;
            if (!id) { result = await subscription().add(body); }
            else { result = await subscription().update({ _id: id }, body); }

            req.data = result;
            req.http_status = 200;
            req.msg = "data_added";
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
        console.log('get subscription detail function call');
        try {
           let { id } = req.params;

            let result = await subscription().fetch(id);
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
            let { search, page, limit, status } = req.query;
            let role = req.role;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            const skip = parseInt((page - 1) * limit);

            let query = {};
            if (search) { query.title = { $regex: ".*" + search + ".*", $options: "i" } }
            if (status) query.is_active = status == 'true' ? true : status == 'false' ? false : true;
            if (role == 'user') query.is_active = true;

            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let [result, count] = await Promise.all([
                subscription().get_all(query, skip, limit, "-__v -updatedAt"),
                subscription().count(query)
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

            let data = await subscription().remove(id);
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
            let { status } = req.body;

            if (!status) { throw ({ http_status: 400, msg: "status_required" }) }

            let result = await subscription().update({_id : id}, { is_active: status });
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
        change_status
    }
}