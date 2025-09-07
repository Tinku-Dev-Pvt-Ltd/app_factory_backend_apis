const user = require('../../service/user');

module.exports = () => {

    const details = async (req, res, next) => {
        console.log('user detail api hit successfully ✅');
        try {
            let { id } = req.params;

            let exist_record = await user().fetch(id);
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
        console.log('user list api hit successfully ✅');
        try {
            let { search, page, limit, status } = req.query;
            let skip = null;

            page = page ? parseInt(page) : null;
            limit = limit ? parseInt(limit) : null;
            if (page !== null && limit !== null) skip = parseInt((page - 1) * limit);

            let query = { is_deleted: false };

            if (search) query['$or'] = [
                {first_name:{ $regex: search, $options: "i" }},
                {last_name:{ $regex: search, $options: "i" }},
                {mobile:{ $regex: search, $options: "i" }},
            ];
            if (status) query.is_active = status == 'true'? true : status =='false' ? false : true;
            
            let projection = `first_name last_name image country_code mobile email last_loggedin gender is_active`

            console.log(" =-=-=-==-=-=- query =-=-=-==-=-=- ");
            console.log(query);

            let [data, total_patient] = await Promise.all([
                user().get_all(query, skip, limit, projection),
                user().count(query),
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

            let result = await user().update({ _id: id }, { is_deleted: true });
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
            let { status } = req.body;

            let result = await user().update({ _id: id }, { "is_active": status }, { new: true });
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
        details,
        get_list,
        active_inactive,
        remove
    };
};
