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
mongoose.connect("mongodb://localhost:27109/movies-app", {useNewUrlParser: true});

var saltRounds = 8;
var session = [];

// Models

var showSchema = new mongoose.Schema({
	name: {type: String, max: 1000},
	startDate: {type: Date},
	country: {type: String},
	status: {type: String},
	network: {type: String},
	image: {type: String}
});

var userSchema = new mongoose.Schema({
	name: {typr: String},
	username: {type: String, max: 100},
	password: {type: String, max: 1000},
	likedMovies: [showSchema]
});

var User = mongoose.model("User", userSchema);

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
			session.push({userId: user._id});
			var cookie = {
				userId: user._id,
				message: "success"
			}
			console.log(cookie);
			console.log(user);
			res.redirect(200, "/index")
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
				console.log(user);
				res.redirect(200, "/index");
			}
		});
	}
});

// ===========================================================

var port = 8000;

app.listen(port, process.env.IP, function(req, res) {
	console.log("The TV Shows App has started!");
});