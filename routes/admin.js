var passport = require('passport');
var mongoose = require('mongoose');
var Admin = mongoose.model('Admin');

exports.get = function(req, res, next)
{


	res.render('adminPage');
}

exports.getLogin = function(req, res, next)
{
	res.render('admin');	
}

exports.login = function(req, res, next)
{
	if (!req.body.name || !req.body.password)
		return res.status(400).json({message: 'fill all the fields'});

	console.log('exports.login');
	console.log(req.body.name + " " + req.body.password);

	passport.authenticate('local', function(err, admin, info)
	{
		console.log(admin);
		if (err) return next(err);

		console.log(admin);

		if (admin)
		{
			return res.json({success: 'login' })
		} else
		{
			res.status(401).json(info);
		}
	})(req, res, next)
}