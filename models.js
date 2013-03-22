var mongoose = require('mongoose');

var MovieSchema = mongoose.Schema({
	name: String,
	genre: String,
	rating: String,
});

var Movie = mongoose.model('Movie', MovieSchema);
exports.Movie = Movie;
