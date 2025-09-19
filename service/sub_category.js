const sub_category = require("../schema/sub_category");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      sub_category.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
        sub_category.findById(id).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=>{
        sub_category.findOne(query).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (id, data) => {
    return new Promise(async (resolve, reject)=>{
      await sub_category.findByIdAndUpdate(id, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, pagination) => {
    return new Promise((resolve, reject)=>{
       let pipeline = [
        { $match : query },
        { $sort: { _id : -1 } },
        ...pagination,
        { $lookup : {
            from : "categories",
            let : { local_field: "$parent_id" }, 
            pipeline : [
              {$match:{$expr:{$eq:["$_id","$$local_field"]}}},
              {$project:{ name:1 }}
            ],
            as: "parent_data"
        }},
        { $unwind : { path : "$parent_data", preserveNullAndEmptyArrays : true } },
        { $project : {
            "name"        : 1,
            "image"       : 1,
            "parent_id"   : 1,
            "parent_name" : "$parent_data.name",
            "is_active"   : 1,
        } },
       ];
       
       let result = sub_category.aggregate(pipeline);
       result.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
        sub_category.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
        sub_category.findByIdAndUpdate(id, {is_deleted: true},{new:true}).then(resolve).catch(reject);
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
