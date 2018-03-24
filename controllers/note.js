
// Scraping tools
const request = require("request");
const cheerio = require("cheerio");

const axios = require("axios");

// Requiring our models
var db = require("../models");


module.exports = function (app) {
       // Routes
   app.get("/", function (req, res) {
        res.send("Hello Harry Potter World");
    });
    // A GET route for scraping the echojs website
    app.get("/scrape", function (req, res) {
    //    console.log("req hit");

        // This function will scrape the news website
        // var scrape = function () {
        // Scrape the website
        return axios.get("http://www.pottermore.com/news").then(function (res) {
            var $ = cheerio.load(res.data);
            // Make an empty array to save our article info
            var articles = [];

            // 
            // use copy selector in google dev tools
            //loop through each div holding an article
            $("body > div > article > div.l-centered.l-centered--narrow.l-hub-grid.news-hub__latest-others > div").each(function (i, element) {
            
                // use cheerio to grab href of each
                var link = $(this)
                    .children("a")
                    .attr("href");

                // Grab the title of the article
                //body > div:nth-child(4) > article > div.l-centered.l-centered--narrow.l-hub-grid.news-hub__latest-others > div:nth-child(1) > a > div.hub-item__content.hub-item--compact__content > div > h2
                var title = $(this)
                    .children("a")
                    .children("div")
                    .children("div")
                    .children("h2")
                    .text();



                // So long as our headline and sum and url aren't empty or undefined, do the following
                if (link && title) {


                    var article = {
                        link: link,
                        title: title
                    };

                    articles.push(article);
                }
        //     });
        //     return articles;
        //     console.log(articles);
        // });

        

       

                // Create a new Headlines using the `result` object built from scraping
                db.Headline.create(article)
                    .then(function (dbHeadline) {
                        // View the added result in the console
                        console.log(dbHeadline);
                        
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            })
            .catch(function (error) {
                console.log(error);
            

            // If we were able to successfully scrape and save a Headline, send a message to the client
            res.send("Scrape Complete");
        });
        });



    // Route for getting all Headlines from the db
    app.get("/headlines", function (req, res) {
        // Grab every document in the Articles collection
        db.Headline.find({})
            .then(function (dbHeadline) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbHeadline);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Headline by id, populate it with it's note
    app.get("/headlines/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Headline.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbHeadline) {
                // If we were able to successfully find a Headline with the given id, send it back to the client
                res.json(dbHeadline);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/headlines/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Headline.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbHeadline) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbHeadline);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
        

        // Tell the browser that we finished scraping the text
        res.redirect("/");

        });
    });
};

