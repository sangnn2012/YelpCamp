var express = require("express");
var router = express.Router();
var Campground = require("../models/campGround");
var middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

//New - show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//CREATE - adds new campgrounds to database
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;   
    var author = {
        id: req.user._id,
        username : req.user.username
    }

    var newCampground = {name: name, image: image, description: description, author: author};

    //Create new campground and save to the db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated.toString());
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log("Found Campground: " + foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "You are trying to update a campground that doesn't exist");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE campground route
router.put("/:id", function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findOneAndDelete(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;