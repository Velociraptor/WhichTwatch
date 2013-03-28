var mongoose = require('mongoose');

var MovieSchema = mongoose.Schema({
	title: String,
	genre: String,
	MPAA: String,
	poster: String,
	synopsis: String,
	critics: int,
	viewers: int,
	tags: [{tag: String, hits: int}]
});

var Movie = mongoose.model('Movie', MovieSchema);
exports.Movie = Movie;