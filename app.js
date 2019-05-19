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
	id: {type: String},
	userId: {type: String},
	name: {type: String, max: 1000},
	status: {type: String},
	network: {type: String},
	image: {type: String},
	startDate: {type: String},
	endDate: {type: String}
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
			res.redirect(302, "/signup");
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
				res.redirect(302, "/index/" + user[0]._id);
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
							res.redirect(302, "/index/" + user._id);
						}
					});
				}
			}
		});
	}
	else {
		res.redirect("/signup");
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
		            // console.log(data);
		            // console.log(userInstance);
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
		            // console.log(data);
		            // console.log(userInstance);
		            res.render("index", {data: data, userInstance: userInstance});
		        }
		    });
		}
	});
});

app.get("/favourites/:userId/:tvShowId", function(req, res) {
	var userId = req.params.userId;
	var tvShowId = req.params.tvShowId;

	Show.find({
		userId: userId,
		id: tvShowId
	}, function(err, show) {
		if (err) {
			console.log(err);
		}
		else {
			if (show.length !== 0) {
				User.find({
					_id: userId
				}, function(err, user) {
					if (err) {
						console.log(err);
					}
					else {
						var userInstance = user[0];
						var url = "https://www.episodate.com/api/search?q=" + tvShowId;
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
			}
			else {
				var url = "https://www.episodate.com/api/show-details?q=" + tvShowId;
			    request(url, function(error, response, body) {
			        if (!error && response.statusCode == 200) {
			            var data = JSON.parse(body);
			            console.log(data);
			            Show.create({
			            	userId: userId,
			            	id: tvShowId,
			            	name: data["tvShow"]["name"],
			            	status: data["tvShow"]["status"],
			            	image: data["tvShow"]["image_thumbnail_path"],
			            	network: data["tvShow"]["network"],
			            	startDate: data["tvShow"]["start_date"],
			            	endDate: data["tvShow"]["end_date"]
			            }, function(err, show) {
			            	if (err) {
			            		console.log(err);
			            	}
			            	else {
			            		res.redirect("/favourites/" + userId);
			            	}
			            });
			        }
			    });
			}
		}
	});
});

app.get("/favourites/:userId", function(req, res) {
	var userId = req.params.userId;

	Show.find({
		userId: userId
	}, function(err, shows) {
		var data = shows;
		console.log(data);
		res.render("favourites", {data: data, userId: userId});
	});
});

// ===========================================================

var port = process.env.PORT || 8000;

app.listen(port, process.env.IP, function(req, res) {
	console.log("The TV Shows App has started!");
});