Patterns = {};

Patterns.NeuralInput = [Match.OneOf(0,1)];

Patterns.Coordinates = Match.Where(function(value){
	check(value,{lat: Number, lng: Number})
	return true;
})

Patterns.String = Match.Where(function(value){
	check(value,String);
	return !! value.trim();
})

Patterns.Positive = Match.Where(function(value){
	var num = Number(value);
	check(num, Match.Integer);
	return num > 0;
})