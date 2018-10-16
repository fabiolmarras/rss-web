
var sentimentText = function(username, password,text,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version': '2018-03-16'
	});

	var parameters = {
	  'text': text,
	  'features': {
		'sentiment': {}
	  }
	};
	
	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
};


 var conceptsURL = function(username, password,url,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version_date': '2018-03-16'
	});

	var parameters = {
	  'url': url,
	  'features': {
	    'concepts': {
	      'limit': 3
	    }
	  }
	};

	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
};

var conceptsText = function(username, password,text,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version_date': '2018-03-16'
	});

	var parameters = {
	  'text': text,
	  'features': {
	    'concepts': {
	      'limit': 5
	    }
	  }
	};

	
	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
	
};

var entitiesText = function(username, password,text,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version_date': '2018-03-16'
	});

	
	var parameters = {
	  'text': text,
	  'features': {
		'entities': {
		      'sentiment': false,
		      'emotion': false,
		      'limit': 10
		 }
	  }
	};
	

	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
};

var entitiesURL = function(username, password,url,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version_date': '2018-03-16'
	});

	var parameters = {
	  'url': url,
	  'features': {
		'entities': {
		      'sentiment': false,
		      'emotion': false,
		      'limit': 15
		 }
	  }
	};
	
	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
};

var keywordsText = function(username, password,text,callback){
	var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
	var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': username,
	  'password': password,
	  'version_date': '2018-03-16'
	});

	
	var parameters = {
	  'text': text,
	  'features': {
		'keywords': {
		      'sentiment': false,
		      'emotion': false,
		      'limit': 10
		 }
	  }
	};
	

	natural_language_understanding.analyze(parameters, function(err, response) {
	  return callback(err,response);	 
	});
};


var functions = ['concepts','entities','keywords','sentiment'];

if (process.argv.length < 6){
	console.log("Usage node nlu <user> <pwd> <function> <text|url>");
	//process.exit();
}else{
	var args = process.argv.slice(2);
	if (functions.indexOf(args[2].toLowerCase())===-1){
		console.log("function "+args[2]+ " not supported");
		console.log("Usage node nlu <function> <text|url>");
		//process.exit();
	}
	else
	{
		
		if (args[3].startsWith("http"))
		{
			if (args[2].toLowerCase() === 'concepts')
			{
				console.log('Geeting concepts from '+ args[3]);
				conceptsURL(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}	
			if (args[2].toLowerCase() === 'entities')
			{
				console.log('Getting entities from '+ args[3]);
				entitiesURL(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}	
		}	
		else
		{
			if (args[2].toLowerCase() === 'concepts')
			{
				console.log('Geeting concepts from '+ args[3]);
				conceptsText(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}	
			
			if (args[2].toLowerCase() === 'sentiment')
			{
				console.log('Geeting concepts from '+ args[3]);
				sentimentText(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}	
			
			if (args[2].toLowerCase() === 'entities')
			{
				console.log('Getting entities from '+ args[3]);
				entitiesText(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}
			
			if (args[2].toLowerCase() === 'keywords')
			{
				console.log('Getting keywords from '+ args[3]);
				keywordsText(args[0], args[1],args[3],function(err,response){
					if (err)
						console.log("error:", err);
					else
						console.log(JSON.stringify(response, null, 2));
				});
			}
		}	
	}
}


module.exports.conceptsURL = conceptsURL;

module.exports.conceptsText = conceptsText;

module.exports.entitiesText = entitiesText;

module.exports.entitiesURL = entitiesURL;

module.exports.keywordsText = keywordsText;

module.exports.sentimentText = sentimentText;
