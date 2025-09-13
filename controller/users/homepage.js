const theme = require('../../service/theme');
const category = require('../../service/category');

module.exports = () => {

    const homepage = async (req, res, next) => {
        try {
            let [category_data, theme_data] = await Promise.all([
                category().get_all({ is_deleted: false, is_active: true, parent_id:null }, [{ $skip: 0 }, { $limit: 10 }]),
                theme().find({ is_deleted: false, is_active: true }, [{ $skip: 0 }, { $limit: 10 }]),
            ]);

            req.msg = "success";
            req.http_status = 200;
            req.data = {
                category_data,
                theme_data
            }
        }
        catch (err) {
            console.log("error ======================>", err);
            req.http_status = err.http_status || 500;
            req.msg = err.msg || "server_error";
            req.data = {};
        }
        next();
    }

    return { homepage }

}