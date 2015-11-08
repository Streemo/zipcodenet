Meteor.startup(function(){
	synaptic = Meteor.npmRequire('synaptic')
	Server = DDP.connect('http://127.0.0.1:1710')
	var BRAIN = Meteor.settings.BRAIN
	var thought = BRAIN.THOUGHT
	if (Meteor.settings.FORMAT.VERBOSE){
		var total = 0;
		var totalInserted = 0;
	}
	var inserts = {
		agents:{},
		offices:{}
	}



	// Agents.find().forEach(function(agent){
	// 	var cache = {};
	// 	var brain = synaptic.Network.fromJSON(agent.brain);
	// 	cache['1000'] = brain.activate([1,0,0,0])[0];
	// 	cache['0100'] = brain.activate([0,1,0,0])[0];
	// 	cache['0010'] = brain.activate([0,0,1,0])[0];
	// 	cache['0001'] = brain.activate([0,0,0,1])[0];
	// 	cache['0000'] = brain.activate([0,0,0,0])[0];
	// 	cache['1111'] = brain.activate([1,1,1,1])[0];
	// 	cache['1100'] = brain.activate([1,1,0,0])[0];
	// 	cache['1010'] = brain.activate([1,0,1,0])[0];
	// 	cache['1001'] = brain.activate([1,0,0,1])[0];
	// 	cache['0110'] = brain.activate([0,1,1,0])[0];
	// 	cache['0101'] = brain.activate([0,1,0,1])[0];
	// 	cache['0011'] = brain.activate([0,0,1,1])[0];
	// 	cache['0111'] = brain.activate([0,1,1,1])[0];
	// 	cache['1011'] = brain.activate([1,0,1,1])[0];
	// 	cache['1101'] = brain.activate([1,1,0,1])[0];
	// 	cache['1110'] = brain.activate([1,1,1,0])[0];
	// 	console.log(cache)
	// 	Agents.update(agent._id, {$set: {cache: cache}});
	// })
	// Offices.find().forEach(function(office){
	// 	var cache = {};
	// 	var brain = synaptic.Network.fromJSON(office.brain);
	// 	cache['1000'] = brain.activate([1,0,0,0])[0];
	// 	cache['0100'] = brain.activate([0,1,0,0])[0];
	// 	cache['0010'] = brain.activate([0,0,1,0])[0];
	// 	cache['0001'] = brain.activate([0,0,0,1])[0];
	// 	cache['0000'] = brain.activate([0,0,0,0])[0];
	// 	cache['1111'] = brain.activate([1,1,1,1])[0];
	// 	cache['1100'] = brain.activate([1,1,0,0])[0];
	// 	cache['1010'] = brain.activate([1,0,1,0])[0];
	// 	cache['1001'] = brain.activate([1,0,0,1])[0];
	// 	cache['0110'] = brain.activate([0,1,1,0])[0];
	// 	cache['0101'] = brain.activate([0,1,0,1])[0];
	// 	cache['0011'] = brain.activate([0,0,1,1])[0];
	// 	cache['0111'] = brain.activate([0,1,1,1])[0];
	// 	cache['1011'] = brain.activate([1,0,1,1])[0];
	// 	cache['1101'] = brain.activate([1,1,0,1])[0];
	// 	cache['1110'] = brain.activate([1,1,1,0])[0];
	// 	console.log(cache)
	// 	Offices.update(office._id, {$set: {cache: cache}});
	// })
	var places = Mls.find().fetch();
	get = function(mls, skip, max){
		retsly = Meteor.npmRequire('js-sdk').create('ed6aa51f742be02dc1854965f05d1dff', mls);
		var q = retsly.listings().query({limit:100, acres:{ne:null},squareFootage:{ne:null},price:{ne:null},closePrice:{ne:null},yearBuilt:{ne:null},agent:{ne:null},office:{ne:null},id:{ne: null}})
		agents = retsly.agents();
		agents = Meteor.wrapAsync(agents.getAll, agents);
		offices = retsly.offices();
		offices = Meteor.wrapAsync(offices.getAll, offices);
		try {
			var data = Meteor.wrapAsync(q.getAll,q)({offset: skip})
		} catch(error){
			throw error
		}
		var slimmed = [];
		var b = BRAIN.BIGHOME
		var c = BRAIN.SQUEEZED
		var d = BRAIN.ANTIQUE
		var e = BRAIN.MANSION
		var f = BRAIN.GOODDEAL
		data.bundle.forEach(function(listing){
			var trunc = {
				sqFt: listing.squareFootage,
				stories: listing.stories,
				storiesTotal: listing.storiesTotal,
				sellPrice: listing.price,
				closePrice: listing.closePrice,
				age: listing.yearBuilt,
				office: listing.office,
				agent: listing.agent,
				id: listing.id
			}
			var input = [
				trunc.sqFt > b ? 1 : 0,
				trunc.age < d ? 1 : 0,
				trunc.sellPrice > e ? 1 : 0,
				trunc.stories && trunc.storiesTotal && trunc.stories < trunc.storiesTotal ? 0 : 1
			]
			var output = [
				trunc.closePrice / trunc.sellPrice > f ? 1 : 0
			]
			var listing = {
				input: input,
				output: output,
				agent: trunc.agent,
				office: trunc.office,
				_id: trunc.id
			}
			slimmed.push(listing);
		})
		var uniqueInserts = Server.call('insertListings', {list: slimmed,thought: thought});
		if (Meteor.settings.FORMAT.VERBOSE){
			total+=data.bundle.length
			totalInserted+=uniqueInserts.number
		}
		_.extend(inserts.agents, uniqueInserts.agents)
		_.extend(inserts.offices, uniqueInserts.offices)
		if (data.bundle.length && (skip+100)/100 < max){
			get(mls, skip+100, max)
		} else {
			if (Meteor.settings.FORMAT.VERBOSE){
				console.log('new listings: '+totalInserted)
				console.log('total listings: '+total)
			}
			if (totalInserted){
				if (Meteor.settings.FORMAT.VERBOSE){
					console.log('learning new listings...');
				}
				Meteor.call('learn', inserts, mls, function(error, result){
					if (error){
						throw error
					} else {
						if (Meteor.settings.FORMAT.VERBOSE){
							console.log('finished learning new listings.')
						}
					}
				});
			}
		}
	}
	if (Meteor.settings.BRAIN.UPDATING){
		places.forEach(function(place){
			get(place.mls,0, 500)
		})
	}
})




