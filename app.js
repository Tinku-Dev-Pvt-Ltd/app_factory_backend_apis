require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cluster = require("cluster");
const os = require("os");
const formidable = require("express-formidable");
const { mongodb } = require("./database/db");

const PORT = process.env.PORT;
const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
//   for (let i = 0; i < numCPUs; i++) { cluster.fork(); }   // @author : Yash, Note :- create worker as cpu number

//   cluster.on("exit", (worker, code, signal) => {      // Agar worker crash ho jaye to restart ho jaye
//     console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
//     cluster.fork();
//   });
// }
// else {
  const app = express();

  mongodb(process.env.DB_URL);   

  app.use(cors());
  app.use(express.json());
  app.use(formidable({ multiples: true, keepExtensions: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    if (req.fields) { req.body = req.fields;  }
    next();
  });

  app.use("/api", require("./routes/main"));

  app.use("/", (req, res) =>
    res.status(404).json({
      message: "OOPS, Route not found",
      status_code: 0,
      data: {},
    })
  );

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${PORT}`);
  });
// }
