let support_ticket = require('../../service/support_ticket');

module.exports = () => {

    const details = async (req, res, next) => {
        console.log('get category detail function call');
        try {
            let { id } = req.query;

            let result = await support_ticket().fetch(id);
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
            if (search) { query['$or']=[
                {name: { $regex: ".*" + search + ".*", $options: "i" }},
                {email: { $regex: ".*" + search + ".*", $options: "i" }},
                {mobile: { $regex: ".*" + search + ".*", $options: "i" }}
            ] }
            if (status) query.is_resolved = status == "false" ? false : status == "true" ? true : true;

            let projection = "-__v -updatedAt";
            
            console.log(' ----------------------- your final query is -------------------')
            console.log(query)

            let [result, count] = await Promise.all([
                support_ticket().get_all(query, skip, limit, projection),
                support_ticket().count(query)
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

    const change_status = async (req, res, next) => {
        try {
            let { id, reply } = req.body;

            let data = await support_ticket().fetch(id);
            if (data == null) { throw ({ http_status: 400, msg: "not_found" }) }

            let status = data.is_active != true ? true : false
            let result = await support_ticket().update({ _id: id }, { "is_active": status, admin_reply:reply }, { new: true });

            req.msg = "status_changed";
            req.http_status = 200;
            req.data = result;

        } catch (err) {
            console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = null
        }
        next();
    };

    return {
        details,
        get_list,
        change_status
    }
}