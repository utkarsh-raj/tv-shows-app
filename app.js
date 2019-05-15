// Import modules

var express        = require("express"),
	bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	methodOverride = require("method-override"),
	bcrypt         = require("bcrypt");

// Application setup

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/movies-app");

var saltRounds = 8;
var session = [];

// Models

var showSchema = new mongoose.Schema({
	name: {type: String, required: true, max: 1000}
	startDate: {type: Date},
	country: {type: String},
	status: {type: String},
	network: {type: String},
	image: {type: String}
});

var userSchema = new mongoose.Schema({
	name: {typr: String, required: true},
	username: {type: String, required: true, max: 100},
	password: {type: String, required: true, max: 1000},
	likedMovies: [showSchema]
});

var User = mongoose.model("User", userSchema);

// Routes
// ===========================================================

app.get("/", function(req, res) {
	res.render("landing");
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
			res.redirect("/signup");
		}
		else {
			session.push({userId: user._id});
			var cookie = {
				userId: user._id,
				message: "success"
			}
			res.redirect("/index", {cookie: cookie})
		}
	});
});

// POST Signup

app.post("/signup", function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if (password === password2) {
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
				session.push({userId: user._id});
				var cookie = {
					userId: user._id,
					message: "success"
				}
				res.redirect("/index", {cookie: cookie})
			}
		});
	}
});

// ===========================================================

var port = 8000;

app.listen(port, process.env.IP, function(req, res) {
	console.log("The TV Shows App has started!");
});