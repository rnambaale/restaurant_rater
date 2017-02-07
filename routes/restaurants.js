var express = require('express');
var sluga = require('sluga');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log("Here Archive");
});

router.get('/restaurant/:restaurant', function(req, res, next) {
    var db                      = req.db;
    var restaurants_collection  = db.get('restaurants');
    var reviews_collection      = db.get('reviews');
    
    if(req.session.user){
        res.locals.session = req.session;
    }

    var restaurant = req.params.restaurant;
    restaurants_collection.findOne({slug: restaurant}, {}, function (err, doc){
        if (!err){
            if(doc){
                console.log(doc);
                get_reviews(restaurant, reviews_collection, function(reviews){
                    res.render('the_restaurant',
                    {
                        title           : doc.name,
                        partition       : 'about',
                        the_restaurant  : doc,
                        reviews         : reviews
                    });
                });
            }else{
                res.render('rest_error', { title : 'Error', message: "No restaurant found" });
            }
        }else{
            console.log(err);
        }
    });
});

router.post('/restaurant/:restaurant', function(req, res, next) {
    var db          = req.db;
    var restaurants = db.get('restaurants');
    var reviews     = db.get('reviews');

    if(!req.session.user){
        res.redirect('/login');
        return;
    }else{
        res.locals.session = req.session;

        var user        = req.session.user.email;
        var restaurant  = req.params.restaurant;

        var review      = req.body.review;
        var data        = req.body;

        restaurants.findOne({slug: restaurant}, {}, function (err, doc){
            if (!err){
                if(doc){
                    data.restaurant = restaurant;
                    data.posted_on = (Date.now() / 1000);
                    data.user = user;
                    
                    reviews.insert(data, function (err, doc) {
                        if (!err){
                            reconcile_reviews_count(restaurant, restaurants, data.rating, function(){
                                res.redirect('/restaurants/restaurant/'+restaurant);
                            });
                        }else{
                            console.log(err);
                        }
                    });
                }else{
                    res.render('rest_error', { title : 'Error', message: "No restaurant found" });
                }
            }else{
                console.log(err);
            }
        });
    }    
});


router.get('/add', function(req, res, next) {
    if(!req.session.user){
        res.redirect('/login');
        return;
    }else{
        res.locals.session = req.session;
        res.render('add_restaurant',
            {
                title : 'Add Restaurant',
            }
        );
    }
});

router.post('/add', function(req, res, next) {
    var db          = req.db;
    var restaurants_collection  = db.get('restaurants');
    
    var name        = req.body.name;
    var formData    = req.body;
    formData.slug    = Math.round((Date.now() / 1000))+'-'+sluga(req.body.name);
    formData.status = 1;
    formData.review_count = 0;
    formData.review_total = 0;
    formData.review_average = 0;

    restaurants_collection.insert([formData], function (err, doc) {
        if (err){
            console.log(err);
            res.send("There was a problem adding the information to the database.");
        }else{
            res.redirect('/');
        }
    });
});

function get_reviews(restaurant, collection, callback){
    collection.find({restaurant: restaurant}, {}, function (err, reviews){
        if (!err){
            callback(reviews);
        }else{
            console.log(err);
            return;
        }
    });
}

function reconcile_reviews_count(restaurant, collection, review, callback){
    collection.findOne({slug: restaurant}, {}, function (err1, doc1){
        if (!err1){
            if(doc1){
                review = Number(review);
                var review_count = doc1.review_count + 1;
                var review_total = doc1.review_total + review;
                var review_average = review_total/review_count;

                collection.update({slug:restaurant},
                    {$set:{review_count:review_count, review_total: review_total, review_average: review_average}}, function (err2, doc2) {

                    if (err2){
                        console.log(err2);
                    }else{
                        callback();
                    }
                });
            }else{
                console.log('Restaurant not found');
            }
        }else{
            console.log(err1);
        }
    });
}

module.exports = router;