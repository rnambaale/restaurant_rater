var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log("Here Archive");
});

router.get('/remove', function(req, res, next) {
    var db          = req.db;
    // var collection  = db.get('reviews');
    // collection.remove();
});

router.get('/update_rest', function(req, res, next) {
    var db          = req.db;
    var collection  = db.get('restaurants');

    collection.update({slug:'rest-two'}, {$set:{review_count:0, review_total:0, review_average: 0}}, function (err, doc) {
        if (err){
            console.log(err);
        }else{
            res.render('success',
                {
                    title : 'Project - Success',
                    text : 'Updated.',
                    the_class: 'success'
                }
            );
        }
    });
    
});

module.exports = router;
