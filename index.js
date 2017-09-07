var express = require('express')
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var app = express()
var models = require('./models')
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.use(express.static('public'));


app.get('/waiters/:username', function(req, res) {
  var waiterName = req.params.username;
  res.render('index', {
    displayName: "Hi " + waiterName + "," + " please select your days"
  })
});

app.post('/waiters/:username', function(req, res) {
  var days = req.body.weekdays
  console.log(days);
  var waiterName = req.params.username;
  myShift = {}
  if (!Array.isArray(days)) {
    days = [days]
  } else {
    days.forEach(function(selectedDays) {
      myShift[selectedDays] = true
    })
  }
  models.Shifts.findOneAndUpdate({
      name: waiterName
    }, {
      days: myShift
    },
    function(err, data) {
      if (err) {
        console.log(err);
      } else {
        if (!data) {
          var shiftDays = new models.Shifts({
            name: waiterName,
            days: myShift
          })
          shiftDays.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              res.render('index', {
                submitmsg: "Days added successfully!"
              })
            }
          });

        }
        else{
          res.render('index',{
          submitmsg:  "Days updated successfully!"

          })
        }
      }
    })
});


 app.get('/days',function(req, res){

   var waitersRoster = {
     Monday : {
       waiters: []
     },
     Tuesday : {
       waiters: []
     },
     Wednesday : {
       waiters: []
     },
     Thursday : {
       waiters: []
     },
     Friday : {
       waiters: []
     },
     Saturday : {
       waiters: []
     },
     Sunday : {
       waiters: []
     }
   }

    models.Shifts.find({},function(err, results){
    if(err){
       console.log(err);
     }
     else{
       var weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
       results.forEach(function(waiterShift){
         weekDays.forEach(function(day){
           if(waiterShift.days[day]){
            //  console.log("+++++++++++++++" + day);
             waitersRoster[day].waiters.push(waiterShift.name)
           }
         })
       })
     }



     res.render('admin',{
       waitersADay:waitersRoster
     })
   });
 });











  //   for(var i=0; i< results.length; i++){
  //         // console.log("d"+ day);
  //         console.log("fgfgffffhfhfh" +results[i].days);
  //         var shiftObj = results[i].days[day];
  //         console.log("+++++++++++" + shiftObj);
  //  })
    // for(var waiterDays in shiftObj ){
      // if(shiftObj){
      //   Monday.push(results[i].name)
      // }
      // if(shiftObj){
      //   Tuesday.push(results[i].name)
      // }
      // if(shiftObj){
      //   // console.log(results[i].name);
      //   Wednesday.push(results[i].name)
      // }
      // if(shiftObj){
      // Thursday.push(results[i].name)
      // }
      // if(shiftObj){
      //   Friday.push(results[i].name)
      // }
      // if(shiftObj){
      //   console.log("_________"+results[i].name);
      //   Saturday.push(results[i].name)
      // }
      // if(shiftObj){
      //   Sunday.push(results[i].name)
      // }
    // }









var port = 3002;
app.listen(process.env.PORT || port, function() {
  console.log('app is now listening :' + port);
});
