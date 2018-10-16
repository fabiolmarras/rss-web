/*
User-specific configuration
    ** IMPORTANT NOTE ********************
    * Please ensure you do not interchange your username and password.
    * Hint: Your username is the lengthy value ~ 36 digits including a hyphen
    * Hint: Your password is the smaller value ~ 12 characters
*/ 
// replace with the workspace identifier of your conversation
exports.conversationWorkspaceId = '39b2d7ef-0674-4b7e-abb9-a2bcced0375c'; 

// Create the credentials object for export
exports.credentials = {};

// Watson Conversation
// https://www.ibm.com/watson/developercloud/conversation.html
exports.credentials.conversation = {
	password: '<PASSWORD>',
	username: '<USER_NAME>'
};

// Watson Speech to Text
// https://www.ibm.com/watson/developercloud/speech-to-text.html
exports.credentials.speech_to_text = {
	password: '<PASSWORD>',
	username: '<USER_NAME>'
};

// Watson Text to Speech
// https://www.ibm.com/watson/developercloud/text-to-speech.html
exports.credentials.text_to_speech = {
	password: '<PASSWORD>',
	username: '<USER_NAME>'
};

// Watson Natural Language Understanding
exports.credentials.nlu = {
		password: '<PASSWORD>',
		username: '<USER_NAME>'
};

exports.listIntents = [
	 'Futebol','Beleza','Brasil','CienciaSaude', 'ConcursosEmprego','Economia', 'Educacao','Mundo','Musica','MeioAmbiente','Politica','PopArte','TecnologiaJogos', 'TurismoViagem'];

exports.showIntents = ['SaberNoticia'];
