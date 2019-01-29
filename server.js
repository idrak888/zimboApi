const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { video } = require('./db/video-model');
const { user } = require('./db/user-model');
const { collection } = require('./db/collection-model');

var app = express();
var port = process.env.PORT || 3100;

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Expose-Headers", "X-Auth");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth");
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
	}
	next();
});

var authenticate = (req, res, next) => {
	var token = req.header('X-Auth') || req.body.token;

	user.findByToken(token).then((user) => {
		req.user = user;
		req.token = token;
		next();
	}).catch(e => {
		res.status(401).send();
	});
};

app.use(bodyParser.json());

app.get('/collections', authenticate, (req, res) => {
	collection.find({_creator:req.user._id}).then(collection => {
		res.send(collection);	
	});
});

app.get('/videos', authenticate, (req, res) => {
    video.find({_creator:req.user._id}).then(videos => {
        res.send(videos);
    });
});

app.post('/collections', authenticate, (req, res) => {
	var body = _.pick(req.body, ['name', 'videos']);
	var newCollection = new collection({
		name: body.name,
		videos: [],
		_creator: req.user._id
	});
	newCollection.save().then(doc => {
		res.send(doc);
	}).catch(e => {
		res.send(e);	
	});
});

app.post('/videos', authenticate, (req, res) => {
    var body = _.pick(req.body, ['title', 'des', 'link', 'collectionName']);
    var newVideo = new video({
        title: body.title,
        des: body.des,
        link: body.link,
	collectionName: body.collectionName,
        _creator: req.user._id
    });
    if (newVideo.collectionName == '') {
	newVideo.save().then((doc) => {
		res.send(doc);
	}).catch(e => {
		res.send(e);
	});
    }else {
	 collection.find({name:newVideo.collectionName}).then(collection => {
		collection.videos.push(newVideo);	 
	 });
	 collection.save().then((doc) => {
	 	res.send(doc);
	 }).catch(e => {
	 	res.send(e);
	 });
    }  
});

app.delete('/videos', authenticate, (req, res) => {
    video.findOneAndRemove({_creator:req.user._id}).then(video => {
        res.send(video);
    });
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var newUser = new user({
        email: body.email,
        password: body.password
    });

    newUser.save().then(() => {
        res.header('x-auth', newUser.generateAuthToken()).send(newUser);
    }).catch(e => {
        res.status(400).send(e);
    });
});

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	user.findOne({email:body.email}).then(User => {
		if (User.password === body.password) {
			var token = User.generateAuthToken();
			res.header('x-auth', token).send(User.email);
		}else {
			res.status(401).send('Wrong password or email.');
		}
	}).catch(e => {
		res.status(400).send("Email not signed up");
	});	
});

app.get('/users', (req, res) => {
    user.find().then((users) => {
        res.send(users);
    });
});

app.delete('/users', (req, res) => {
    user.find().remove().then(results => {
        res.send(results);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

app.listen(port, () => {
    console.log('server is up on port '+port);
});
