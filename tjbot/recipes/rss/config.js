/*
Specific configuration for RSS mobule
*/ 

exports.rss = {
		intents : {
			 BrasilCopa : {source: 'Gazeta Esportiva', url:'https://www.gazetaesportiva.com/times/brasil/feed/',details:{begin:'/>',end:'</p>'}},
			 Brasil : {source: 'G1.com', url:'http://g1.globo.com/dynamo/brasil/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 CienciaSaude : {source: 'G1.com', url : 'http://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 ConcursosEmprego : {source: 'G1.com', url:'http://g1.globo.com/dynamo/concursos-e-emprego/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 Economia : {source: 'G1.com', url:'http://g1.globo.com/dynamo/economia/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 Educacao : {source: 'G1.com', url:'http://g1.globo.com/dynamo/educacao/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 Mundo : {source: 'G1.com', url : 'http://g1.globo.com/dynamo/mundo/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 Musica : {source: 'G1.com', url:'http://g1.globo.com/dynamo/musica/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 MeioAmbiente : {source: 'G1.com', url:'http://g1.globo.com/dynamo/natureza/rss2.xml', details:{begin:'<br />', end: 'EOF'}},		
			 Politica : {source: 'G1.com', url:'http://pox.globo.com/rss/g1/politica/', details:{begin:'<br />', end: 'EOF'}},
			 PopArte : {source: 'G1.com', url:'http://g1.globo.com/dynamo/pop-arte/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 TecnologiaJogos : {source: 'G1.com', url:'http://g1.globo.com/dynamo/tecnologia/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
			 TurismoViagem : {source: 'G1.com', url:'http://g1.globo.com/dynamo/turismo-e-viagem/rss2.xml', details:{begin:'<br />', end: 'EOF'}},
		}		
};


