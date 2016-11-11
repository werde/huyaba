var passport = require('passport');
var mongoose = require('mongoose');
var Admin = mongoose.model('Admin');

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