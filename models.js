var mongoose = require('mongoose')
const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/waiter-shifts";

console.log(mongoURL);

mongoose.connect(mongoURL, {
  useMongoClient: true
});


exports.Shifts = mongoose.model('shifts', {
  name: String,
  days: {
            Monday:Boolean,
            Tuesday:Boolean,
            Wednesday:Boolean,
            Thursday:Boolean,
            Friday:Boolean,
            Saturday:Boolean,
            Sunday:Boolean
          }
});
