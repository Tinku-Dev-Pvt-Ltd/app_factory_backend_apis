const admin = require("../schema/admin");

module.exports = () => {

    const registerAdmin = (data) => {
        return new Promise((resolve, reject) => {
            admin.create(data).then(resolve).catch(reject);
        });
    };

    const fetch = (id) => {
        return new Promise((resolve, reject) => {
            admin.findById(id).then(resolve).catch(reject);
        });
    };

    const fetch_by_query = (query) => {
        return new Promise((resolve, reject) => {
            admin.findOne(query).then(resolve).catch(reject);
        });
    };

    const update_by_id = (id, data) => {
        return new Promise((resolve, reject) => {
            admin.findByIdAndUpdate(id, data, { new: true }).then(resolve).catch(reject);
        });
    };

    const getUser = (query, page, limit) => {
        return new Promise((resolve, reject) => {
            admin.find(query).sort({ _id: -1 }).skip(skip).limit(limit).then(resolve).catch(reject);
        });
    };

    const countUser = (query) => {
        return new Promise((resolve, reject) => {
            admin.countDocuments(query).then(resolve).catch(reject);
        });
    };

    return {
        fetch,
        fetch_by_query,
        registerAdmin,
        getUser,
        countUser,
        update_by_id
    };
};
