const mongoose = require('mongoose');
// mongoose.set("debug", true);

const mongodb = (url) => {

    mongoose.connect(url)
    mongoose.connection.on("error", err => { console.log("err", err) })
    mongoose.connection.on("connected", (err, res) => { console.log("mongoose is connected") })
    mongoose.connection.on('disconnected', () => console.log('database disconnected'));
}

module.exports = { mongodb };