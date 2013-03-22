// Rotten Tomatoes Setup Stuff
var apikey = process.env.ROTTEN_KEY;
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var moviesSearchUrl = baseUrl + '/movies.json?apikey=' + apikey;
var theatersUrl = "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=" + apikey;
// This last url should be able to get us current movies in theaters in a list with all the info we need as well,
// so we could grab those and stick into a database
// but I don't know how we would want to update that db or how we would get away with not using one
// Also, I've been looking at how to do server side ajax posts for db queries serverside but 
// I don't know if we can do that either.



var models = require('../models'),
Movie = models.Movie;
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.update = function(req, res){
  Movie.find().sort({'_id' : 'descending'}).exec(function(err,data){
    if (err)
      return console.log ('error', err);
    res.render('_movies', {Movies: data});
  });
};

exports.search = function(req, res){
	// Do some stuff with twitter and db and rottentomatoes
};

function movieSearch (query) {
	var url = moviesSearchUrl + '&q=' + encodeURI(query);
}