const { mongoose } = require('./mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token:{
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.generateAuthToken = function () {
	var access = 'auth';
	var token = jwt.sign({_id: this._id.toHexString(), access}, 'abc123').toString();

	this.tokens.push({access, token});
	this.save();
	return token;
};

UserSchema.methods.removeToken = function (token) {
	return this.update({
		$pull: {
			tokens: {
				tokens: {token}
			}
		}
	});
}

UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;

	try {
		decoded = jwt.verify(token, 'abc123');
	}catch(e) {
		return Promise.reject();
	}

	return User.findOne({
		'_id':decoded._id, 
		'tokens.token':token, 
		'tokens.access':'auth'
	});
};

var user = mongoose.model('user', UserSchema);

module.exports = {
    user
}
