$(document).ready(function(){
	$('#search').submit(function () {
		var genre = $('#genre').val() || 'any';
		var rating = $('#rating').val() || 'any';
		$.post("/search", { "genre": genre, "rating": rating },
			function(err){
				console.log(err);
				console.log('hi');
		        if (err){
		 	      	console.log('error',err);
		        }
		        else{
		           	console.log('hi');
		           	$('#genre').val('');
					$('#rating').val('');
		           	updateMovies();
				}
		    });
		return false;
	});
});

function updateMovies(){
  $.get('/update', function(data){
    $('#movies').html(data);
  });
}
