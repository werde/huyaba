var mongoose = require('mongoose');

var BoardSchema = new mongoose.Schema({
	title: String,
	acronym: String,
	url: String
})

mongoose.model('Board', BoardSchema);