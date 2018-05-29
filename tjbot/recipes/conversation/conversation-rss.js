/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
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

var TJBot = require('tjbot');
var config = require('./config-rss');
var language = 'pt';
var rss = require('../rss/rss');
const SEM_DETALHES = 'Detalhes não disponíveis';
const NOTICIA_INCORRETA = 'O Número da notícia selecionada está incorreto!';
const DEFAULT_LIMIT_MESSAGES = 3;
const NOTICIA_ENCONTRADA = 'O que sei sobre a notícia';

// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
const WORKSPACEID = config.conversationWorkspaceId;

console.log("Using workspace ID "+WORKSPACEID);

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['microphone', 'speaker'];

// set up TJBot's configuration
var tjConfig = {
    log: {
        level: 'verbose'
    },
    robot: {        
	   	name: 'Karen',
        gender: 'female'
    },
    wave: {
        servoPin: 7 // corresponds to BCM 7 / physical PIN 26
    },
    listen: {
        microphoneDeviceId: "plughw:1,0", // plugged-in USB card 1, device 0; see arecord -l for a list of recording devices
        inactivityTimeout: -1, // -1 to never timeout or break the connection. Set this to a value in seconds e.g 120 to end connection after 120 seconds of silence
        language: 'pt-BR' // see TJBot.prototype.languages.listen
    },
    speak: {
        language: 'pt-BR', // see TJBot.prototype.languages.speak
        voice: 'pt-BR_IsabelaVoice', // use a specific voice; if undefined, a voice is chosen based on robot.gender and speak.language
        speakerDeviceId: "plughw:0,0" // plugged-in USB card 1, device 0; see aplay -l for a list of playback devices
    }
};

//instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, credentials);

if (language === 'pt'){
	console.log("Robo inicializado com o nome "+tjConfig.robot.name);
}

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
		finalResponse[i+1] += ", "+input[i].title;
	}
	
	response.output.text = finalResponse;
	
	return new callback(response);
}

function formatDetails(intent, news,callback){
	
	var intentConfig = rss.getIntentConfig(intent);
	var content = news.description;
	
	if (typeof(intentConfig.details) !== 'undefined'){
		var details = intentConfig.details;
		var modifiedContent = '';
		if (details.end!=='EOF'){
			modifiedContent =  content.substring(content.indexOf(details.begin)+details.begin.length,content.indexOf(details.end));
		}
		else{
			if (content.indexOf("<img src=")!==-1){
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
		news.description = modifiedContent;
	}
	
	news.source = intentConfig.source;
	
	return new callback(news);
		
}

function formatNewsResponse(response,position, input,callback){
	var finalResponse = [];
	if (typeof (response.output.text[0]) !== 'undefined'){
		finalResponse[0] = response.output.text[0];
	}
	
	if(finalResponse[0].indexOf(NOTICIA_ENCONTRADA)!==-1){
		//finalResponse[1]= "\n Notícia: "+(position+1);
		finalResponse[1] = input.description.trim();	
		finalResponse[1]+= ". Fonte da Informação: "+input.source;
	}

	response.output.text = finalResponse;
	
	return new callback(response);
}

var cachedNews = {};

var begin = false;

function formatSpeakResponse(input){
	
	var msgToSpeak = '';
	for(var i=0;i<input.length;++i){
		msgToSpeak+=input[i]+". ";
	}
	
	return msgToSpeak;
}

function buildTJBotResponse(log,msgToSpeak){
	console.log(log);
	tj.speak(msgToSpeak);
}

tj.converse(WORKSPACEID, "", function(response) {
	buildTJBotResponse("Enviando mensagem ao Speaker de inicialização "+response.description,response.description);
	console.log('Inicializando a conversação ');	
	begin = true;
});

// listen for utterances with our attentionWord and send the result to
// the Conversation service
tj.listen(function(turn) { 
    console.log("Sending message "+turn.trim()+" to conversation");
    // send to the conversation service
    tj.converse(WORKSPACEID, turn.trim(), function(response) { 
    	
    	console.log("Response from Conversation: "+JSON.stringify(response));
    	
    	if (begin || response.object.intents.length === 0){
    		buildTJBotResponse('Conversação sem intenção detectada',response.description);
    		begin = false;
        }   
    	else{
    		response = response.object;
	        validateIntentAndDefineAction(response.intents[0].intent,function(action){
	    		switch(action){
	    			case 'List':				
	    				var intent = response.intents[0].intent;
	    				console.log('Calling URL to list news for intent '+intent);
	    				rss.getURL(intent,function(url){
	    					if (typeof (url) !=='undefined'){
	    						console.log('URL '+url+ ' found for intent '+intent);
	    						rss.readRSS(url,function(responseRSS){
	    							var limit = typeof(response.context.limit)!=='undefined'?parseInt(response.context.limit):DEFAULT_LIMIT_MESSAGES;
	    							rss.formatNewsListSelected(responseRSS,limit,function(result){
	    								//console.log('List of news: ' + JSON.stringify(result));
	    								formatListResponse(response,result,function(finalResponse){
	    									finalResponse.context.intent = intent;
	    									cachedNews[response.context.conversation_id] = responseRSS;
	    									delete finalResponse.context.limit;
	    									buildTJBotResponse('Enviando resposta final de listagem',formatSpeakResponse(finalResponse.output.text));
	    								});								
	    							});		
	    						});
	    					}else{
	    						console.log('URL not found for intent '+intent);
	    					}				
	    				});
	    				break;
	    			case 'Show': 
	    				if (typeof(response.context.intent) !== 'undefined' && response.context.intent !==''){
	        				var position = parseInt(response.context.newsNumber);
	        				position = Number.isNaN(position)?0:position-1;
	        				rss.getURL(response.context.intent,function(url){
	        					if (typeof (url) !=='undefined'){
	        						console.log('URL '+url+ ' found for intent '+response.context.intent);
	        						if (typeof(cachedNews[response.context.conversation_id]) === 'undefined' ){
	        							rss.readRSS(url,function(responseRSS){
	    	    							rss.formatNewsList(responseRSS,function(result){
	    	    								rss.readNews(result,position,function(error,news){
	    	    									if (error){
	    	    										response.output.text = response.context.username+"!. "+NOTICIA_INCORRETA;
	    	    										buildTJBotResponse('Enviando resposta de notícia incorreta', formatSpeakResponse(response.output.text));
	    	    									}
	    	    									else{
	    		    									console.log('Notícia selecionada : '+ JSON.stringify(news));
	    		    									formatDetails(response.context.intent,news,function(modNews){
	    		    										formatNewsResponse(response,position,modNews,function(finalResponse){
	    		    											buildTJBotResponse('Enviando resposta de notícia selecionada',formatSpeakResponse(finalResponse.output.text));
	    		            								}); 
	    		    									});        								       								
	    	    									}
	    	    								});
	    	    							});
	    	    						});
	        						}else{
	        							rss.formatNewsList(cachedNews[response.context.conversation_id],function(result){
	        								rss.readNews(result,position,function(error,news){
	        									if (error){
	        										response.output.text = response.context.username+"!. "+NOTICIA_INCORRETA;
	        										buildTJBotResponse('Enviando resposta de notícia incorreta', response.output.text);
	        									}
	        									else{
	    	    									console.log('Notícia selecionada : '+ JSON.stringify(news));
	    	    									formatDetails(response.context.intent,news,function(modNews){
	    	    										formatNewsResponse(response,position,modNews,function(finalResponse){
	    	    											buildTJBotResponse('Enviando resposta de notícia selecionada',formatSpeakResponse(finalResponse.output.text));
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
	    					console.log("Response from conversation (Number without subject): "+JSON.stringify(response));
	    					buildTJBotResponse('Enviando conversação sem assunto detectado',response.description);
	    				}
	    				break;
	    			default:
	    				// speak the result
	    	          	console.log("Default Response from conversation: "+JSON.stringify(response));
	    				response.context.intent = '';
	    				delete cachedNews[response.context.conversation_id];
	    				buildTJBotResponse('Enviando conversação sem assunto detectado',response.description);
	    		}    		 
	    	}); 
    	}
    });    
});
