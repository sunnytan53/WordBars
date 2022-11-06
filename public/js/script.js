const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const selection = document.getElementById("selection");

var fetchFake = false;

var globalResults = [];
var selectedWords = [];
var selectedValues = [];
var pageFrequency = [];
var allOriginals = {};
var cachedSynonyms = {};

function clearResults() {
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";
    selection.innerHTML = ""
    globalResults = [];
    selectedWords = [];
    selectedValues = [];
    // pageFrequency = [];  // it is directly reassign, see below
    allOriginals = {};
    cachedSynonyms = {};
}



// FRONTEND - Sunny
async function showData() {
    let [results, frequency] = getResults(selectedWords);
    pageFrequency = frequency.slice(0, 40);  // based on first reference, 40 is a good amount

    // *** it is important to cache synonyms for each search since it takes some time
    // the module support cache but it is actually slower in terms of user experience
    let findSynonyms = {};
    for (let [stem, freq] of pageFrequency) {
        if (!(stem in cachedSynonyms)) {
            findSynonyms[stem] = allOriginals[stem];
        }
    }

    // lookup synonyms in wordnet and store them
    if (findSynonyms) {
        await fetch("/wordnet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(findSynonyms)
        })
            .then(response => response.json())
            .then(synonyms => {
                for (let stem in synonyms) {
                    cachedSynonyms[stem] = synonyms[stem];
                }
            })
    }

    html_str = "";  // do NOT add up on innerHTML (can cause lag)
    results.forEach(rs => {
        html_str += `<div>${rs["title"]}<br/>${rs["snippet"]}<br/>${rs["url"]}<br/></div><br/>`
    });
    content.innerHTML = html_str;

    showWordBars();
}

function showWordBars() {
    html_str = "";  // do NOT add up on innerHTML (can cause lag)
    pageFrequency.forEach((freq, index) => {
        html_str += `<div onclick="clickWordBars(${index})">${allOriginals[freq[0]][0]}: ${freq[1]}</div>`
    })
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    html_str = "<button onclick=showWordBars()>BACK</button></br>";
    synonymTable = cachedSynonyms[pageFrequency[index][0]];
    html_str += `<div onclick=clickWordNet(${index},'',-1)>
                <h4>single word selection</h4>
                <div>${allOriginals[pageFrequency[index][0]][0]}</div></div>`
    for (tense in synonymTable) {
        html_str += `<h3>${tense}</h3>`
        for (let i = 0; i < synonymTable[tense].length; i++) {
            table = synonymTable[tense][i];
            html_str += `<div onclick=clickWordNet(${index},'${tense}',${i})>`
            html_str += `<h4>${table["def"]}</h4>`
            for (synonym of table["synonyms"]) {
                html_str += `<div>${synonym}</div>`
            }
            html_str += "</div>"
        }
    }
    wordbars.innerHTML = html_str;
}

async function clickWordNet(index, tense, synonymIndex) {
    values = index + tense + synonymIndex;
    if (selectedValues.includes(values)) {
        alert("Repeated selction!!!");
        return;
    }
    selectedValues.push(values);

    if (tense == "") {
        word = [pageFrequency[index][0]];
        str = allOriginals[word][0];
    }
    else{
        let table = cachedSynonyms[pageFrequency[index][0]][tense][synonymIndex];
        str = table["synonyms"];
        word = table["stem"];
    }

    content.innerHTML = "If nothing shows up, check if <h3>clickWordNet()</h3> has showData() enable, else it has a bug"
    selection.innerHTML += `<button onclick="clickSelection(${selectedWords.length})">${str}</button>`;
    selectedWords.push(word);

    await showData();
    console.log(selectedWords);
}

async function clickSelection(index) {
    content.innerHTML = "If nothing shows up, check if <h3>clickSelection()</h3> has showData() enable, else it has a bug"
    selectedWords.splice(index, 1);
    selectedValues.splice(index, 1);
    selection.removeChild(selection.children[index])

    await showData();
    console.log(selectedWords);
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

    await showData();
};

// press enter = clicking search button
searchBox.addEventListener("keypress", async function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        await searchButton.click();
    }
});


const testButton = document.getElementById("test-button");
testButton.onclick = async function () {
    searchBox.value = "computer science";
    fetchFake = true;
    await searchButton.click();
    fetchFake = false;
};



// SERVER (mixed front- and back-end)
async function processResults() {
    let strs = [];
    globalResults.forEach(result => strs.push(result["title"] + " " + result["snippet"]))

    // send them all at once to save resource (Sunny)
    let fetched = await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(strs)
    })
        .then(response => response.json())

    for (let i = 0; i < fetched.length; i++) {  // for each result
        let frequencyTable = new Map();

        for (let [orig, stem] of fetched[i]) {  // for each word
            // integrated from getLocalFrequencyTable() (Japheth)
            if (frequencyTable.has(stem)) {
                frequencyTable.set(stem, frequencyTable.get(stem) + 1);
            }
            else {
                frequencyTable.set(stem, 1);
            }

            // store originals respected to all results (Sunny)
            if (!(stem in allOriginals)) {
                allOriginals[stem] = [];
            }
            allOriginals[stem].push(orig);
        }

        // store frequency table for each result (Japheth)
        globalResults[i]["frequency"] = frequencyTable;
    }

    // convert all set to list for better access and manipulation (Sunny)
    for (key in allOriginals) {
        allOriginals[key] = [...new Set(allOriginals[key])];
    }
}



// BACKEND - Japheth
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
        /*
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
        */
        const sortArray = getResultsBySelectedWords(selectedWords);
        const reducedArray = sortArray.slice(0,20);
        return [globalResults, reducedArray];
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
        for (let wordle of selectedWords) {
            for(let word of wordle){
                for (let tupleWord of element.frequency) {
                    if (tupleWord[0] == word) {
                        sum = + tupleWord[1];
                    }
                }
            }
            resultsContainingSelectedWords.push([element, sum]);
        }
    });
    //sort array
    return resultsContainingSelectedWords = resultsContainingSelectedWords.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
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
