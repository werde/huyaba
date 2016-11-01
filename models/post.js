var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema(
{
	mail: String,
	author: String,
	title: String,
	body: String,
	attach: [{type: String}],
	thread: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
	root: Boolean,
	board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'},
	bumped: Date,
	created: Date
})

mongoose.model('Post', PostSchema);