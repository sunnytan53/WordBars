const natural = require("natural");
const WordNet = require("node-wordnet")
var wordnet = new WordNet();
//let rootWord = get_root_word(userInput);
//let list = list_synonyms(userInput);
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

function remove_common_words(result) {
    // you get a json object
    //let whole_str = result["title"] + result["snippet"];
    let str = result;
    var uselessWordsArray = 
        [
          "a", "at", "be", "can", "cant", "could", "couldnt", 
          "do", "does", "how", "i", "in", "is", "many", "much", "of", 
          "on", "or", "should", "shouldnt", "so", "such", "the", 
          "them", "they", "to", "us",  "we", "what", "who", "why", 
          "with", "wont", "would", "wouldnt", "you"
        ];
			
	var expStr = uselessWordsArray.join(" | ");
	str = str.replace(/[^a-zA-Z0-9 ]/g, '');
	return str.replace(new RegExp(expStr, 'gi'), ' ');
  }



function get_Frequency(result){

    let frequency = new Map();

    let whole_str = "I I okay I";
    let strReduced = remove_common_words(whole_str);
    let strSplit = strReduced.split(" ");

    strSplit.forEach(element => {
        if(frequency.has(element)){
            frequency.set(element, frequency.get(element).value+1);
            return;
        }
        frequency.set(element,1);

    });
    /*
    for (let [key, value] of  frequency.entries()) {
        console.log(key + " = " + value)
    }*/
    const min = Math.min(frequency.values());
    console.log(min);
    return frequency;
    // return a frequency table (hashmap)
}
console.log(get_Frequency("I love eating them Potatoes"));