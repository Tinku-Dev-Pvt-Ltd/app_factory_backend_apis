const cms = require("../schema/cms");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=> {
      cms.create(data).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=> {
      cms.findOne(query).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject)=>{
      cms.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

  return {
    fetch_by_query,
    add,
    update,
  };
};
