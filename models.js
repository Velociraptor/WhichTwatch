var mongoose = require('mongoose');

var MovieSchema = mongoose.Schema({
	title: String,
	runtime: Number,
	MPAA: String,
	poster: String,
	synopsis: String,
	critics: Number,
	viewers: Number,
	tags: [{tag: String, hits: Number}]
});

var Movie = mongoose.model('Movie', MovieSchema);
exports.Movie = Movie;
