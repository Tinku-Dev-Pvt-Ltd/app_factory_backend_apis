const client = require("../schema/client");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      client.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
      client.findById(id).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=>{
      let orm = client.findOne(query,'-__v -updatedAt').sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject)=>{
      client.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
      return new Promise((resolve, reject)=>{
          let result;
          if(skip != null && limit != null) result = client.find(query, projection).sort({ _id: -1 }).skip(skip).limit(limit);
          else result = client.find(query, projection).sort({ _id: -1 });
          result.then(resolve).catch(reject);
      });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
      client.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
      client.findOneAndDelete({ '_id': id }).then(resolve).catch(reject);
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
