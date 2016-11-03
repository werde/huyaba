var mongoose = require('mongoose');
var board = mongoose.model('Board');
var Post = mongoose.model('Post');

function k(images)
{
	var pri = {};

	for (var i in images)
	{
		var iname = images[i].originalname.split(".")[0];
		if (iname[0] != 's') continue;
		if (images[i].originalname.split(".")[1] != "png") continue;
		console.log(iname);
		for (var j in images)
		{
			if (i == j) continue;
			var jname = images[j].originalname.split(".")[0];
			if (jname[0] == 's') continue;
			console.log(jname + " " + iname);
			if (("s" + jname) == iname)
			{
				console.log(jname + " " + iname);
				pri[i] = j;
			}
		}
	}

	return pri;
}

//get thread
exports.getThread = function(req, res, next)
{
	var posts = [];
	posts.push(req.thread);

	var query = Post.find({thread: req.thread});

	query.exec(function(err, postsB)
	{
		if (err) return next(err);

		res.json(posts.concat(postsB));
	})
}

exports.postThread = function(req, res, next)
{
	var files = req.files;
	var fields = req.body;
	var thread = new Post();

	thread.root = true;
	thread.board = req.board;
	thread.mail = fields.mail;
	thread.author = fields.author;
	thread.title = fields.title;
	thread.body = fields.body;
	thread.bumped = new Date();
	thread.created = new Date();

	var pri = k(req.files);
	console.log(pri);

	thread.attach = [];
	for (var i in pri)
	{
		thread.attach.push({image : files[pri[i]].filename, preview: files[i].filename});
	}


	console.log(thread);

	thread.save(function(err, thread)
	{
		if (err) return next(err);

		res.json(thread);
	})
}

exports.postPost = function(req, res, next)
{
	var files = req.files;
	var fields = req.body;
	var post = new Post();

	post.root = false;
	post.board = req.board;
	post.thread = req.thread;
	post.mail = fields.mail;
	post.author = fields.author;
	post.title = fields.title;
	post.body = fields.body;
	post.bumped = new Date();
	post.created = new Date();

	var pri = k(req.files);
	console.log(pri);

	thread.attach = [];
	for (var i in pri)
	{
		thread.attach.push({image : files[pri[i]].filename, preview: files[i].filename});
	}


	console.log(post);

	post.save(function(err, post)
	{
		if (err) return next(err);

		res.json(post);
	})
}

/*
	mail: String,
	author: String,
	body: String,
	attach: [{type: String}],
	thread: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
	root: Boolean,
	board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'},
	bumped: Date,
	created: Date
*/