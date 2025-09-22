const theme = require("../schema/theme");

module.exports = () => {

  const add = (data) => {
    return new Promise((resolve, reject) => {
      theme.create(data).then(resolve).catch(reject);
    });
  };

  const update = (query, data) => {
    return new Promise((resolve, reject) => {
      theme.findOneAndUpdate(query, data, { new: true }).then(resolve).catch(reject);
    });
  };

   const fetch = (id) => {
    return new Promise((resolve, reject) => {
      theme.findById(id).then(resolve).catch(reject);
    });
  };

  const count = (query) => {
    return new Promise((resolve, reject) => {
      theme.countDocuments(query).then(resolve).catch(reject);
    });
  };

  const find = (query, pagination) => {
    return new Promise((resolve, reject) => {
      let pipeline = [
        { $match: query },
        { $sort: { _id: -1 } },
        ...pagination,
        { $addFields: { content_image: { $slice: ["$thumbnail", 1] } } },
        { $project: {

            title: 1,
            createdAt: 1,
            image: {$cond:{
              if:{$gt:[{$size:"$content_image"}, 0]},
              then:{$first: "$content_image.url"},
              else:""
            }},
        }}
      ];

      theme.aggregate(pipeline).then(resolve).catch(reject);
    });
  };

  const remove = (id) => {
    return new Promise((resolve, reject) => {
      theme.findByIdAndUpdate(id, { is_deleted: true }, { new: true }).then(resolve).catch(reject);
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
            from: "sub_categories",
            let: { local_id: "$sub_category_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$local_id"] } } }],
            as: "sub_category_data"
        }},
        { $unwind: { path: "$sub_category_data", preserveNullAndEmptyArrays: true } },
        { $project: {
            "_id": 1,
            "uniq_id": 1,
            "title": 1,
            "description": 1,
            "category_name": "$category_data.name",
            "category_image": "$category_data.image",
            "category_id": 1,
            "sub_category_name": "$sub_category_data.name",
            "sub_category_image": "$sub_category_data.image",
            "sub_category_id": 1,
            "thumbnail": 1,
            "meta_title" : 1,
            "meta_description" : 1,
            "keywords" : 1,
            "canonical_url" : 1,
            "robots_meta_tag" : 1,
            "json_ld" : 1,
            "heading" : 1,
            "images_alt_text" : 1,
            "createdAt": 1,
          }
        }
      ]
      theme.aggregate(pipeline, { allowDiskUse: true }).then(resolve).catch(reject);
    });
  };

  return {
    fetch,
    add,
    update,
    count,
    find,
    remove,
    fetch_by_aggregate,
  };
};
