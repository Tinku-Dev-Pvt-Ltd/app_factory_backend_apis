const notification = require("../schema/notification");

module.exports = () => {

  const add = (data) => {
    return new Promise(function (resolve, reject) {
      notification.create(data).then(resolve).catch(reject);
    });
  };

  const insert_many = (data) => {
    return new Promise(function (resolve, reject) {
      notification.insertMany(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.findById(id);
      orm.then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    console.log(query);
    return new Promise(function (resolve, reject) {
      let orm = notification.findOne(query).sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise(async function (resolve, reject) {
      await notification.findOneAndUpdate(query, data, { new: true })
        .then(resolve)
        .catch(reject);
    });
  };

  const update_many = (query, data) => {
    return new Promise(async function (resolve, reject) {
      await notification.updateMany(query, data, { new: true })
        .then(resolve)
        .catch(reject);
    });
  };

  const find_all_by_aggr = (query, skip, limit) => {
    return new Promise(function (resolve, reject) {

      let orm = notification.aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        { $project: {
            _id: 1,
            title: 1,
            description:1,
            is_read: 1,
            notification_type: 1,
            createdAt: 1,
        }},
        { $skip: skip },
        { $limit: limit }
      ]);

      orm.then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.find(query,projection).sort({ _id: -1 }).skip(skip).limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.findOneAndDelete({ '_id': id });
      orm.then(resolve).catch(reject);
    });
  };

  const get_all_aggr = (query, skip, limit) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$title",
            description: { $first: "$description" },
            createdAt: { $first: "$createdAt" },
            notication_id: { $first: "$_id" }
          }
        },
        {
          $project: {
            _id: "$notication_id",
            title: "$_id",
            description: "$description",
            createdAt: "$createdAt",
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
      orm.then(resolve).catch(reject);
    });
  };

  const aggr_count = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = notification.aggregate([
        { $match: query },
        { $group: {
            _id: null,
            title: { $first: "$title" },
            description: { $first: "$description" },
            createdAt: { $first: "$createdAt" },
            notication_id: { $first: "$_id" }
        }},
        { $group: { id: null, count: { $sum: 1 } } }
      ]);
      orm.then(resolve).catch(reject);
    });
  };

  return {
    add,
    fetch,
    fetch_by_query,
    update,
    get_all,
    get_all_aggr,
    find_all_by_aggr,
    aggr_count,
    count,
    remove,
    insert_many,
    update_many
  };
};
