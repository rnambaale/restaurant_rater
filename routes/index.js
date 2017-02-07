var express = require('express');
var Bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var moment = require('moment');

var SALT_WORK_FACTOR = 10;
var router = express.Router();


router.get('/', function(req, res, next) {
    var db = req.db;
    var restaurants_collection = db.get('restaurants');

    if(req.session.user){
        res.locals.session = req.session;
    }
    console.log(moment(Date.now()).format('YYYY-MM-DD'));

    restaurants_collection.find({status: 1}, {}, function (err, restaurants){
        if (!err){
            if(!restaurants){

            }else{
                res.render('index',
                    { 
                        title       : 'Home',
                        restaurants : restaurants
                    }
                );
            }
        }else{
            console.log(err);
        }
    });
});

router.get('/login', function(req, res, next) {
    if(req.session.user){
        res.locals.session = req.session;
    }

    if(!req.session.user){
        res.render('login',
        	{
        		title     : 'Project - Login',
        	}
        );
    }else{
        res.redirect('/');
    }
});

router.post('/login', function(req, res, next) {
    var db = req.db;
    var collection = db.get('users');

    var email 		= req.body.email;
    var password 	= req.body.password;

    collection.findOne({email: email}, {}, function (err, doc){
        if (!err){
            console.log(doc);
            if(!doc){
                res.render('login',
                    {
                        message: "No account exists with that email. <a href='/register'>Click here to register</a>"
                    }
                );                
            }else{
                if(doc.status){
                    var hash_password = doc.password;
                    Bcrypt.compare(password, hash_password, function(err, isMatch) {
                        if(err) {
                            return console.log(err);
                        }

                        if (isMatch) {
                            req.session.user = doc;
                            res.locals.session = req.session;
                            res.redirect('/');
                        }else{
                            res.render(
                                'login',
                                {
                                    message: 'Wrong password provided. Click <a href="/recover">here</a> to reset your password'
                                }
                            );
                        }
                    });
                }else{
                    res.render(
                        'login',
                        {
                            message: 'This account is inactive, Please check your email for activation link'
                        }
                    );
                }                
            }
        }else{
            console.log(err);
        }
    });
});

router.get('/register', function(req, res, next) {
    if(req.session.user){
        res.locals.session = req.session;
    }

    res.render('register',
	    {
	    	title: 'Project - Register',
	    	user : req.session.user
	    }
	);
});

router.post('/register', function(req, res, next) {
    var db          = req.db;
    var collection  = db.get('users');
    var email 		= req.body.email;
    var password 	= req.body.password;
    var data        = req.body;

    collection.findOne({email: email}, {}, function (err, doc){
        if (!err){
            if(doc){
                res.render(
                    'register',
                    {
                        title: 'Project - Register',
                        user : req.session.user,
                        message:'Sorry, the email you entered has already been registered.'
                    }
                );
            }else{

                Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    		        if(err) {
    		        	return console.error(err);
    		        }else{
        		        Bcrypt.hash(password, salt, function(err, hash) {
        		        	if(err) {
        		        		return console.error(err);
        		        	}else{
        		        	    data.password = hash;
                                data.status = 0;
        		        	    data.activation_code = generate_code(10);
                                
                                collection.insert(data, function (err, doc) {
                                    if (err){
                                        console.log(data);
                                        console.log(err);
                                        res.send("There was a problem adding the information to the database.");
                                    }else{
                                        //send_verification_mail(data.email, data.activation_code, function(){
                                            res.redirect('/success/');
                                        //});
                                    }
                                });
        		        	}
        		    	});
    		        }
    			});

            }
        }else{
            console.log(err);
        }
    });
});

router.get('/success', function(req, res, next) {
    res.locals.session = req.session;

    if(!req.session.user){
        res.render('success', {
        	title : 'Project - Success',
        	text : 'You have successfully signed up. We have sent an activation link to your email. Please confirm by clicking the link to activate your account.',
        	the_class: 'success',
        	user : req.session.user
        });
    }else{
        res.redirect('/');
    }
});

router.get('/logout', function(req, res, next) {
    req.session = null;
    res.redirect('/');
});

router.get('/verify/:code', function(req, res, next) {
    var db          = req.db;
    var collection  = db.get('users');

    var code = req.params.code;
    collection.findOne({activation_code: code}, {}, function (err, doc1){
        if (!err){
            if(doc1.length == 0){
                res.render('success',
                    {
                        title : 'Project - Success', 
                        text : 'Invalid Link', 
                        the_class: 'danger',
                        user : req.session.user
                    }
                );
            }else{
                collection.update({activation_code:code}, {$set:{status:1}}, function (err, doc2) {
                    if (err){
                        console.log(err);
                    }else{
                        res.render('success',
                            {
                                title : 'Project - Success',
                                text : 'Thank you for activating your account.',
                                the_class: 'success',
                                user : req.session.user
                            }
                        );
                    }
                });
            }

        }else{
           console.log(err);
        }
    });
});

function generate_code(ID_LENGTH) {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

function send_verification_mail(receiver,verification_code, callback){
    var template = process.cwd() + '/views/email_verification.jade';

    fs.readFile(template, 'utf8', function(err, file){
        if(err){
            console.log('ERROR!');
        }
        else {
            var compiledTmpl = _jade.compile(file, {filename: template});
            var context = {code: verification_code};
            var html = compiledTmpl(context);

            var transporter = nodemailer.createTransport("SMTP",{
                service: "Gmail",
                auth: {
                    user: "nambaaler@gmail.com",
                    pass: ""
                }
            });

            var mailOptions = {
                from: 'Project <do-not-reply@remotonline.com>',
                to: receiver,
                subject: 'Account Verification',
                html: html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                    callback();
                }
            });

        }
    });
}

module.exports = router;