var http = require('http'),
	models = require('../models'),
	mongoose = require('mongoose')
	Movie = models.Movie;


// Rotten Tomatoes Setup Stuff
var apikey = process.env.ROTTEN_KEY;
var baseUrl = "api.rottentomatoes.com"
var basePath = "/api/public/v1.0";
var moviesSearchUrl = '/movies.json?apikey=' + apikey;
var theatersUrl = "/lists/movies/in_theaters.json?apikey=" + apikey;
// This last url should be able to get us current movies in theaters in a list with all the info we need as well,
// so we could grab those and stick into a database
// but I don't know how we would want to update that db or how we would get away with not using one
// Also, I've been looking at how to do server side ajax posts for db queries serverside but 
// I don't know if we can do that either.


exports.index = function(req, res){
	movieSearch();
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

exports.movies = function(req,res){ 
	//console.log('zip: '+ req.body['zip']);
	var zipcode = req.body['zip'];
	var start = 0;
	var title_list = [];

	while (start < 30) {

		var requestUrl ='/ig/api?movies='+zipcode+'&start='+start;
		//console.log(requestUrl);

		var options = {
			hostname: 'www.google.com',
			port: 80,
			path: requestUrl,
			method: 'GET'
		};

		var request = http.request(options, function(result) {
		  //console.log('STATUS: ' + res.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		  result.setEncoding('utf8');
		  result.on('data', function (chunk) {
		  	//console.log('BODY: ' + chunk);
		  	var more_titles = true;
		  	title_start = 0;
		  	while (more_titles == true) {
		  		title_index = chunk.indexOf('title data', title_start) + 12;
			  	if (title_index != 11) {
			  		title_end = chunk.indexOf('/>', title_index) - 1;
			  		new_title = chunk.slice(title_index, title_end);
			  		//console.log(new_title);
			  		title_list.push(new_title);
			  		console.log(title_list);
			  		title_start = title_end;
			  	} else {
			  		more_titles = false;
			  	};
		  };
	    });
		});

		request.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		// write data to request body
		//request.write('data\n');
		//request.write('data\n');
		console.log(title_list);
		request.end();

		start = start + 3;
		
	};

	console.log('bananas!');
	console.log(title_list);
};

function movieSearch () {
	var output = '';
	var options = {
		hostname: baseUrl,
		port: 80,
		path: basePath + theatersUrl,
		method: 'GET',
		headers: {'Content-Type': 'application/json'}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			output += chunk;
		});
		res.on('end', function(){
			var obj = JSON.parse(output);
			saveToDB(obj);
		})
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	req.end();
}

function saveToDB (obj) {
	var movies = obj.movies
	movies.forEach(function(movie){
		var dbMovie = new Movie({
			title: movie.title,
			genre: String,
			MPAA: movie.mpaa_rating,
			poster: movie.poster.detailed,
			synopsis: movie.synopsis,
			critics: movie.ratings.critics_score,
			viewers: movie.ratings.audience_score,
			tags: [{tag: String, hits: int}]
		})
	})
}