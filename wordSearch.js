const natural = require("natural");

const WordNet = require("node-wordnet")
var wordnet = new WordNet()
let word = "searching";

function get_root_word(word) {
    return natural.PorterStemmer.stem(word);
}

//Base Lookup function
/*
wordnet.lookup('ate', function(results) {
    results.forEach(function(result) {
        console.log('------------------------------------');
        console.log(result.pos);
        console.log(result.lemma);
        console.log(result.synonyms);
        console.log(result.pos);
        console.log(result.gloss);
    });
});*/

function list_synonyms(word){
    let list_synonyms = [];
    wordnet.lookup(word, function(results) {
        results.forEach(function(result) {
            //console.log(result.synonyms);
            list_synonyms.push(result.synonyms);
        });
        let total_synonyms = [];
        for (let synonym in list_synonyms) {
            for (let word in list_synonyms[synonym]){
                total_synonyms.push(list_synonyms[synonym][word]);
            }
        }
        for( var i = 0; i < total_synonyms.length; i++){                  
            if ( total_synonyms[i] === word) { 
                total_synonyms.splice(i, 1); 
                i--; 
            }
        }
        //console.log(total_synonyms);
        return total_synonyms;
    });
}
let rootWord = get_root_word(word);
let list = list_synonyms(word);

