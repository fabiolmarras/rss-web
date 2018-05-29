/*
User-specific configuration
    ** IMPORTANT NOTE ********************
    * Please ensure you do not interchange your username and password.
    * Hint: Your username is the lengthy value ~ 36 digits including a hyphen
    * Hint: Your password is the smaller value ~ 12 characters
*/ 

exports.conversationWorkspaceId = 'bf546466-e53b-4cf0-b887-c8569bbcbdfc'; // replace with the workspace identifier of your conversation

// Create the credentials object for export
exports.credentials = {};

// Watson Conversation
// https://www.ibm.com/watson/developercloud/conversation.html
exports.credentials.conversation = {
	password: 'fCwCbjBs2ACc',
	username: '3e2c713e-8516-4114-b4be-7121cafdbe0f'
};

// Watson Speech to Text
// https://www.ibm.com/watson/developercloud/speech-to-text.html
exports.credentials.speech_to_text = {
	password: '7pkymVq2kgNh',
	username: 'cfe7095e-9258-4d6c-abc8-910fc2458fea'
};

// Watson Text to Speech
// https://www.ibm.com/watson/developercloud/text-to-speech.html
exports.credentials.text_to_speech = {
	password: 'ZhKMy1FUE3WO',
	username: '09c3bb42-9f4d-4e0f-aac6-d3a98c093b81'
};

exports.listIntents = [
	 'BrasilCopa','Brasil','CienciaSaude', 'ConcursosEmprego','Economia', 'Educacao','Mundo','Musica','MeioAmbiente','Politica','PopArte','TecnologiaJogos', 'TurismoViagem'];

exports.showIntents = ['SaberNoticia'];
