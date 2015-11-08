Meteor.methods({
	'learn': function(inserts,mls){
		//yuck! let's rewrite this code at some point.
		var agentIds = _.keys(inserts.agents);
		var officeIds = _.keys(inserts.offices);
		var agentListings = _.groupBy(Listings.find({agent: {$in:agentIds}}).fetch(),'agent');
		var officeListings = _.groupBy(Listings.find({office: {$in:officeIds}}).fetch(),'office');
		var existingAgentIds = Agents.find({_id: {$in: agentIds}}, {fields:{_id:1}}).map(function(a){return a._id});
		var existingOfficeIds = Offices.find({_id: {$in: officeIds}}, {fields:{_id:1}}).map(function(o){return o._id});
		officeIds.forEach(function(id){
			if (Meteor.settings.FORMAT.VERBOSE){
				console.log('learning an office...');
			}
			var brain = new synaptic.Architect.Perceptron(4,5,1);
			var book = new synaptic.Trainer(brain);
			var hasZero = false;
			var homework = officeListings[id].map(function(l){
				if (_.isEqual(l.input, [0,0,0,0])){
					hasZero = true;
				}
				return {input: l.input, output:l.output}
			});
			if (!hasZero){
				homework.push({input:[0,0,0,0],output:[0]})
			}
			var aptitude = book.train(homework);
			var mongoOffice = {
				brain: brain.toJSON(),
				aptitude: aptitude
			}
			if (!_.contains(existingOfficeIds, id)){
				if (Meteor.settings.FORMAT.VERBOSE){
					console.log('  fetching office metadata..')
				}
				try {
					var data = offices({id: id});
				} catch(error){
					throw error;
				}
				var office = data.bundle[0];
				mongoOffice.city = office.city;
				mongoOffice.name = office.name;
				mongoOffice.phone = parsePhone(office.phone);
				mongoOffice.status = office.status
				mongoOffice.state = office.state;
				mongoOffice.mls = mls;
			}
			Offices.upsert(id, {$set: mongoOffice})
		})
		agentIds.forEach(function(id){
			if (Meteor.settings.FORMAT.VERBOSE){
				console.log('learning an agent');
			}
			var brain = new synaptic.Architect.Perceptron(4,5,1);
			var book = new synaptic.Trainer(brain);
			var hasZero = false;
			var homework = agentListings[id].map(function(l){
				if (_.isEqual(l.input, [0,0,0,0])){
					hasZero = true;
				}
				return {input: l.input, output:l.output}
			});
			if (!hasZero){
				homework.push({input:[0,0,0,0],output:[0]})
			}
			var aptitude = book.train(homework);
			var mongoAgent = {
				brain: brain.toJSON(),
				aptitude: aptitude
			}
			if (!_.contains(existingAgentIds, id)){
				if (Meteor.settings.FORMAT.VERBOSE){
					console.log('  fetching agent metadata..')
				}
				try {
					var data = agents({id: id});
				} catch(error){
					throw error;
				}
				var agent = data.bundle[0];
				mongoAgent.firstName = agent.firstName;
				mongoAgent.lastName = agent.lastName;
				mongoAgent.homePhone = parsePhone(agent.homePhone);
				mongoAgent.cellPhone = parsePhone(agent.cellPhone);
				mongoAgent.officePhone = parsePhone(agent.officePhone);
				mongoAgent.status = agent.status;
				mongoAgent.office = agent.office;
				mongoAgent.mls = mls;
			}
			Agents.upsert(id, {$set: mongoAgent})
		})
	}
})