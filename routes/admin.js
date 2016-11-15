var passport = require('passport');
var mongoose = require('mongoose');
var Admin = mongoose.model('Admin');
var Board = mongoose.model('Board');
var Post = mongoose.model('Post');

exports.get = function(req, res, next)
{
	res.render('adminPage');
}

exports.getLogin = function(req, res, next)
{
	if (req.cookies.adminCookie == "true")
	{
		res.redirect("/admin/index");
	} else 
	{
		res.render('admin');
	}
}

exports.login = function(req, res, next)
{
	if (!req.body.name || !req.body.password)
		return res.status(400).json({message: 'fill all the fields'});

	passport.authenticate('local', function(err, admin, info)
	{
		if (err) return next(err);

		if (admin)
		{
			res.cookie("adminCookie", true)
			return res.redirect("/admin/index")
		} else
		{
			res.status(401).json(info);
		}
	})(req, res, next)
}

exports.makeBoard = function(req, res, next)
{
	if (!req.body.title || !req.body.acronym || !req.body.url)
		return res.status(401).json({message: 'fill all the fields'});

	var board = new Board();
	board.title = req.body.title;
	board.acronym = req.body.acronym;
	board.url = req.body.url;

	board.save(function(err, board)
	{
		if (err) return next(err);

		res.redirect("/admin/index");
	})
}

exports.deleteBoard = function(req, res, next)
{
	Board.findOne({url: req.body.url}, function(err, board)
	{
		if (err) return next(err);
		if (!board) return next(new Error("no such board"));

		Post.remove({board: board}, function(err)
		{
			if (err) return next(err)

			board.remove(function(err)
			{
				if (err) return next(err);

				res.redirect("/admin/index");
			})
		})
	})
}