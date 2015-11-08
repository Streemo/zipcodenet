parsePhone = function(phone){
	return phone ? phone.replace(/[^0-9]/g,'') : null;
}