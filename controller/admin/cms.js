let cms_service = require("../../service/cms");
const { validationResult } = require('express-validator');

module.exports = () => {

  const update_cms = async (req, res, next) => {
    try {
      let { title, discription, type } = req.fields;

      const errors = await validationResult(req);
      if (!errors.isEmpty()) { throw ({ http_status: 400, msg: errors.errors[0].msg }) }

      /*     =-=-=-=-=-=-=-=- types =-=-=-=-=-=-=-=- 
      **
      **    1 :- About Us
      **    2 :- Terms & Condition
      **    3 :- Privacy Policy
      */
      
      let payload = { title, discription, type }
      let result;

      let exist_data = await cms_service().fetch_by_query({ type });

      if (exist_data == null) { result = await cms_service().add(payload); }
      else { result = await cms_service().update({type}, payload); }

      req.data = result;
      req.http_status = 200;
      req.msg = "data_added";
    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = null
    }
    next();
  };

  const details = async (req, res, next) => {
    try {
      let { type } = req.query;

      let result = await cms_service().fetch_by_query({ "type": type });
      if (result == null) { throw ({ http_status: 400, msg: "not_found" }) }

      req.data = result;
      req.msg = "fetched_data";
      req.http_status = 200;

    }
    catch (err) {
      console.log(err);
      req.http_status = err.http_status || 500;
      req.msg = err.msg || "server_error"
      req.data = null
    }
    next();
  };

  return {
    update_cms,
    details,
  };
};
