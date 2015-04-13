/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
"use strict";
var express = require("express"),
    path = require("path"),
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser"),
    shortid = require("shortid"),
    app, port = 3000;
var app = express();
var dbURL = "mongodb://localhost:27017/test";

app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.post("/", function(req, res) {
    var url = req.body.ogurl;
    var index = url.indexOf("localhost:3000");
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Error connecting to the database");
            res.status(404).send("Error connecting to the database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            if (index > -1 && index < 9) {
                //shorturl
                collection.find({
                    shorturl: url
                }).toArray(function(err, items) {
                    res.json({
                        "url": items[0].longurl
                    });
                });
            } else {
                //longurl
                collection.find({
                    longurl: url
                }).toArray(function(err, items) {

                    if (items.length <= 0) {
                        console.log("New Entry");
                        //Generate new URL 
                        var shorturl = shortid.generate().toString(36);
                        shorturl = "localhost:3000/" + shorturl;
                        var urlDB = {
                            shorturl: shorturl,
                            longurl: url,
                            views: 1
                        };
                        collection.insert(urlDB, function(err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                //console.log(result);
                                res.json({
                                    "url": shorturl
                                });
                            }
                        });

                    } else {
                        //LongUrl already exist
                        res.json({
                            "url": items[0].shorturl
                        });
                    }
                });
            }
        }

    });
});


app.get("/top", function(req, res) {

    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Problem connecting database");
            res.status(404).send("Problem connecting database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find().sort({
                views: -1
            }).limit(10).toArray(function(err, items) {
                res.json(items);

            });
        }
    });

});
app.route("/:url").all(function(req, res) {
    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Error connecting to the database");
            res.status(404).send("Error connecting to the database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find({
                shorturl: url
            }).toArray(function(err, items) {
                if (items.length <= 0) {
                    res.status(404).send("URL does not Exist");
                } else {
                    collection.update({
                        shorturl: url
                    }, {
                        $inc: {
                            views: 1
                        }
                    });
                    res.redirect(items[0].longurl);
                }
            });

        }
    });
});
app.listen(port);
console.log("Listening on port " + port);