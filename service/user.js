const user = require("../schema/user");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      user.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
      user.findById(id).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=>{
      let orm = user.findOne(query,'-__v -updatedAt').sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject)=>{
      user.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
      return new Promise((resolve, reject)=>{
          if(skip != null && limit != null) user.find(query, projection).sort({ _id: -1 }).skip(skip).limit(limit).then(resolve).catch(reject);
          else user.find(query, projection).sort({ _id: -1 }).then(resolve).catch(reject);
      });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
      user.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
      user.findOneAndDelete({ '_id': id }).then(resolve).catch(reject);
    });
  };

  return {
    add,
    fetch,
    fetch_by_query,
    update,
    get_all,
    count,
    remove
  };
};
