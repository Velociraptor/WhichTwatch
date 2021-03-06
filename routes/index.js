
var http = require('http'),
	models = require('../models'),
	mongoose = require('mongoose'),
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
	var taglist = [];
  Movie.find().sort({'title': 'ascending'}).exec(function(err,results){
    results.forEach(function(movie) {
      req.api('search/tweets').get({
        q: movie.title,
        count: 100
      }, function (err, search) {
      	var text = "";
        for (var j = 0; j < search.statuses.length; j++) {
        	//add status to string
        	textParse(search.statuses[j].text, movie.title);
        	//if (j==search.statuses.length-1) {
        		res.render('index', { title: 'Which t\'Watch', Movies: results, tags: taglist});
        	//}
        };
        
      });
    });
			// taglist.push(movie.tags);
			// // console.log(taglist);
	});
};

exports.update = function(req, res){
	var searchTags = req.body.tags;
	console.log(searchTags);
	Movie.find().sort({'title' : 'ascending'}).exec(function(err,movies){
		if (err)
			return console.log ('error', err);
		for(var i=0; i<movies.length; i++){
			movies[i].totalHits = 0;
			for(var j=0; j<movies[i].tags.length; j++){
				for(var k=0; k<searchTags.length; k++){
					if (movies[i].tags[j].tag == searchTags[k]){
						//console.log('adding hit')
						movies[i].totalHits += movies[i].tags[j].hits;
					}
				}
			}
			//console.log(movies[i]);
			movies[i].save(function(err){
				if (err){
					return console.log("error", err);
				}
			});
		}
		Movie.find().sort({'totalHits':'descending'}).exec(function(err,Movies){
			if (err)
				return console.log ('error', err);
			//console.log(data);
    		res.render('_movies', {Movies: Movies});
		});
  });
};

function sortByTags (movies, searchTags) {
	//console.log(movies);
	for(var i=0; i<movies.length; i++){
		movies[i].totalHits = 0;
		for(var j=0; j<movies[i].tags.length; j++){
			for(var k=0; k<searchTags.length; k++){
				if (movies[i].tags[j].tag == searchTags[k]){
					//console.log('adding hit')
					movies[i].totalHits += movies[i].tags[j].hits;
				}
			}
		}
		//console.log(movies[i]);
		movies[i].save(function(err){
			if (err){
				return console.log("error", err);
			}
		});
	}
	Movie.find().sort({'totalHits':'descending'}).exec(function(err,data){
		if (err)
			return console.log ('error', err);
		//console.log(data);
		return data;
	});
}

// exports.movies = function(req,res){ 
// 	//console.log('zip: '+ req.body['zip']);
// 	var zipcode = req.body['zip'];
// 	var start = 0;
// 	var title_list = new Array();

// 	while (start < 30) {

// 		var requestUrl ='/ig/api?movies='+zipcode+'&start='+start;
// 		//console.log(requestUrl);

// 		var options = {
// 			hostname: 'www.google.com',
// 			port: 80,
// 			path: requestUrl,
// 			method: 'GET'
// 		};

// 		var request = http.request(options, function(result) {
// 		  //console.log('STATUS: ' + res.statusCode);
// 		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
// 		  result.setEncoding('utf8');
// 		  result.on('data', function (chunk) {
// 		  	//console.log('BODY: ' + chunk);
// 		  	var more_titles = true;
// 		  	title_start = 0;
// 		  	while (more_titles == true) {
// 		  		title_index = chunk.indexOf('title data', title_start) + 12;
// 			  	if (title_index != 11) {
// 			  		title_end = chunk.indexOf('/>', title_index) - 1;
// 			  		new_title = chunk.slice(title_index, title_end);
// 			  		//console.log(new_title);
// 			  		title_list.push(new_title);
// 			  		console.log(title_list);
// 			  		title_start = title_end;
// 			  	} else {
// 			  		more_titles = false;
// 			  	};
// 		  };
// 	    });
// 		});

// 		request.on('error', function(e) {
// 		  console.log('problem with request: ' + e.message);
// 		});

// 		// write data to request body
// 		//request.write('data\n');
// 		//request.write('data\n');
// 		console.log(title_list);
// 		request.end();

// 		start = start + 3;
		
// 	};

// 	console.log('bananas!');
// 	console.log(title_list);
// };

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
	Movie.remove().exec(function(err,data){
		if (err)
			return console.log ('error', err);
		var movies = obj.movies
		movies.forEach(function(movie){
			var dbMovie = new Movie({
				title: movie.title,
				runtime: movie.runtime,
				MPAA: movie.mpaa_rating,
				poster: movie.posters.original,
				synopsis: movie.synopsis,
				critics: movie.ratings.critics_score,
				viewers: movie.ratings.audience_score
				// tags:[{tag: 'any', hits: 1}]
			});
			dbMovie.save(function(err){
				if (err){
					return console.log('error', err);
				}
			});
		});
	});
}

function textParse (inputTweet, inputMovie) {
	//console.log('tweet: ', inputTweet);
	//console.log('title: ', inputMovie);
	var all_tags = ["guns", "cars", "action", "horror", "alien", "boring", "music", "awesome", "dinosaur", "drunk", "hot", "drama", "comedy", "family", "book","scifi", "romance", "awful", "ridiculous", "inspiration", "funny", "story", "think", "kids"];
	var all_hits = [];
	for(var j=0; j<all_tags.length; j++){
		all_hits.push(0);
	};
	//console.log(all_hits);
	var common_string = 'a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your';
	var common_punc = '.,?!&()';
	//get words not in common list from inputTweet
	var new_list = inputTweet.split(' ');
	var new_keywords = [];
	//new_list.forEach(function(word) {
	for(var i=0; i<new_list.length; i++){
		var word = new_list[i];
		if (common_punc.indexOf(word[word.length - 1]) != -1) {
			word = word.slice(0,word.length-1);
		}
		if (common_string.indexOf(word) == -1) {
			//new_keywords.push(word.toLowerCase());
			word = word.toLowerCase();
			var q = all_tags.indexOf(word);
			if (q != -1) {
				new_keywords.push(word);
				//console.log(word);
				//console.log(q);
				//console.log(all_hits[q]);
				//all_hits[q] = all_hits[q]+1;
				//console.log(word, all_hits);

			};
		};
	};
	//console.log('new keywords: ', new_keywords);
	
	//add new keywords to tags of movie, or increment hit counter if not new word
	var movie = Movie.findOne({'title': inputMovie}).exec(function(err, movie) {
		//all_tags.forEach(function(keyword) {
		//console.log(movie);
		//console.log('all hits:', all_hits);
		for(var k=0; k<new_keywords.length; k++){
			var keyword1 = new_keywords[k];
			//var hits1 = all_hits[k];

			// if (!(keyword in movie.keywords)) {
			// 	movie.keywords[keyword] += 1;
			// } else {
			// 	movie.keywords.push({keyword:1});
			// };
			
			//console.log('movie', movie);
			//console.log('movie tags', movie.tags);
			//movie.tags.push({'tag':keyword1,'hits':hits1});
			movie.tags.push({'tag':keyword1,'hits':1});
			//console.log(inputMovie, 'new movie tags: ', movie.tags);

		};

		//console.log(movie);
		movie.save(function(err){
				if (err){
					return console.log("error", err);
				}
			});
		
	});
	//Movie.update({'name': inputMovie}, {'tags':new_tags}).exec(function(err, movie1){
	
	};
