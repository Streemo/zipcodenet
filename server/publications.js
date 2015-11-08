//refactor...
Meteor.publish('agents', function(input, mls){
	var self = this;
	if (!Match.test(input, Patterns.NeuralInput)){
		self.ready();
	}
	if (!Match.test(mls, Patterns.String)){
		self.ready();
	}
	var qString = 'cache.'+input.join('');
	var query = {
		status:"Active",
		mls: mls
	}
	query[qString] = {$gt: .8}
	var fields = {
		firstName:1,
		lastName:1,
		homePhone:1,
		officePhone:1,
		cellPhone:1,
		office:1
	}
	var sort = {};
	sort[qString] = -1
	fields[qString] = 1;
	return Agents.find(query,{fields:fields, sort: sort});
	// var inputString = input.join('');
	// var handle = Agents.find({status: "Active", mls:mls}).observeChanges({
	// 	added: function(id, fields){
	// 		if (!fields.cache || !fields.cache[inputString]){
	// 			var brain = synaptic.Network.fromJSON(fields.brain);
	// 			fields.score = brain.activate(input)[0];
	// 		} else {
	// 			fields.score = fields.cache[inputString]
	// 		}
	// 		delete fields.brain
	// 		delete fields.aptitude
	// 		delete fields.mls
	// 		delete fields.cache
	// 		var cache = {};
	// 		cache[inputString] = fields.score;
	// 		Agents.update(id, {$set:{cache:cache}})
	// 		if (fields.score < .8){
	// 			return;
	// 		}
	// 		self.added('agents',id,fields)
	// 	},
	// 	changed: function(id, fields){
	// 		if (fields.brain){
	// 			var brain = synaptic.Network.fromJSON(fields.brain);
	// 			fields.score = brain.activate(input)[0];
	// 			delete fields.brain
	// 			delete fields.aptitude
	// 			delete fields.mls
	// 			var cache = {};
	// 			cache[inputString] = fields.score;
	// 			Agents.update(id, {$set:{cache:cache}})
	// 			if (fields.score < .8){
	// 				return;
	// 			}
	// 		}
	// 		self.changed('agents', id, fields)
	// 	},
	// 	removed: function(id){
	// 		self.removed('agents', id)
	// 	}
	// })
	// self.ready();
	// self.onStop(function(){
	// 	handle.stop();
	// })
})

Meteor.publish('offices', function(input,mls){
	var self = this;
	if (!Match.test(input, Patterns.NeuralInput)){
		self.ready();
	}
	if (!Match.test(mls, Patterns.String)){
		self.ready();
	}
	var qString = 'cache.'+input.join('');
	var query = {
		status:"Active",
		mls: mls
	}
	query[qString] = {$gt: .8}
	var fields = {
		state:1,
		name:1,
		phone:1,
		city:1
	}
	var sort = {};
	sort[qString] = -1
	fields[qString] = 1;
	return Offices.find(query,{fields:fields, sort: sort});
	// var inputString = input.join('');
	// var handle = Offices.find({status: "Active", mls: mls},{fields:{cache:0}}).observeChanges({
	// 	added: function(id, fields){
	// 		if (!fields.cache || !fields.cache[inputString]){
	// 			var brain = synaptic.Network.fromJSON(fields.brain);
	// 			fields.score = brain.activate(input)[0];
	// 		} else {
	// 			fields.score = fields.cache[inputString]
	// 		}
	// 		delete fields.brain
	// 		delete fields.aptitude
	// 		delete fields.mls
	// 		delete fields.cache
	// 		var cache = {};
	// 		cache[inputString] = fields.score;
	// 		Offices.update(id, {$set:{cache:cache}})
	// 		if (fields.score < .8){
	// 			return;
	// 		}
	// 		self.added('offices',id,fields)
	// 	},
	// 	changed: function(id, fields){
	// 		if (fields.brain){
	// 			var brain = synaptic.Network.fromJSON(fields.brain);
	// 			fields.score = brain.activate(input)[0];
	// 			delete fields.brain
	// 			delete fields.aptitude
	// 			delete fields.mls
	// 			var cache = {};
	// 			cache[inputString] = fields.score;
	// 			Offices.update(id, {$set:{cache:cache}})
	// 			if (fields.score < .8){
	// 				return;
	// 			}
	// 		}
	// 		self.changed('offices', id, fields)
	// 	},
	// 	removed: function(id){
	// 		self.removed('offices', id)
	// 	}
	// })
	// self.ready();
	// self.onStop(function(){
	// 	handle.stop();
	// })
})