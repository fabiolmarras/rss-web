/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var start = false;
var app = express();
var workspace = '';
var config = require('./config-rss');
var rss = require('./rss/rss');
var nlu = require('./nlu/nlu');
const SEM_DETALHES = 'Detalhes não disponíveis';
const NOTICIA_INCORRETA = 'O Número da notícia selecionada está incorreto!';
const DEFAULT_LIMIT_MESSAGES = 5;
const DEFAULT_LIMIT_MESSAGES_NODERED = 3;
//Used for NodeRED purposes
var currentIntent;

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: config.credentials.conversation.username,
  password: config.credentials.conversation.password,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: Conversation.VERSION_DATE_2017_05_26
});

function validateIntentAndDefineAction(intent,callback){
	if (config.listIntents.indexOf(intent)!==-1){
		console.log('The intent is '+intent+' and action is List');
		return new callback('List');
	}
	if (config.showIntents.indexOf(intent)!==-1){
		console.log('The intent is '+intent+' and action is show');
		return new callback('Show');
	}
	
	return new callback('Not Found');
}


function formatListResponse(response,input,callback){
	var finalResponse = [];
	if (typeof (response.output.text[0]) !== 'undefined'){
		finalResponse[0] = response.output.text[0];
	}
	
	for (var i=0;i<input.length;++i){
		finalResponse[i+1] = "\n Notícia: "+(i+1);
		finalResponse[i+1] += ", "+input[i].title.trim();
	}
	
	response.output.text = finalResponse;
	
	return new callback(response);
}

function formatDetails(intent, news,callback){
	
	var intentConfig = rss.getIntentConfig(intent);
	
	console.log('Intent collected '+JSON.stringify(intentConfig));
	
	if (typeof(intentConfig.details) !== 'undefined'){
		var content = news.description;
		var details = intentConfig.details;
		var modifiedContent = '';
		if (details.end!=='EOF'){
			modifiedContent =  content.substring(content.indexOf(details.begin)+details.begin.length,content.indexOf(details.end));
		}
		else{
			if (typeof (details.images)==='undefined' || details.images === 'No'){
				modifiedContent =  content.substring(content.indexOf(details.begin)+details.begin.length);
			}
			else{
				modifiedContent = content;
			}
		}
		modifiedContent = modifiedContent.replace('[&#8230;]','');
		
		if (modifiedContent.trim() === ''){
			modifiedContent = SEM_DETALHES;
		}
		
		console.log("Details modified: "+modifiedContent);
		news.description = modifiedContent;
	}
	
	news.source = intentConfig.source;
	
	if (typeof(intentConfig.nlu) !== 'undefined'){
		nlu.sentimentText(config.credentials.nlu.username, config.credentials.nlu.password, news.description, function(err, response){
			console.log('News Sentiment '+response.sentiment.document.label);
			news.sentiment = response.sentiment.document.label;
			return new callback(news);	
		});
	}else{
		return new callback(news);		
	}		
}

function formatNewsResponse(response,position, input,callback){
	var finalResponse = [];
	if (typeof (response.output.text[0]) !== 'undefined'){
		finalResponse[0] = response.output.text[0];
	}
	
	finalResponse[1]= "\n Notícia: "+(position+1);
	finalResponse[1]+= ", Título: "+input.title;
	finalResponse[1]+= ", Detalhes: "+input.description;	
	finalResponse[1]+= ", Fonte da Informação: "+input.source;
	finalResponse[1]+= ", Link da Informação: <a href=\""+input.link+"\">Link</a>";
	
	if (typeof(input.sentiment) !== 'undefined'){
		var sentiment;
		switch (input.sentiment){
			case  "positive":
				sentiment = "Positivo";
				break;
			case "negative":
				sentiment = "Negativo";
				break;
			case "neutral":
				sentiment = "Neutro";
				break;			
		}
		finalResponse[1]+= ", <b> o Sentimento desta notícia é: "+sentiment+"</b>";
	}else{
		console.log('No sentiment defined on the news');
	}

	response.output.text = finalResponse;
	
	return new callback(response);
}

var cachedNews = {};

//Endpoint to be called from the client side
app.post('/api/processRSS', function(req, res) {

	var data = req.body;
    console.log('Entry from conversation: '+JSON.stringify(data));
    
    if (data.intents.length === 0){
    	return res.json(data);	
    }
   
    validateIntentAndDefineAction(data.intents[0].intent,function(action){
		switch(action){
			case 'List':				
				var intent = data.intents[0].intent;
				console.log('Calling URL to list news for intent '+intent);
				rss.getURL(intent,function(url){
					if (typeof (url) !=='undefined'){
						console.log('URL '+url+ ' found for intent '+intent);
						rss.readRSS(url,function(responseRSS){
							var limit = typeof(data.context.limit)!=='undefined'?parseInt(data.context.limit):DEFAULT_LIMIT_MESSAGES_NODERED;
							rss.formatNewsListSelected(responseRSS,limit,function(result){
								//console.log('List of news: ' + JSON.stringify(result));
								formatListResponse(data,result,function(finalResponse){
									currentIntent = intent;
									cachedNews[data.context.conversation_id] = responseRSS;
									delete finalResponse.context.limit;
									//console.log('Generating Final Response for listing: '+JSON.stringify(finalResponse));
									return res.json(finalResponse);
								});								
							});		
						});
					}else{
						console.log('URL not found for intent '+intent);
					}				
				});
				break;
			case 'Show': 
				if (typeof(currentIntent) !== 'undefined' && currentIntent !==''){
    				var position = parseInt(data.context.newsNumber);
    				position = Number.isNaN(position)?0:position-1;
    				rss.getURL(currentIntent,function(url){
    					if (typeof (url) !=='undefined'){
    						console.log('URL '+url+ ' found for intent '+currentIntent);
    						if (typeof(cachedNews[data.context.conversation_id]) === 'undefined' ){
    							rss.readRSS(url,function(responseRSS){
	    							rss.formatNewsList(responseRSS,function(result){
	    								rss.readNews(result,position,function(error,news){
	    									if (error){
	    										data.output.text = data.context.username+"!. "+NOTICIA_INCORRETA;
	    										return res.json(data);
	    									}
	    									else{
		    									console.log('News Selected : '+ JSON.stringify(news));
		    									formatDetails(currentIntent,news,function(modNews){
		    										formatNewsResponse(data,position,modNews,function(finalResponse){
		            									return res.json(finalResponse);
		            								}); 
		    									});        								       								
	    									}
	    								});
	    							});
	    						});
    						}else{
    							rss.formatNewsList(cachedNews[data.context.conversation_id],function(result){
    								rss.readNews(result,position,function(error,news){
    									if (error){
    										data.output.text = data.context.username+"!. "+NOTICIA_INCORRETA;
    										return res.json(data);
    									}
    									else{
	    									console.log('News Selected: '+ JSON.stringify(news));
	    									formatDetails(currentIntent,news,function(modNews){
	    										formatNewsResponse(data,position,modNews,function(finalResponse){
	            									return res.json(finalResponse);
	            								}); 
	    									});  
    									}
    								});
    							});
    						}
    					}else{
    						console.log('URL news not found for intent '+intent);
    					}
    				});	
				}else{
					console.log("Response from conversation (Number without subject): "+JSON.stringify(data));
					return res.json(data);
				}
				break;
			default:
				// speak the result
	          	console.log("Default Response from conversation: "+JSON.stringify(data));
				currentIntent = '';
				delete cachedNews[data.context.conversation_id];
				return res.json(data);
		}    		 
	});   
});


// Endpoint to be called from the client side
app.post('/api/message', function(req, res) {

  workspace = process.env.WORKSPACE_ID || 'bf546466-e53b-4cf0-b887-c8569bbcbdfc';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  else{
	  if (!start){
		  console.log('Workdspace ID ' + workspace);
		  start = true;
	  } 
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };
  
  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
	console.log('Entry from conversation: '+JSON.stringify(data));
	if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);
    }
    if (data.intents.length === 0){
    	return res.json(data);	
    }    
    validateIntentAndDefineAction(data.intents[0].intent,function(action){
		switch(action){
			case 'List':				
				var intent = data.intents[0].intent;
				console.log('Calling URL to list news for intent '+intent);
				rss.getURL(intent,function(url){
					if (typeof (url) !=='undefined'){
						console.log('URL '+url+ ' found for intent '+intent);
						rss.readRSS(url,function(responseRSS){
							var limit = typeof(data.context.limit)!=='undefined'?parseInt(data.context.limit):DEFAULT_LIMIT_MESSAGES;
							rss.formatNewsListSelected(responseRSS,limit,function(result){
								//console.log('List of news: ' + JSON.stringify(result));
								formatListResponse(data,result,function(finalResponse){
									finalResponse.context.intent = intent;
									cachedNews[data.context.conversation_id] = responseRSS;
									delete finalResponse.context.limit;
									//console.log('Generating Final Response for listing: '+JSON.stringify(finalResponse));
									return res.json(finalResponse);
								});								
							});		
						});
					}else{
						console.log('URL not found for intent '+intent);
					}				
				});
				break;
			case 'Show': 
				if (typeof(data.context.intent) !== 'undefined' && data.context.intent !==''){
    				var position = parseInt(data.context.newsNumber);
    				position = Number.isNaN(position)?0:position-1;
    				rss.getURL(data.context.intent,function(url){
    					if (typeof (url) !=='undefined'){
    						console.log('URL '+url+ ' found for intent '+data.context.intent);
    						if (typeof(cachedNews[data.context.conversation_id]) === 'undefined' ){
    							rss.readRSS(url,function(responseRSS){
	    							rss.formatNewsList(responseRSS,function(result){
	    								rss.readNews(result,position,function(error,news){
	    									if (error){
	    										data.output.text = data.context.username+"!. "+NOTICIA_INCORRETA;
	    										return res.json(data);
	    									}
	    									else{
		    									console.log('News Selected : '+ JSON.stringify(news));
		    									formatDetails(data.context.intent,news,function(modNews){
		    										formatNewsResponse(data,position,modNews,function(finalResponse){
		            									return res.json(finalResponse);
		            								}); 
		    									});        								       								
	    									}
	    								});
	    							});
	    						});
    						}else{
    							rss.formatNewsList(cachedNews[data.context.conversation_id],function(result){
    								rss.readNews(result,position,function(error,news){
    									if (error){
    										data.output.text = data.context.username+"!. "+NOTICIA_INCORRETA;
    										return res.json(data);
    									}
    									else{
	    									console.log('News Selected: '+ JSON.stringify(news));
	    									formatDetails(data.context.intent,news,function(modNews){
	    										formatNewsResponse(data,position,modNews,function(finalResponse){
	            									return res.json(finalResponse);
	            								}); 
	    									});  
    									}
    								});
    							});
    						}
    					}else{
    						console.log('URL news not found for intent '+intent);
    					}
    				});	
				}else{
					console.log("Response from conversation (Number without subject): "+JSON.stringify(data));
					return res.json(data);
				}
				break;
			default:
				// speak the result
	          	console.log("Default Response from conversation: "+JSON.stringify(data));
				data.context.intent = '';
				delete cachedNews[data.context.conversation_id];
				return res.json(data);
		}    		 
	});   
  });
});

module.exports = app;
