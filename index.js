var express = require('express')
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var app = express()
var flash = require('express-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser')
var models = require('./models')
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars');
app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 60000
  }
}))
app.use(cookieParser('keyboard cat'));
app.use(flash());
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.use(express.static('public'));


app.get('/waiters/:username', function(req, res, next) {
  var waiterName = req.params.username;
  //var waiterName = waiterName.substring(0, 1).toUpperCase() + waiterName.substring(1);

  // get the user in the database for the waiterName entered
  models.Shifts.findOne({
    name: waiterName

  }, function(err, waiter) {
    if (err) {
      return next(err);
    }

    res.render('index', {
      waiters: 'Hi, ' + waiterName + " please select your days",
      waiter: waiter
    })
  })


});

app.post('/waiters/:username', function(req, res) {
   var days = req.body.weekdays
   var waiterName = req.params.username;
  myShift = {}
  if (!days) {
    req.flash('submitmsg', 'please select atleast one day!')
    res.redirect('/waiters/' + waiterName)
    return
  }

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
          shiftDays.save(function(err, data) {
            if (err) {
              console.log(err);
            } else {

              req.flash('submitmsg', "your days have been added successfully")
              res.redirect('/waiters/' + waiterName)

            }
          });

        } else {

          req.flash('submitmsg', "your days have been updated successfully")
          res.redirect('/waiters/' + waiterName)
        }
      }
    })
});


app.get('/days', function(req, res) {

  var waitersRoster = {
    Monday: {
      waiters: []
    },
    Tuesday: {
      waiters: []
    },
    Wednesday: {
      waiters: []
    },
    Thursday: {
      waiters: []
    },
    Friday: {
      waiters: []
    },
    Saturday: {
      waiters: []
    },
    Sunday: {
      waiters: []
    }
  }

  models.Shifts.find({}, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      results.forEach(function(waiterShift) {
        weekDays.forEach(function(day) {
          if (waiterShift.days[day]) {
            waitersRoster[day].waiters.push(waiterShift.name)
          }

        })
      })
    }



    res.render('admin', {
      waitersADay: waitersRoster,
      monDisplay: ColourManaging(waitersRoster.Monday.waiters.length),
      tueDisplay: ColourManaging(waitersRoster.Tuesday.waiters.length),
      wedDisplay: ColourManaging(waitersRoster.Wednesday.waiters.length),
      thuDisplay: ColourManaging(waitersRoster.Thursday.waiters.length),
      friDisplay: ColourManaging(waitersRoster.Friday.waiters.length),
      satDisplay: ColourManaging(waitersRoster.Saturday.waiters.length),
      sunDisplay: ColourManaging(waitersRoster.Sunday.waiters.length)
    })
  });
});



function ColourManaging(color) {
  if (color === 3) {
    return 'colour1';
  } else if (color < 3) {
    return 'colour3';
  } else if (color > 3) {
    return 'colour2';
  }
}


app.post('/reset', function(req, res) {
  models.Shifts.remove({}, function(err, remove) {
    if (err) {
      return err;
    }
    res.redirect('/days')

  });
});







app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.send(err.stack);
})




var port = 3002;
app.listen(process.env.PORT || port, function() {
  console.log('app is now listening :' + port);
});
