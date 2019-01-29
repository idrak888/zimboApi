const { mongoose } = require('./mongoose');

var CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videos: [{
      title: String,
      des: String,
      link: String
    }],
    _creator: {
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});

var collection = mongoose.model('collection', CollectionSchema);

module.exports = {
    collection
}
