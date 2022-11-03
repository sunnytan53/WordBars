// FRONTEND
const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const selection = document.getElementById("selection");

var fetchFake = false;
var selecetedWords = [];
var pageFrequency = [];
var globalDisplay = {};

function showData() {
    let [results, frequency] = getResults(selecetedWords);
    pageFrequency = frequency;

    html_str = ""
    results.forEach(element => {
        html_str += `<div>${element["title"]}<br/>${element["snippet"]}<br/>${element["url"]}<br/></div><br/>`
    });
    content.innerHTML = html_str;

    html_str = ""
    frequency.forEach((element, index) => {
        html_str += `<div onclick="clickWordBars(${index})">${getDisplay(element[0])}: ${element[1]}</div>`
    })
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    word = pageFrequency[index][0]
    selection.innerHTML += `<div onclick="clickSelection(${selection.length})">${getDisplay(word)}</div>`;
    selecetedWords.push(word);

    showData();
}

function clickSelection(index) {
    selecetedWords.splice(index, 1);

    html_str = "";
    selecetedWords.forEach((element, index) => {
        html_str += `<div onclick="clickSelection(${index})">${getDisplay(element)}</div>`
    })
    selection.innerHTML = html_str;

    showData();
}

searchButton.onclick = async function () {
    // alert empty query and return with no other actions
    let query = searchBox.value;
    if (!query) {
        alert("Query (Search Box) can NOT be empty!");
        return;
    }

    // remove old results, also tell users we are fetching new results
    clearResults();
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";

    // fetch max allowed amount of results
    // based on API Doc, this amount is 50, but after test, it is only 20
    let fetched = await fetch(
        fetchFake ? "/fake" : "https://api.bing.microsoft.com/v7.0/search?count=50&q=" + query,
        { headers: { "Ocp-Apim-Subscription-Key": "68dc5cf46ecc419688a1066dd7b2b9d5" } })
        .then(response => response.json())
        .then(data => data["webPages"]["value"]);

    for (let result of fetched) {
        await addResult(result["name"], result["snippet"], result["url"]);
    }

    showData();
};

// press enter = clicking search button
searchBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
    }
});


const testButton = document.getElementById("test-button");
testButton.onclick = async function () {
    searchBox.value = "computer science";
    fetchFake = true;
    searchButton.click();
    fetchFake = false;
};

function getDisplay(stemmedWord) {
    return globalStems[stemmedWord].values().next().value;
}




// BACKEND
var globalResults = [];
var globalStems = {}; // key: stemmed word, value: list of all originals (set)

function clearResults() {
    globalResults = [];
    globalStems = {};
}


async function addResult(title, snippet, url) {
    let [original, stemmed] = await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({"data": (title + " " + snippet)
                                        .replace(/[0-9]/g, "")
                                        .toLowerCase()})
    })
    .then(response => response.json());

    for (let i = 0; i < stemmed.length; i++) {
        if (!(stemmed[i] in globalStems)) {
            globalStems[stemmed[i]] = new Set();
        }
        globalStems[stemmed[i]].add(original[i]);
    }

    globalResults.push({
        "title": title,
        "snippet": snippet,
        "url": url,
        "frequency": getLocalFrequencyTable(stemmed),
    });
}

function getResults(selectedWords) {
    if (selectedWords.length == 0) {
        let localFrequency = new Map();
        globalResults.forEach(result => {
            for (let [key, value] of  result["frequency"].entries()) {
                if(localFrequency.has(key)){
                    localFrequency.set(key, localFrequency.get(key) + value);
                }
                else {
                    localFrequency.set(key,value);
                }
            }
        })
        let freqArr = [];
        for (let [key, value] of localFrequency.entries()) {
            freqArr.push([key, value]);
        }
        // console.log(freqArr);
        freqArr = freqArr.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
        return [globalResults, freqArr];
    }
    else {
        // return a new sorted result with top 20
        // call your sorting method, or consturct them here
        // NOTE: do NOT modify globall result, this is a new result
        // find the documents that has the selected words
        let localFrequency = new Map();
        const array = [];
        globalResults.forEach(result => {
            for(let word of selectedWords){
                count = 0;
                if (result["frequency"].has(word)) {
                    count += 1;
                    array.push(result);
                    // break;
                }
                // if count == selectedWords.length {}
            }
        })
        selectedFreqArr = []; // [[result, allValuesOfSelectedWords]]
        for (result of array) {
            allValuesOfSelectedWords = 0;
            for (select of selectedWords){
                // add to all values
                allValuesOfSelectedWords += result["frequency"][select]; 
                selectedFreqArr.push([result,allValuesOfSelectedWords]);
            }
        }
        selectedFreqArr = selectedFreqArr.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
        return [array, selectedFreqArr];
    }
}

// not needed, already done in app.js
function remove_common_words(results) {
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
    results = ' ' + results + ' ';
    results = results.toLowerCase().replace(/\s+/g, ' ').trim();    
	results = results.replace(/[^a-zA-Z0-9 ]/g, '');
    results.replace(uselessWordsArray, '');
    return results;
}

function getLocalFrequencyTable(data) {
    let frequencyTable = new Map();

    data.forEach(element => {
        if (frequencyTable.has(element)) {
            frequencyTable.set(element, frequencyTable.get(element) + 1);
        }
        else {
            frequencyTable.set(element, 1);
        }
    })
    
    return frequencyTable;
}

//Copy globalResults,
//Push each result that contains the selected words into a tuple
//Sort the tuple list
function getResultsBySelectedWords(globalResults,selectedWords){ 
   let resultList = JSON.parse(JSON.stringify(globalResults));
   //tuples [result, sum]
   let resultsContainingSelectedWords = {};
   resultList.forEach(element => {
    let sum = 0;
    for(let word in selectedWords){
        for(let tupleWord of element.frequency){
            if(tupleWord[0] == word){
                sum =+ tupleWord[1];
            }
        }
        resultsContainingSelectedWords.push([element,sum]);
    }
   });
   //sort array
   resultsContainingSelectedWords = resultsContainingSelectedWords.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
}