// Require all models
const db = require('../models');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

//this will wrap and export all my routes so they have access by my server
module.exports = function (app) {

    //this renders the homePage 
    app.get("/", function (req, res) {

        db.Article.find({}, function (error, data) {
            var hbsObject = {
                article: data
            };
            console.log(hbsObject);
            res.render("index", hbsObject);
        });
    })

    // Routes

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        axios.get("https://old.reddit.com/r/MonsterHunter/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            let previewArray = [];

            $("a.thumbnail").each(function (i, element) {
                console.log("Thumbnail Scrape #" + i);
                // Save an empty result object
                var result = {};
                const previewRegExp = /^\/\/b.*$/;

                result.preview = $(element).children("img").attr("src");

                if (!result.preview) {
                    result.preview = "/assets/img/palicon_icon.png"
                }
                else if (previewRegExp.test(result.preview)) {
                    result.preview = "https:" + result.preview;
                }

                console.log("testing preview variable:    " + result.preview);

                previewArray.push(result.preview);

            });

            console.log("testing previewArray");
            console.log(previewArray);
            console.log("\n\n");

            $("p.title").each(function (i, element) {
                console.log("======================================================================");
                console.log("Article Scrape #" + i);
                // Save an empty result object
                var result = {};

                // Regular Expression check
                const linkRegExp = /^\/r\/.*$/;

                // Save the text of the element in a "title" variable
                result.title = $(element).children("a").text();

                // In the currently selected element, look at its child elements (i.e., its a-tags),
                // then save the values for any "href" attributes that the child elements may have
                result.link = $(element).children("a").attr("href");

                result.preview = previewArray[i];


                // Tests the result.link against a regular expression check to see 
                // if it begins with /r/ (indicating a direct reddit link)
                // if it is true, it concatenates result.link with "https://old.reddit.com" to make it a true hyperlink
                if (linkRegExp.test(result.link)) {
                    result.link = "https://old.reddit.com" + result.link;
                }

                console.log("  testing title variable:    " + result.title);
                console.log("   testing link variable:    " + result.link);
                console.log("testing preview variable:    " + result.preview);

                console.log("======================================================================");

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });

            // If we were able to successfully scrape and save an Article, send a message to the client
            res.send("Scrape Complete");
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route to get all articles with saved flag boolean true
    app.get("/saved", function (req, res) {
        db.Article.find({ "saved": true }).populate("notes")
            .then(function (articles) {
                var hbsObject = {
                    article: articles
                };
                res.render("saved", hbsObject);
            });
    });


    // Route for updating article saved attribute
    app.post("/articles/save/:id", function (req, res) {
        // Use the article id to find and update its saved boolean
        db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
            // Execute the above query
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });


    // // Create a new note
    // app.post("/notes/save/:id", function (req, res) {
    //     // Create a new note and pass the req.body to the entry
    //     var newNote = new Note({
    //         body: req.body.text,
    //         article: req.params.id
    //     });
    //     console.log(req.body)
    //     // And save the new note the db
    //     newNote.save(function (note) {
    //         // Use the article id to find and update it's notes
    //         db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
    //             .then(function (err) {
    //                 res.send(note);

    //             })
    //             .catch(function (err) {
    //                 // If an error occurred, send it to the client
    //                 res.json(err);
    //             });;
    //     });
    // });

}