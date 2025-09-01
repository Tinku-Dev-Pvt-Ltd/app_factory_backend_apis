const notification = require('../../service/notification');

module.exports = () => {

    const list = async (req, res, next) => {
        console.log('\n get all notification api successfully')
        try {
            let { page, limit } = req.query;
            let id = req.Id;
            let role = req.role;

            page = Number(page) || 1;
            limit = Number(limit) || 10;
            let skip = (page - 1) * limit;

            let query = { user_id: id };
            let unread_query = { is_read: false, user_id: id };

            if (role == 'admin') {
                query = { user_type : 'admin'}
                unread_query = { user_type : 'admin'}
            }

            let projection = "_id title description is_read"

            let [result, count, unread_count] = await Promise.all([
                notification().find_all_by_aggr(query, skip, limit, projection),
                notification().count(query),
                notification().count(unread_query),
            ])

            req.http_status = 200;
            req.msg = "fetched_data";
            req.data = {
                page: page,
                limit: limit,
                total_count: count,
                unread_count: unread_count,
                result
            }
        }
        catch (err) {
           console.log(err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {}
        }
        next();
    }

    const read_notification = async (req, res, next) => {
        console.log("read notification api successfully")
        try {
            let id = req.Id;
            let role = req.role;
            let result;

            if (role == "user") { result = await notification().update_many({ user_id: id, user_type: "user" }, { is_read: true }, { new: true }); }
            else { result = await notification().update({ user_type: "admin" }, { is_read: true }, { new: true }); }

            req.http_status = 200;
            req.msg = "fetched_data";
            req.data = result;
        }
        catch (err) {
            console.log(err);
            req.res_code = 0;
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error"
            req.data = {};
        }
        next()
    }

    return {
        list,
        read_notification
    }
}