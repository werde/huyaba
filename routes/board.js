var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Post = mongoose.model('Post');

exports.getBoardsList = function(req, res, next)
{
	Board.find(function(err, boards)
	{
		if (err) return next(err);

		res.json(boards);
	})
}

exports.getBoard = function(req, res, next)
{
	var query = Post.find({board: req.board, root: true});

	query.exec(function(err, posts)
	{
		if (err) return next(err);

		res.json(posts);
	})
}