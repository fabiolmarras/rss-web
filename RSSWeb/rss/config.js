/*
Specific configuration for RSS mobule
*/ 

exports.rss = {
		intents : {
			 Futebol: {source: 'R7.com', url:'https://esportes.r7.com/futebol/feed.xml',details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 Beleza : {source: 'Chic Uol', url:'http://chic.uol.com.br/rss/beleza.rss',details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 Brasil : {source: 'G1.com', url:'http://g1.globo.com/dynamo/brasil/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images: 'true'},
			 CienciaSaude : {source: 'G1.com', url : 'http://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 ConcursosEmprego : {source: 'G1.com', url:'http://g1.globo.com/dynamo/concursos-e-emprego/rss2.xml', details:{begin:'<br />', end: 'EOF'},nlu:'true',images: 'true'},
			 Economia : {source: 'G1.com', url:'http://g1.globo.com/dynamo/economia/rss2.xml', details:{begin:'<br />', end: 'EOF'},nlu:'true',images: 'true'},
			 Educacao : {source: 'G1.com', url:'http://g1.globo.com/dynamo/educacao/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 Mundo : {source: 'G1.com', url : 'http://g1.globo.com/dynamo/mundo/rss2.xml', details:{begin:'<br />', end: 'EOF'},nlu:'true',images: 'true'},
			 Musica : {source: 'G1.com', url:'http://g1.globo.com/dynamo/musica/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 MeioAmbiente : {source: 'G1.com', url:'http://g1.globo.com/dynamo/natureza/rss2.xml', details:{begin:'<br />', end: 'EOF'},nlu:'true',images: 'true'},		
			 Politica : {source: 'G1.com', url:'http://pox.globo.com/rss/g1/politica/', details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 PopArte : {source: 'G1.com', url:'http://g1.globo.com/dynamo/pop-arte/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images:'true'},
			 TecnologiaJogos : {source: 'G1.com', url:'http://g1.globo.com/dynamo/tecnologia/rss2.xml', details:{begin:'', end: 'EOF'},nlu:'true',images: 'true'},
			 TurismoViagem : {source: 'G1.com', url:'http://g1.globo.com/dynamo/turismo-e-viagem/rss2.xml', details:{begin:'<br />', end: 'EOF'},nlu:'true',images: 'true'},
		}		
};


