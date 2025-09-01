const user_device = require("../schema/user_device");

module.exports = () => {
    
  const add = (data) => {
    return new Promise(function (resolve, reject) {
      user_device.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = user_device.findById(id);
      orm.then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    console.log(query);
    return new Promise(function (resolve, reject) {
      let orm = user_device.findOne(query).sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise(async function (resolve, reject) {
      await user_device.findOneAndUpdate(query, data, { new: true, upsert: true })
        .then(resolve)
        .catch(reject);
    });
  };

  const get_all = (query, page, limit) => {
    if (page) { page -= 1 }
    return new Promise(function (resolve, reject) {
      let orm = user_device.find(query)
        .select("-password -__v")
        .sort({ _id: -1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const get_user_device = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = user_device.aggregate([
        { $match: query },
        { $group: { _id: null, tokens:{$addToSet:"$device_token"} } },
        { $project: { tokens:1 }}
      ])
      orm.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = user_device.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = user_device.findOneAndDelete({'_id' : id});
      orm.then(resolve).catch(reject);
    });
  };

  return {
    add,
    fetch,
    fetch_by_query,
    get_user_device,
    update,
    get_all,
    count,
    remove,
  };
};
