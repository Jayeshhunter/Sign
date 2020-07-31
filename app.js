//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const request = require("request");
const Zomato = require("zomato.js");
const z = new Zomato("8690fbd2e59e641fed301bcc87e4cedd");
// console.log(process.env.API_KEY);
var Items = [];
let length = 0;
const geolib = require("geolib");
z.categories().then().catch();
const url =
  "https://api.mapbox.com/geocoding/v5/mapbox.places/Jamshedpur.json?access_token=pk.eyJ1IjoiamF5ZXNoamF5YW5hbmRhbiIsImEiOiJja2JqbmEzYjMwYWtuMnFsY2MxOGtpbXhoIn0.RtXS_hlz27F96-WrCAzN6A";
// request({ url: url, json: true }, function (err, response) {
//   const latitude = response.body.features[0].center[1];
//   const longitude = response.body.features[0].center[0];
//   console.log(latitude, longitude);
//   // z.establishments({
//   //   lat: latitude,
//   //   lon: longitude,
//   // })
//   //   .then(function (data) {
//   //     console.log(data);
//   //   })
//   //   .catch(function (err) {
//   //     console.error(err);
//   //   });
//   z.geocode({
//     lat: latitude,
//     lon: longitude,
//   })
//     .then(function (data1) {
//       for (var i = 0; i < data1.popularity.nearby_res.length; i++) {
//         z.restaurant({
//           res_id: data1.popularity.nearby_res[i],
//         })
//           .then(function (data2) {
//             console.log(data2.name);
//             console.log(data2.user_rating);
//             var obj = {
//               name: data2.name,
//               rating: data2.user_rating.aggregate_rating,
//               text: data2.user_rating.rating_text,
//             };
//             // for(var i=0;i<data1.popularity.nearby_res.length();i++){

//             // }
//             Items.push(obj);
//             console.log(Items);
//             console.log(data1.popularity.nearby_res);
//           })
//           .catch(function (err) {
//             console.error(err);
//           });
//         // console.log(data.popularity.nearby_res[3]);
//         // z.reviews({
//         //   res_id: data.popularity.nearby_res[3],
//         // })
//         //   .then(function (data) {
//         //     console.log(data.user_reviews[1].rating);
//         //   })
//         //   .catch(function (err) {
//         //     console.error(err);
//         //   });
//       }
//     })
//     .catch(function (err) {
//       console.error(err);
//     });
// });

// z.cities({
//   q: "jamshedpur",
//   count: 2,
// })
//   .then(function (data) {
//     console.log(data);
//   })
//   .catch(function (err) {
//     console.error(err);
//   });

// z.collections({
//   lat: 19.0895595,
//   lon: 72.8634203,
//   count: 5,
// })
//   .then(function (data) {
//     console.log(data);
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
const encrypt = require("mongoose-encryption");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = new mongoose.model("User", userSchema);

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});
// Key = "8690fbd2e59e641fed301bcc87e4cedd";

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    } else {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/secrets");
        }
      });
    }
  });
});
app.get("/secrets", (req, res) => {
  res.render("secrets");
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});
app.get("/submit", (req, res) => {
  request({ url: url, json: true }, function (err, response) {
    const latitude = response.body.features[0].center[1];
    const longitude = response.body.features[0].center[0];
    console.log(latitude, longitude);
    // z.establishments({
    //   lat: latitude,
    //   lon: longitude,
    // })
    //   .then(function (data) {
    //     console.log(data);
    //   })
    //   .catch(function (err) {
    //     console.error(err);
    //   });
    z.geocode({
      lat: latitude,
      lon: longitude,
    })
      .then(function (data1) {
        for (var i = 0; i < data1.popularity.nearby_res.length; i++) {
          length = data1.popularity.nearby_res.length;
          z.restaurant({
            res_id: data1.popularity.nearby_res[i],
          })
            .then(function (data2) {
              console.log(data2.name);
              console.log(data2.user_rating);
              var obj = {
                name: data2.name,
                rating: data2.user_rating.aggregate_rating,
                text: data2.user_rating.rating_text,
              };
              // for(var i=0;i<data1.popularity.nearby_res.length();i++){

              // }
              const found = Items.some((el) => el.name === data2.name);
              if (!found) {
                Items.push(obj);
              }

              console.log(Items);
              console.log(data1.popularity.nearby_res);
            })
            .catch(function (err) {
              console.error(err);
            });
          // console.log(data.popularity.nearby_res[3]);
          // z.reviews({
          //   res_id: data.popularity.nearby_res[3],
          // })
          //   .then(function (data) {
          //     console.log(data.user_reviews[1].rating);
          //   })
          //   .catch(function (err) {
          //     console.error(err);
          //   });
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  });
  // const found = Items.some((el) => el.username === data2.name);
  // if (!found) {
  //   Items.push(obj);
  // }
  Items.sort(function (a, b) {
    return b.rating - a.rating;
  });
  res.render("submit", {
    newListItems: Items,
    length: length,
  });
});
app.listen(3000, function () {
  console.log("Server started on post 3000");
});
