const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const fileBox = document.getElementById("saved-files");
const testButton = document.getElementById("test-button");
const backButton = document.getElementById("back-button");
const saveButton = document.getElementById("save-button");
const selection = document.getElementById("selection");
const amount = document.getElementById("amount");
const statusCache = document.getElementById("status");

var fetchStored = false;  // should only be controlled within the button click
var cachePromise = null;

var globalResults = [];
var selectedWords = [];
var selectedValues = [];  // since I used splice(), so not using Set
var pageFrequency = [];
var currentAllWords = new Set();
var allOriginals = {};
var cachedSynonyms = {};


// simply reset every global variables
// some of them are already reassigned, this part is for safer run
function clearResults() {
    backButton.disabled = true;
    saveButton.disabled = true;
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";
    selection.innerHTML = "";
    statusCache.innerHTML = "";
    cachePromise = null;
    globalResults = [];
    selectedWords = [];
    selectedValues = [];
    pageFrequency = [];
    currentAllWords = new Set();
    allOriginals = {};
    cachedSynonyms = {};
}

// FRONTEND - Sunny
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
            // console.log("RUN");  // should only occur twice per search
            if (isAll) {
                cachePromise = true;
                statusCache.innerHTML = "All fetched";
                statusCache.style = "color:green;";
                // console.log("DONE");  // should only occur once per search
            }
        });
}

// load this at initialization
loadSavedFiles();
function loadSavedFiles() {
    fileBox.innerHTML = "<option disabled selected value> -- select -- </option>";
    fetch("/getsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data => {
            for (file of data) {
                fileBox.innerHTML += `<option value="${file}">${file.substring(0, file.indexOf("."))}</option>`;
            }
        });
}

async function showData() {
    let [results, frequency] = getResults(selectedWords);
    pageFrequency = frequency.slice(0, 40);  // based on first reference, 40 is a good amount
    wordbars.innerHTML = "";

    currentAllWords = new Set();
    for (let [x, y] of frequency) {
        currentAllWords.add(x);
    }

    if (cachePromise) {
        // if cachePromise really exists (either a real promise or just true boolean)
        // we must wait to get this backend finish finding all synonym sets
        content.innerHTML = "<h2>Waiting for all synonym sets to be fetched</h2>";
        await cachePromise;
    }
    else {
        content.innerHTML = "<h2>Fetching synonym set from WordNet for <u>first 40 frequency</u></h2>";
        statusCache.innerHTML = "finding synonyms (top-freq)";
        statusCache.style = "color:red;";
        // we must wait the first 40 to show at the beginning
        await fetchSynonyms(pageFrequency, false);
        statusCache.innerHTML = "finding synonyms (low-freq)";
        statusCache.style = "color:orange;";
        // create the promise to find all synonym sets, should ONLY run once per search
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
    saveButton.disabled = false;

    showWordBars();
}

function showWordBars() {
    backButton.disabled = true;
    html_str = "";  // do NOT add up on innerHTML (can cause lag)
    wordbars.scrollTo(0, 0);

    maxFreq = pageFrequency[0][1];
    pageFrequency.forEach((freq, index) => {
        width = freq[1] / maxFreq * 100;
        color = "crimson";
        if (width < 30) {
            color = "pink";
        }
        else if (width < 60) {
            color = "coral";
        }
        html_str += `<div onclick="clickWordBars(${index})" 
                    style="cursor: pointer; margin-bottom: 0.2em; 
                    padding-bottom: 0.2em; width: ${width}%; background-color: ${color};">
                    ${allOriginals[freq[0]][0]}</div>`;
    });
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    root_word = pageFrequency[index][0];
    synonymTable = cachedSynonyms[root_word];
    html_str = `<div onclick=clickWordNet(${index},'',-1) style="cursor: pointer; background-color: lightgreen;">
                <h3>single word selection</h3>
                <div>${allOriginals[root_word][0]}</div></div>`;

    valid_str = {}, invalid_str = {};
    for (tense in synonymTable) {
        valid_str[tense] = [];
        invalid_str[tense] = [];

        for (let i = 0; i < synonymTable[tense].length; i++) {
            table = synonymTable[tense][i];

            let temp_str = "";
            let isValid = false;
            for (let j = 0; j < table["synonyms"].length; j++) {
                let color = "black";
                if (currentAllWords.has(table["stemmeds"][j])) {
                    isValid |= root_word != table["stemmeds"][j];
                }
                else {
                    color = "grey";
                }
                temp_str += `<div style="color:${color};">${table["synonyms"][j]}</div>`;
            }

            if (isValid) {
                valid_str[tense].push(`<div onclick="clickWordNet(${index},'${tense}',${i})" 
                            style="cursor: pointer; background-color: lightgreen;">
                            <h4>${table["def"]}</h4>${temp_str}</div>`);
            }
            else {
                invalid_str[tense].push(`<div onclick="alert('This is an ineffective synonym set!!!')" 
                            style="background-color: darkgrey;">
                            <h4>${table["def"]}</h4>${temp_str}</div>`);
            }
        }
    }

    for (tables of [valid_str, invalid_str]) {
        for (tense in synonymTable) {
            if (tables[tense].length > 0) {
                html_str += `<h3 style="text-align:center;">${tense}</h3>` + tables[tense].join("");
            }
        }
    }

    wordbars.innerHTML = html_str;
    wordbars.scrollTo(0, 0);
    backButton.disabled = false;
}

async function clickWordNet(index, tense, synonymIndex) {
    root_word = pageFrequency[index][0];

    if (tense == "") {
        unique = root_word;
        word = [root_word];
        str = allOriginals[unique][0];
    }
    else {
        let table = cachedSynonyms[root_word][tense][synonymIndex];
        unique = table["def"];
        arr = [];
        for (let j = 0; j < table["synonyms"].length; j++) {
            if (currentAllWords.has(table["stemmeds"][j])) {
                arr.push(table["synonyms"][j]);
            }
        }
        str = arr.join(" | ");
        word = table["stem"];
    }


    if (selectedValues.includes(unique)) {
        alert("Repeated selection!!!");
        return;
    }
    selectedValues.push(unique);

    selection.innerHTML += `<button onclick="clickSelection(${selectedWords.length})">${str}</button>`;
    selectedWords.push(word);

    await showData();
}

async function clickSelection(index) {
    selectedWords.splice(index, 1);
    selectedValues.splice(index, 1);
    selection.removeChild(selection.children[index]);
    for (; index < selection.children.length; index++) {
        selection.children[index].setAttribute("onclick", `clickSelection(${index})`);
    }

    await showData();
}

backButton.onclick = showWordBars;

searchButton.onclick = async function () {
    // remove old results, also tell users we are fetching new results
    clearResults();

    if (fetchStored) {
        if (!fileBox.value) {
            alert("File name (select box) can NOT be empty!");
            content.innerHTML = "";
            return;
        }
        try {
            await fetch("/getsavefile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([fileBox.value])
            })
                .then(res => res.json())
                .then(data => globalResults = data);
        }
        catch {
            content.innerHTML = `<h3>Can't find this file: ${fileBox.value}</h3>`;
            return;
        }
    }
    else {
        // alert empty query and return with no other actions
        let query = searchBox.value;
        if (!query) {
            alert("Query (Search Box) can NOT be empty!");
            content.innerHTML = "";
            return;
        }

        try {
            statusCache.innerHTML = "fetching web pages";
            statusCache.style = "color:red;";

            // fetch 3 times, but it doesn't guarantee it has 60 results (> 3 sometimes fail)
            for (let i = 0; i < 3; i++) {
                let fetched = await fetch( // even though I said 50, this includes other resources such as images
                    "https://api.bing.microsoft.com/v7.0/search?count=50&offset=" + i * 50 + "&q=" + query,
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
            }
        }
        catch {
            if (globalResults.length == 0) {
                content.innerHTML = "<h3>Unfortunately, the Bing API says we reached the limit, so only fake search works now</h3>";
                return;
            }
            else {
                alert(`<h3>There are too many requests/fetches at once so that Bing bans us, but there are still results</h3>
                <h3>If you want all results from fetches, try fetch again, this sometimes happen</h3>`);
            }
        }

        let set = new Set();
        let realResults = [];
        for (result of globalResults) {
            if (!set.has(result["url"])) {
                set.add(result["url"]);
                realResults.push(result);
            }
        }
        globalResults = realResults;
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

testButton.onclick = async function () {
    fetchStored = true;
    await searchButton.click();
    fetchStored = false;
};

saveButton.onclick = function () {
    if (!searchBox.value) {
        alert("Value of search box is required for file name!");
        return;
    }
    fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([searchBox.value, globalResults])
    });
    loadSavedFiles();
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
