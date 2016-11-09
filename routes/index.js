var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Board = mongoose.model('Board');
var Post = mongoose.model('Post');

var multer  = require('multer')
var storage = multer.diskStorage({
	destination: function (req, file, cb) 
	{
		cb(null, './public/uploads')
	},
	filename: function (req, file, cb) 
	{
		var validFormats = ['jpg', 'gif', 'png', 'jpeg'];

		try
		{
			var fileExtension = file.originalname.split('.').pop();
		} catch(e)
		{
			var fileExtension = '';
		}

		if (validFormats.indexOf(fileExtension) !== -1)
		{
			var filename = (new Date()).getTime() + Math.floor(Math.random() * 10000) + "." + fileExtension;
			cb(null, filename);
		}
	}
});
var upload = multer({ storage: storage });

router.param('board', function(req, res, next, acronym)
{
	var query = Board.find({acronym: acronym});

	query.exec(function(err, board)
	{
		if (err) return next(err)
		if (!board) return next(new Error("board doesnt exist"));
		if (!board[0]) return next(new Error("board doesnt exist"));

		req.board = board[0];

		return next();
	})
})

router.param('thread', function(req, res, next, id)
{
	var query = Post.findById(id);

	query.exec(function(err, thread)
	{
		if (err) return next(err)
		if (!thread) return next(new Error("thread doesnt exist"));

		req.thread = thread;

		return next();
	})
})

	//get admin page
router.get('/admin/index', require('./admin').get)
	//get login admin page
router.get('/admin/login', require('./admin').getLogin)
	//admin post
router.post('/admin/login', require('./admin').login)
	//image upload
router.post('/upload/images', upload.array('file'), require('./upload').uploadImage);
	//index
router.get('/', function(req, res, next)
{
	res.render('index');
})
	//view all boards
router.get('/boards', require('./board').getBoardsList);
	//view board
router.get('/:board', require('./board').getBoard);
	//add a new thread to a board
router.post('/:board', upload.array('file'), require('./post').postThread);
	//get thread
router.get('/:board/:thread', require('./post').getThread);
	//post post
router.post('/:board/:thread', upload.array('file'), require('./post').postPost);

/*
router.get('/:board/:thread/',)
    upvote a thread
    downvote a thread
    upvote a post
    downvote a post
*/


module.exports = router;
