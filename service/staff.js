const staff = require('../schema/staff');

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      staff.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
        staff.findById(id).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=>{
        staff.findOne(query).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (id, data) => {
    return new Promise(async (resolve, reject)=>{
      await staff.findByIdAndUpdate(id, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
    return new Promise((resolve, reject)=>{
       let result;
       if(skip != null && limit != null) result = staff.find(query,projection).sort({ _id: -1 }).skip(skip).limit(limit);
       else result = staff.find(query,projection).sort({ _id: -1 });
       result.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
        staff.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
        staff.findByIdAndDelete(id).then(resolve).catch(reject);
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