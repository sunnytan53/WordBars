const natural = require("natural");
const WordNet = require("node-wordnet")
var wordnet = new WordNet()
let userInput = "I love to have eat potatoes";
let userInputRemoved = remove_common_words(userInput);
//let inputSplit = userInputRemoved.split(" ");

//let rootWord = get_root_word(userInput);
//let list = list_synonyms(userInput);

let remove_common_words = function(result){
    // you get a json object
    //whole_strng = result["title"] + result["snippet"]
    let str = result;
    var uselessWordsArray = 
        [
          "a", "at", "be", "can", "cant", "could", "couldnt", 
          "do", "does", "how", "i", "in", "is", "many", "much", "of", 
          "on", "or", "should", "shouldnt", "so", "such", "the", 
          "them", "they", "to", "us",  "we", "what", "who", "why", 
          "with", "wont", "would", "wouldnt", "you", "to"
        ];
	let expStr = uselessWordsArray.join(" | ");
    str = str.replace(/[^a-zA-Z0-9 ]/g, '');
	str.replace(new RegExp(expStr, 'gi'), '');
    return str;
    
}

//function get_root_word(word) {  return natural.PorterStemmer.stem(word);}

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
/*
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
}*/
console.log(remove_common_words(userInput));

function get_frequency(){
    // split words into an array of words
    // count words
    // return a frequency table (hashmap)
}