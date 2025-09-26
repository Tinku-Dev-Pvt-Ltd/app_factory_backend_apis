const assign_product = require("../schema/assign_product");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      assign_product.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
        assign_product.findById(id).then(resolve).catch(reject);
    });
  };

  const fetch_by_query = (query) => {
    return new Promise((resolve, reject)=>{
        assign_product.findOne(query).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (id, data) => {
    return new Promise(async (resolve, reject)=>{
      await assign_product.findByIdAndUpdate(id, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, pagination ) => {
    return new Promise((resolve, reject)=>{ 
       let pipeline = [
          { $match:query },
          ...pagination,
          {$lookup:{
            from:"themes",
            let:{local_id:"$theme_id"},
            pipeline:[{ $match:{$expr:{$eq:["$_id", "$$local_id"]}}}],
            as:"theme_data"
          }},
          {$unwind:{path:"$theme_data", preserveNullAndEmptyArrays:true }},
          {$project:{
            _id : 1,
            theme_name:"$theme_data.title",
            is_active:1
          }}
       ];

       let result = assign_product.aggregate(pipeline,{allowDiskUse:true});
       result.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
        assign_product.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
        assign_product.findByIdAndDelete(id).then(resolve).catch(reject);
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
