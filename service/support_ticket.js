const support_ticket = require("../schema/support_ticket");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=> {
      support_ticket.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=> {
      support_ticket.findById(id).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject)=>{
        support_ticket.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
    return new Promise((resolve, reject) => {

      let result;
      if (skip == null && limit == null) result = support_ticket.find(query, projection).sort({ _id: -1 });
      else result = support_ticket.find(query, projection).sort({ _id: -1 }).skip(skip).limit(limit);
          
      result.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=> {
      support_ticket.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (query) => {
    return new Promise((resolve, reject)=> {
      support_ticket.findOneAndDelete(query).then(resolve).catch(reject);
    });
  };

  return {
    fetch,
    add,
    update,
    get_all,
    count,
    remove,
  };
};
