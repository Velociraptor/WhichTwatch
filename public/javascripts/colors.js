var score = '#{movie.viewers}';
var current = $("span[class='label viewers #{movie.title}']");
console.log(current);
console.log(score);
if (score > 70) {
	current.addClass('label-success');
} else if (score > 50) {
	current.addClass('label-warning');
} else {
	current.addClass('label-important');
}
score = '#{movie.critics}';
current = $("span[class='label critics #{movie.title}']");
console.log(current);
console.log(score);
if (score > 70) {
	current.addClass('label-success');
} else if (score > 50) {
	current.addClass('label-warning');
} else {
	current.addClass('label-important');
}