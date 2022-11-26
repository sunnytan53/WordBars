const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const selection = document.getElementById("selection");
const amount = document.getElementById("amount");
const statusCache = document.getElementById("status");

var fetchFake = false;  // should only be controlled within the button click
var cachePromise = null;

var globalResults = [];
var selectedWords = [];
var selectedValues = [];
var pageFrequency = [];
var currentAllFrequency = {};
var allOriginals = {};
var cachedSynonyms = {};

function clearResults() {
    content.innerHTML = "<h2>Fetching Results From Bing</h2>\
                        <h3>If nothing shows up, this is because it reached limit of the BING API (which has no way to solve except changing API key)</h3>\
                        <h3>Please use fake search to simulate a search, which uses the pre-stored results that we use for save resource when testing</h3>";
    wordbars.innerHTML = "";
    selection.innerHTML = "";
    statusCache.innerHTML = "X";
    statusCache.style = "color:red;"
    cachePromise = null;
    globalResults = [];
    selectedWords = [];
    selectedValues = [];
    pageFrequency = [];  // it is actually already reassignd, see below
    currentAllFrequency = {};
    allOriginals = {};
    cachedSynonyms = {};
}

async function fetchSynonyms(freqArr, isAll) {
    let uncahced = {};
    for (let [stem, freq] of freqArr) {
        if (!(stem in cachedSynonyms)) {
            uncahced[stem] = allOriginals[stem];
        }
    }

    // *** it is important to cache synonyms for each search since it takes some time
    // the module support cache but it is actually slower in terms of user experience
    return fetch("/wordnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uncahced)
    })
        .then(response => response.json())
        .then(synonyms => {
            for (let stem in synonyms) {
                cachedSynonyms[stem] = synonyms[stem];
            }
            console.log("RUN");
            if (isAll) {
                cachePromise = true;
                statusCache.innerHTML = "V";
                statusCache.style = "color:green;"
                console.log("DONE");
            }
        });
}

// FRONTEND - Sunny
async function showData() {
    let [results, frequency] = getResults(selectedWords);
    pageFrequency = frequency.slice(0, 40);  // based on first reference, 40 is a good amount
    wordbars.innerHTML = "";

    for (let [x, y] of frequency) {
        currentAllFrequency[x] = y;
    }

    // we must wait the first 40 to show at the beginning
    // create the promise to find all synonym sets, should ONLY run once per search
    if (cachePromise) {
        content.innerHTML = "<h2>Waiting for all synonym sets to be found</h2>";
        await cachePromise;
    }
    else {
        content.innerHTML = "<h2>Fetching synonym set from WordNet for <u>first 40 frequency</u></h2>";
        await fetchSynonyms(pageFrequency, false);
        cachePromise = fetchSynonyms(frequency.slice(40), true);
    }

    // do NOT use raw concatnation to avoid *injection* (found when searching "css style")
    content.innerHTML = "";
    content.scrollTo(0, 0);
    results.forEach(rs => {
        const div = document.createElement("div");
        const link = document.createElement("a");
        link.href = rs["url"];
        link.appendChild(document.createTextNode(rs["title"]));
        div.appendChild(link);
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode(rs["snippet"]));
        content.appendChild(div);
        content.appendChild(document.createElement("br"));
    });
    amount.innerHTML = results.length;

    showWordBars();
}

function showWordBars() {
    html_str = "";  // do NOT add up on innerHTML (can cause lag)
    pageFrequency.forEach((freq, index) => {
        html_str += `<div onclick="clickWordBars(${index})">${allOriginals[freq[0]][0]}: ${freq[1]}</div>`;
    });
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    html_str = "<button onclick=showWordBars()>BACK</button></br>";
    synonymTable = cachedSynonyms[pageFrequency[index][0]];
    html_str += `<div onclick=clickWordNet(${index},'',-1)>
                <h4>single word selection</h4>
                <div>${allOriginals[pageFrequency[index][0]][0]}</div></div>`;
    for (tense in synonymTable) {
        html_str += `<h3>${tense}</h3>`;
        for (let i = 0; i < synonymTable[tense].length; i++) {
            table = synonymTable[tense][i];
            html_str += `<div onclick=clickWordNet(${index},'${tense}',${i})>`;
            html_str += `<h4>${table["def"]}</h4>`;
            for (synonym of table["synonyms"]) {
                html_str += `<div>${synonym}</div>`;
            }
            html_str += "</div>";
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
    else {
        let table = cachedSynonyms[pageFrequency[index][0]][tense][synonymIndex];
        str = table["synonyms"];
        word = table["stem"];
    }

    selection.innerHTML += `<button onclick="clickSelection(${selectedWords.length})">${str}</button>`;
    selectedWords.push(word);

    await showData();
}

async function clickSelection(index) {
    selectedWords.splice(index, 1);
    selectedValues.splice(index, 1);
    selection.removeChild(selection.children[index]);

    await showData();
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

    await processResults();

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
    globalResults.forEach(result => strs.push(result["title"] + " " + result["snippet"]));

    // send them all at once to save resource (Sunny)
    let fetched = await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(strs)
    })
        .then(response => response.json());

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
        arr = [...new Set(allOriginals[key])];
        if (arr.length > 1) {
            arr.sort((a, b) => a.length - b.length);
        }
        allOriginals[key] = arr;
    }
}



// BACKEND - Japheth
function getResults(selectedWords) {
    if (selectedWords.length == 0) {
        return [globalResults, getSumFrequency(globalResults)];
    }
    else {
        const sortResults = getResultsBySelectedWords(selectedWords);
        return [sortResults, getSumFrequency(sortResults)];
    }
}

//Copy globalResults,
//Push each result that contains the selected words into a tuple
//Sort the tuple list
function getResultsBySelectedWords(selectedWords) {
    //tuples [result, sum]
    let resultsContainingSelectedWords = [];
    globalResults.forEach(result => {
        allSum = 0;
        for (let wordle of selectedWords) { // for nested list
            let oneSum = 0;
            for (let word of wordle) {  // each word of nested list
                if (result["frequency"].has(word)) {
                    oneSum += result["frequency"].get(word);
                }
            }
            if (oneSum == 0) {
                allSum = 0;
                break;
            }
            allSum += oneSum;
        }
        if (allSum > 0) {
            resultsContainingSelectedWords.push([result, allSum]);
        }
    });
    //sort array
    sorted = resultsContainingSelectedWords.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
    ret = [];
    for (arr of sorted) {
        ret.push(arr[0]);
    }
    return ret;
}

function getSumFrequency(results) {
    let localFrequency = new Map();
    results.forEach(result => {
        for (let [key, value] of result["frequency"].entries()) {
            if (localFrequency.has(key)) {
                localFrequency.set(key, localFrequency.get(key) + value);
            }
            else {
                localFrequency.set(key, value);
            }
        }
    });
    let freqArr = [];
    for (let [key, value] of localFrequency.entries()) {
        freqArr.push([key, value]);
    }
    // console.log(freqArr);
    freqArr = freqArr.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
    return freqArr;
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
