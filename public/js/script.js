// FRONTEND - Sunny
const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const selection = document.getElementById("selection");

var fetchFake = false;

var selecetedWords = [];
var pageFrequency = [];
var globalOriginals = {};

function clearFrontend() {
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";
    selecetedWords = [];
    // pageFrequency = [];  // it is directly reassign, see below
    globalOriginals = {};
}

function showData() {
    let [results, frequency] = getResults(selecetedWords);
    pageFrequency = frequency;

    html_str = ""  // do NOT add up on innerHTML (can cause lag)
    results.forEach(element => {
        html_str += `<div>${element["title"]}<br/>${element["snippet"]}<br/>${element["url"]}<br/></div><br/>`
    });
    content.innerHTML = html_str;

    html_str = ""  // do NOT add up on innerHTML (can cause lag)
    frequency.forEach((element, index) => {
        html_str += `<div onclick="clickWordBars(${index})">${globalOriginals[element[0]][0]}: ${element[1]}</div>`
    })
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    word = pageFrequency[index][0]
    selection.innerHTML += `<span onclick="clickSelection(${selecetedWords.length})">${globalOriginals[word][0]}</span>`;
    selecetedWords.push(word);

    showData();
}

function clickSelection(index) {
    selecetedWords.splice(index, 1);

    html_str = "";
    selecetedWords.forEach((element, index) => {
        html_str += `<span onclick="clickSelection(${index})">${globalOriginals[element][0]}</span>`
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
    clearBackend();
    clearFrontend();

    // fetch max allowed amount of results
    // based on API Doc, this amount is 50, but after test, it is only 20
    let fetched = await fetch(
        fetchFake ? "/fake" : "https://api.bing.microsoft.com/v7.0/search?count=50&q=" + query,
        { headers: { "Ocp-Apim-Subscription-Key": "68dc5cf46ecc419688a1066dd7b2b9d5" } })
        .then(response => response.json())
        .then(data => data["webPages"]["value"]);

    // push them to backend globalResults
    for (let result of fetched) {
        globalResults.push({
            "title": result["name"],
            "snippet": result["snippet"],
            "url": result["url"],
        });
    }

    await processResults()

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



// SERVER (mixed front- and back-end)
async function processResults() {
    let strs = [];
    globalResults.forEach(result => strs.push(result["title"] + " " + result["snippet"]))

    // send them all at once to save resource (frontend-Sunny)
    let fetched = await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(strs)
    }).then(response => response.json())

    for (let i = 0; i < fetched.length; i++) {  // for each result
        let frequencyTable = new Map();

        for (let [orig, stem] of fetched[i]) {  // for each word
            // integrated from getLocalFrequencyTable() (backend-Japheth)
            if (frequencyTable.has(stem)) {
                frequencyTable.set(stem, frequencyTable.get(stem) + 1);
            }
            else {
                frequencyTable.set(stem, 1);
            }

            // store originals respected to all results (frontend-Sunny)
            if (!(stem in globalOriginals)) {
                globalOriginals[stem] = new Set();
            }
            globalOriginals[stem].add(orig);
        }

        // store frequency table for each result (backend-Japheth)
        globalResults[i]["frequency"] = frequencyTable;
    }

    // convert all set to list for better access and manipulation (frontend-Sunny)
    for (key in globalOriginals) {
        globalOriginals[key] = [...globalOriginals[key]];
    }

}



// BACKEND - Japheth
var globalResults = [];

function clearBackend() {
    globalResults = [];
}

function getResults(selectedWords) {
    if (selectedWords.length == 0) {
        let localFrequency = new Map();
        globalResults.forEach(result => {
            for (let [key, value] of result["frequency"].entries()) {
                if (localFrequency.has(key)) {
                    localFrequency.set(key, localFrequency.get(key) + value);
                }
                else {
                    localFrequency.set(key, value);
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
            for (let word of selectedWords) {
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
            for (select of selectedWords) {
                // add to all values
                allValuesOfSelectedWords += result["frequency"][select];
                selectedFreqArr.push([result, allValuesOfSelectedWords]);
            }
        }
        selectedFreqArr = selectedFreqArr.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
        return [array, selectedFreqArr];
    }
}

//Copy globalResults,
//Push each result that contains the selected words into a tuple
//Sort the tuple list
function getResultsBySelectedWords(globalResults, selectedWords) {
    let resultList = JSON.parse(JSON.stringify(globalResults));
    //tuples [result, sum]
    let resultsContainingSelectedWords = {};
    resultList.forEach(element => {
        let sum = 0;
        for (let word in selectedWords) {
            for (let tupleWord of element.frequency) {
                if (tupleWord[0] == word) {
                    sum = + tupleWord[1];
                }
            }
            resultsContainingSelectedWords.push([element, sum]);
        }
    });
    //sort array
    resultsContainingSelectedWords = resultsContainingSelectedWords.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
}

// ### Integrated into processResults() for server side
// async function addResult(title, snippet, url) {
//     let [original, stemmed] = await fetch("/stem", {
//         method: "POST",
//         headers: { "Content-Type": "application/json"},
//         body: JSON.stringify({"data": (title + " " + snippet)
//                                         .replace(/[0-9]/g, "")
//                                         .toLowerCase()})
//     })
//     .then(response => response.json());

//     for (let i = 0; i < stemmed.length; i++) {
//         if (!(stemmed[i] in globalStems)) {
//             globalStems[stemmed[i]] = new Set();
//         }
//         globalStems[stemmed[i]].add(original[i]);
//     }

//     globalResults.push({
//         "title": title,
//         "snippet": snippet,
//         "url": url,
//         "frequency": getLocalFrequencyTable(stemmed),
//     });
// }

// ### Integrated into processResults() for server side 
// function getLocalFrequencyTable(data) {
//     let frequencyTable = new Map();
//     data.forEach(element => {
//         if (frequencyTable.has(element)) {
//             frequencyTable.set(element, frequencyTable.get(element) + 1);
//         }
//         else {
//             frequencyTable.set(element, 1);
//         }
//     })
//     return frequencyTable;
// }

// ### Integrated into app.js with module for server side
// function remove_common_words(results) {
//     // you get a json object
//     //let whole_str = result["title"] + result["snippet"];
//     var uselessWordsArray = 
//         [
//           "a", "at", "be", "can", "cant", "could", "couldnt", 
//           "do", "does", "how", "i", "in", "is", "many", "much", "of", 
//           "on", "or", "should", "shouldnt", "so", "such", "the", 
//           "them", "they", "to", "us",  "we", "what", "who", "why", 
//           "with", "wont", "would", "wouldnt", "you"
//         ];
//     results = ' ' + results + ' ';
//     results = results.toLowerCase().replace(/\s+/g, ' ').trim();    
// 	results = results.replace(/[^a-zA-Z0-9 ]/g, '');
//     results.replace(uselessWordsArray, '');
//     return results;
// }
