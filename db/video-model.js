const { mongoose } = require('./mongoose');

var VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    des: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    _creator: {
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});

var video = mongoose.model('video', VideoSchema);

module.exports = {
    video
}