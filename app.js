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

var saltRounds = 8;

// Models

// Routes

app.get("/", function(req, res) {
	res.render("landing");
});

// POST Login

app.post("/login", function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
});

var port = 8000;

app.listen(port, process.env.IP, function(req, res) {
	console.log("The TV Shows App has started!");
});