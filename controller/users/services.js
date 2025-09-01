const { uniqString, create_notification_payload, send_notification } = require("../../util/helper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

let services = require("../../service/services");

module.exports = () => {

  const add_update = async (req, res, next) => {
    console.log("add_update content api call successfully");
    try {
      let { id } = req.body;
      let body = req.body;
      let user_id = req.Id;
      let { scheduled_time } = body;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw { http_status: 400, msg: errors.errors[0].msg }; }

      if (!scheduled_time || scheduled_time == "") body.scheduled_time = new Date();

      let result = null;

      if (typeof id == "undefined" || !id) {
        body.uniq_id = `CNT${uniqString()}`;
        body.user_id = user_id;

        console.log(" =-=-=-=-=-=- body =-=-=-=-=-=- ");
        console.log(body);

        body.is_approved = 1; // removed this check from later
        result = await services().add(body);
      }
      else {
        let data = await services().update({ _id: id }, body);
        if (data == null) throw { http_status: 400, msg: "not_found" };

        result = data;
      }

      req.data = result;
      req.http_status = 200;
      req.msg = "success";
      next();
    }
    catch (err) {
      console.log("error ======================>", err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
      req.data = {};
    }
    next();
  };

  const details = async (req, res, next) => {
    console.log("content detail api hit successfully");
    try {
      let { id } = req.query;
      let user_id = req.Id;
      let user_data = req.user_data;

      let exist_record = await services().fetch_by_aggregate({ _id: new ObjectId(id) });
      if (exist_record.length < 1) { throw { http_status: 400, msg: "not_found" }; }

      req.http_status = 200;
      req.msg = "fetched_data";
      req.data = exist_record[0];
      next();

      let data = exist_record[0];
      if (data?.user_id != user_id ) {

        await Promise.all([
          services().update({ _id: id }, { total_views: (exist_record[0].total_views += 1) }),
          create_notification_payload("view_msg", data.user_id, "user", data._id, user_data.first_name, user_id),
          send_notification("view_msg", data.user_id, user_data.first_name),
        ]);
      }
    } catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
      req.data = {};
      return next();
    }
  };

  const get_list = async (req, res, next) => {
    console.log('content listing api hit successfully')
    try {
      let { search, page, limit, content_type, category_id, status, my_post, is_draft } = req.query;

      let skip = null;
      let id = req.Id;

      page = page ? parseInt(page) : null;
      limit = limit ? parseInt(limit) : null;
      if (page !== null && limit !== null) skip = parseInt((page - 1) * limit);

      let query = { is_deleted: false, is_active: true, is_draft: false };
      // let query = { is_deleted: false, is_active: true, is_draft: false, user_id: { $nin: [new ObjectId(id)] } };

      if (search) query.name = { $regex: search, $options: "i" };
      if (status) query.is_approved = Number(status);
      if (category_id) query.category_id = new ObjectId(category_id);
      if (content_type) query.content_type = Number(content_type);
      if (my_post == "true") query.user_id = id;
      if (my_post == "true" && is_draft) query.is_draft = true;
      if (my_post != "true") {
        query.scheduled_time = { $lte: new Date() };
        query.is_approved = 1;
      }

      console.log(" ----------------------- your final query is -------------------");
      console.log(query);

      let [data, total_count] = await Promise.all([
        services().list_by_admin_aggregate(query, skip, limit, id),
        services().count(query),
      ]);

      req.msg = "fetched_data";
      req.http_status = 200;
      req.data = data;
      req.count = total_count;
    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
      req.data = {};
    }
    next();
  };

  const remove = async (req, res, next) => {
    try {
      let { id } = req.body;

      let result = await services().update({ _id: id }, { is_deleted: true });
      if (result == null) { throw { http_status: 400, msg: "not_found" }; }

      req.data = result;
      req.http_status = 200;
      req.msg = "data_deleted";
    } 
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
      req.data = {};
    }
    next();
  };

  const recent_list = async (req, res, next) => {
    console.log("service listing api hit successfully");
    try {
      let { type } = req.query;
      let id = req.Id;

      let query = { is_deleted: false, is_approved: 1, is_draft: false, user_id: { $ne: id }, };
      if (type) query.content_type = Number(type);

      let data = await services().find(query);

      req.http_status = 200;
      req.msg = "fetched_data";
      req.data = data;
    } 
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error";
      req.data = {};
    }
    next();
  };

  return {
    add_update,
    details,
    get_list,
    remove,
    recent_list,
  };
};
