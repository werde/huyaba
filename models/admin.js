var CryptoJS = require("crypto-js");
var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
	name: String,
	password: String
})

AdminSchema.methods.verifyPassword = function(password)
{
	var bytes  = CryptoJS.AES.decrypt(this.password, 'secret key 123');
	var plaintext = bytes.toString(CryptoJS.enc.Utf8);

	console.log("plaintext " + plaintext);
	console.log("password " + password);

	return (plaintext == password);
}

mongoose.model('Admin', AdminSchema);

//
/* 
// Encrypt 
var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123');
 
// Decrypt 
var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);
 
console.log(plaintext);
*/