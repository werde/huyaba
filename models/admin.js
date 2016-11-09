var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
	name: String,
	password: String
})

AdminSchema.methods.verifyPassword = function(password)
{
	return (this.password == password);
}

mongoose.model('Admin', AdminSchema);