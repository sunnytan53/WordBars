const natural = require("natural");
const WordNet = require("node-wordnet")
var wordnet = new WordNet();
//let global_frequency = new Map();

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
    var uselessWordsArray = 
        [
          "a", "at", "be", "can", "cant", "could", "couldnt", 
          "do", "does", "how", "i", "in", "is", "many", "much", "of", 
          "on", "or", "should", "shouldnt", "so", "such", "the", 
          "them", "they", "to", "us",  "we", "what", "who", "why", 
          "with", "wont", "would", "wouldnt", "you"
        ];
    results = result.toLowerCase().replace(/\s+/g, ' ').trim();    
	results = results.replace(/[^a-zA-Z0-9 ]/g, '');
    results.replace(uselessWordsArray, '');
    //console.log(results);
    return results;
}



function get_Frequency(result){

    let frequency = new Map();
    let strReduced = remove_common_words(result);
    let strSplit = strReduced.split(" ");

    strSplit.forEach(element => {
        if(frequency.has(element)){
            frequency.set(element, frequency.get(element)+1);
            return;
        }
        frequency.set(element,1);
    });
    
    for (let [key, value] of  frequency.entries()) {
        console.log(key + " = " + value)
    }
    //const min = Math.min(...frequency.values());
    return new Map([...frequency].sort((a, b) => String(a[1]).localeCompare(b[1])));
}
function sort_Global_Frequency(global_frequency){
    /*global_frequency.forEach(element => { 
    });
    */
    let global_arr = [];
    for(var i = 0; i < global_frequency.length; i++) {
        global_arr.push(global_frequency[i]);
    }
    global_arr.sort(function(a, b) {    return a.frequency - b.frequency; });   
    return global_arr;
}


console.log(get_Frequency("I love I hi hi hi loooove them potatoes"));



//sort a map by string keys:
//new Map([...map].sort((a, b) => String(a[0]).localeCompare(b[0])))
//sort a map by string values:
//new Map([...map].sort((a, b) => String(a[1]).localeCompare(b[1])))
