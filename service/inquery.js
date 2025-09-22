const inquery = require("../schema/inquery");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject)=>{
      inquery.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject)=>{
        inquery.findById(id).then(resolve).catch(reject);
    });
  };

  const update = (id, data) => {
    return new Promise(async (resolve, reject)=>{
      await inquery.findByIdAndUpdate(id, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const get_all = (query, skip, limit, projection) => {
    return new Promise((resolve, reject)=>{ 
       let result = [];
       if(skip!= null && limit != null) result = inquery.find(query, projection).sort({_id: -1}).skip(skip).limit(limit);
       else result = inquery.find(query, projection).sort({_id: -1});

       result.then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject)=>{
        inquery.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject)=>{
        inquery.findByIdAndUpdate(id, {is_deleted: true},{new:true}).then(resolve).catch(reject);
    });
  };

  const fetch_by_aggr = (query) => {
    return new Promise((resolve, reject)=>{
        let pipeline =  [

          { $match:query },
          { $lookup:{
            from:"staff_members",
            let:{local_id : "$staff_id"},
            pipeline:[{$match:{$expr:{$eq:["$_id", "$$local_id"]}}}],
            as:"staff_data"
          }},
          { $unwind:{path:"$staff_data", preserveNullAndEmptyArrays:true }},
          { $lookup:{
            from:"themes",
            let:{local_id : "$theme_id"},
            pipeline:[
              {$match:{$expr:{$eq:["$_id", "$$local_id"]}}},
            ],
            as:"themes_data"
          }},
          { $unwind:{path:"$themes_data", preserveNullAndEmptyArrays:true }},
          { $project:{
            "full_name": 1,
            "compamy_name": 1,
            "email": 1,
            "country_code": 1,
            "phone_no": 1,
            "subject": 1,
            "message": 1,
            "status": 1,
            "theme_id": 1,
            "sub_category_id": 1,
            "category_id": 1,
            "category_name": 1,
            "sub_category_name": 1,
            "staff_data":{$cond:{ if:"$staff_data", then:"$staff_data", else:null }},
            "themes_title":"$themes_data.title"
          }}
        ];

        let result = inquery.aggregate(pipeline);
        result.then(resolve).catch(reject);
    });
  };

  return {
    add,
    fetch,
    fetch_by_aggr,
    update,
    get_all,
    count,
    remove
  };
};
