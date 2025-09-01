const subscription = require("../schema/subscription");

module.exports = () => {

    const add = (data) => {
        return new Promise((resolve, reject)=>{
            subscription.create(data).then(resolve).catch(reject);
        });
    };

    const fetch = (id) => {
        return new Promise((resolve, reject)=>{
            subscription.findById(id).then(resolve).catch(reject);
        });
    };

    const fetch_by_query = (query) => {
        return new Promise((resolve, reject)=>{
            subscription.findOne(query).sort({ _id: -1 }).then(resolve).catch(reject);
        });
    };

    const update = (query, data) => {
        return new Promise((resolve, reject)=>{
            subscription.findOneAndUpdate(query, data, { new: true, upsert: true }).then(resolve).catch(reject);
        });
    };

    const get_all = (query, skip, limit) => {
        return new Promise(function (resolve, reject) {

            let pipeline = [
                { $match: query },
                { $sort: { _id: -1 } },
                { $project: { __v: 0, updatedAt: 0 } },
            ]

            if (skip !== null && limit !== null) pipeline.push({ $skip: skip }, { $limit: limit })

            let orm = subscription.aggregate(pipeline)
            orm.then(resolve).catch(reject);
        });
    };

    const count = (query) => {
        return new Promise((resolve, reject)=>{
            subscription.countDocuments(query).then(resolve).catch(reject);
        });
    };

    const remove = (id) => {
        return new Promise((resolve, reject)=>{
            subscription.findByIdAndDelete(id).then(resolve).catch(reject);
        });
    };

    return {
        add,
        fetch,
        fetch_by_query,
        update,
        get_all,
        count,
        remove,
    };
};
