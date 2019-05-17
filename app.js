// Import modules

var express        = require("express"),
	bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	methodOverride = require("method-override"),
	bcrypt         = require("bcrypt"),
	queryString    = require("querystring"),
	request        = require("request");

// Application setup

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27109/movies-app", {useNewUrlParser: true});

var saltRounds = 8;
var session = [];

// Models

var showSchema = new mongoose.Schema({
	name: {type: String, max: 1000},
	startDate: {type: String},
	status: {type: String},
	network: {type: String},
	endDate: {type: String},
	image: {type: String}
});

var userSchema = new mongoose.Schema({
	name: {type: String},
	username: {type: String, max: 100},
	password: {type: String, max: 1000},
	likedTvShows: [showSchema]
});

var User = mongoose.model("User", userSchema);
var Show = mongoose.model("Show", showSchema);

// Routes
// ===========================================================

app.get("/", function(req, res) {
	res.render("landing");
});

// GET Login

app.get("/login", function(req, res) {
	res.render("login");
});

// POST Login

app.post("/login", function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	User.find({
		username: username,
		password: password
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.redirect({}, "/signup");
		}
		else {
			if (user.length === 0) {
				res.render("signup");
			}
			else {
				var query = queryString.stringify({
					"id": user[0]._id
				});
				// console.log(cookie);
				console.log(user);
				res.redirect(200, "/index/" + user[0]._id);
			}
		}
	});
});

// GET Signup

app.get("/signup", function(req, res) {
	res.render("signup");
});

// POST Signup

app.post("/signup", function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if (password === password2) {
		User.find({
			username: username
		}, function(err, user) {
			if (err) {
				console.log(err);
			}
			else {
				if (user.length !== 0) {
					res.redirect(200, "/login");
				}
				else {
					User.create({
						name: name,
						username: username,
						password: password
					}, function(err, user) {
						if (err) {
							console.log(err);
							res.redirect("/signup");
						}
						else {
							var query = queryString.stringify({
								"id": user._id
							});
							// console.log(cookie);
							console.log(user);
							res.redirect(200, "/index/" + user._id);
						}
					});
				}
			}
		});
	}
});

// GET Index

app.get("/index/:id", function(req, res) {
	var userId = req.params.id;
	console.log(userId);
	User.find({
		_id: userId
	}, function(err, user) {
		if (err) {
			console.log(err);
		}
		else {
			var userInstance = user[0];
			var url = "https://www.episodate.com/api/most-popular?page=1";
		    request(url, function(error, response, body) {
		        if (!error && response.statusCode == 200) {
		            var data = JSON.parse(body);
		            console.log(data);
		            console.log(userInstance);
		            res.render("index", {data: data, userInstance: userInstance});
		        }
		    });
		}
	});
});

// POST Search

app.post("/search/:id", function(req, res) {
	var userId = req.params.id;
	var search = req.body.search;
	User.find({
		_id: userId
	}, function(err, user) {
		if (err) {
			console.log(err);
		}
		else {
			var userInstance = user[0];
			var url = "https://www.episodate.com/api/search?q=" + search;
		    request(url, function(error, response, body) {
		        if (!error && response.statusCode == 200) {
		            var data = JSON.parse(body);
		            console.log(data);
		            console.log(userInstance);
		            res.render("index", {data: data, userInstance: userInstance});
		        }
		    });
		}
	});
});

app.get("/details/:userId/:tvShowId", function(req, res) {
	var userId = req.params.userId;
	var tvShowId = req.params.tvShowId;

	User.find({
		_id: userId
	}, function(err, user) {
		if (err) {
			console.log(err);
		}
		else {
			user[0].likedTvShows.push()
		}
	})
});

// ===========================================================

var port = 8080;

app.listen(port, process.env.IP, function(req, res) {
	console.log("The TV Shows App has started!");
});