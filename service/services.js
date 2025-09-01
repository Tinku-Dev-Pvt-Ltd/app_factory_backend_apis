const services = require("../schema/services");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject) => {
      services.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise((resolve, reject) => {
      services.findById(id).sort({ _id: -1 }).then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject) => {
      services.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject) => {
      services.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const find = (query) => {
    return new Promise((resolve, reject) => {
      let pipeline = [
        { $match: query },
        { $sort: { total_like: -1, total_views: -1 } },
        { $limit: 10 },
        { $lookup: {
            from: "users",
            let: { local_id: "$user_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "user_data"
        }},
        { $unwind: { path: "$user_data", preserveNullAndEmptyArrays: true } },
        { $addFields:{ content_image: { $slice: ["$image" , 1] }}},
        { $project:{
          
          title: 1,      
          total_like: 1,        
          total_views: 1,        
          image: "$content_image",   
          first_name: "$user_data.first_name",
          last_name: "$user_data.last_name",
          user_img: "$user_data.image",
        }},
        
      ];

      services.aggregate(pipeline).then(resolve).catch(reject);
    });
  };

  // Aggregation Query :- 
  const fetch_by_aggregate = (query) => {
    return new Promise((resolve, reject) => {
      let pipeline = [
        { $match: query },
        { $lookup: {
            from: "categories",
            let: { local_id: "$category_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "category_data"
        }},
        { $unwind: { path: "$category_data", preserveNullAndEmptyArrays: true } },
        { $lookup: {
            from: "users",
            let: { local_id: "$user_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "user_data"
        }},
        { $unwind: { path: "$user_data", preserveNullAndEmptyArrays: true } },
        { $project: {
            "_id": 1,
            "user_id": 1,
            "total_views": 1,
            "first_name": "$user_data.first_name",
            "last_name": "$user_data.last_name",
            "user_img": "$user_data.image",
            "title": 1,
            "description": 1,
            "scheduled_time": 1,
            "category_name": "$category_data.name",
            "category_image": "$category_data.image",
            "category_id": 1,
            "image": 1,
            "createdAt": 1,
          }
        }
      ]
      services.aggregate(pipeline, { allowDiskUse: true }).then(resolve).catch(reject);
    });
  };

  const list_by_admin_aggregate = (query, skip, limit) => {
    return new Promise((resolve, reject) => {
      let pipeline = [
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $lookup: {
            from: "categories",
            let: { local_id: "$category_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "category_data"
          }
        },
        { $unwind: { path: "$category_data", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            let: { local_id: "$user_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "user_data"
          }
        },
        { $unwind: { path: "$user_data", preserveNullAndEmptyArrays: true } },
        {
          $project: {

            "_id": 1,
            "title": 1,
            "description": 1,
            "category_id": 1,
            "image": 1,
            "createdAt": 1,
            "is_active": 1,
            "is_approved": 1,
            "scheduled_time": 1,
            "first_name": "$user_data.first_name",
            "last_name": "$user_data.last_name",
            "user_img": "$user_data.image",
            "category_name": "$category_data.name",
          }
        }
      ];

      if (skip != null && limit != null) pipeline.push({ $skip: skip }, { $limit: limit });
      services.aggregate(pipeline).then(resolve).catch(reject);
    });
  };

  return {
    fetch,
    add,
    update,
    count,
    find,

    // aggregation method :-
    fetch_by_aggregate,
    list_by_admin_aggregate,
  };
};
