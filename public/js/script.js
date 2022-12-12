const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const fileBox = document.getElementById("saved-files");
const backButton = document.getElementById("back-button");
const selection = document.getElementById("selection");
const amount = document.getElementById("amount");
const checkbox = document.getElementById("checkbox");

// by default, we hide the feature of using pre-saved results
// this is avoid the problem of not able to read file correctly
fileBox.hidden = false;

// load only if fileBox is not hidden (which means you want to enable it)
if (!fileBox.hidden) {
    loadSavedFiles();
}

var globalResults = [];
var selectedWordsOrSynonyms = [];
var selectionID = [];
var pageFrequency = [];
var currentAllWords = new Set();
var allOriginals = {};
var cachedSynonyms = {};


// simply reset every global variables
// some of them are already reassigned, this part is for safer run
function clearResults() {
    backButton.disabled = true;
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";
    selection.innerHTML = "";

    globalResults = [];
    selectedWordsOrSynonyms = [];
    selectionID = [];
    pageFrequency = [];
    currentAllWords = new Set();
    allOriginals = {};
    cachedSynonyms = {};
}

function loadSavedFiles() {
    fileBox.innerHTML = "<option disabled selected value> -- select -- </option>";
    fetch("/getsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data => {
            for (file of data) {
                fileBox.innerHTML += `<option value="${file}">${file.substring(0, file.lastIndexOf("."))}</option>`;
            }
        });
}

// fetch partial (this should be waited)
async function fetchSynonyms(freqArr) {
    let uncahced = {};
    let hasNew = false;
    for (let [stem, freq] of freqArr) {
        if (!(stem in cachedSynonyms)) {
            uncahced[stem] = allOriginals[stem];
            hasNew = true;
        }
    }

    // *** it is important to cache synonyms for each search since it takes some time
    // the module support cache but it is actually slower in terms of user experience
    if (hasNew) {
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
            });
    }
}

async function showData() {
    let [results, frequency] = getResults(selectedWordsOrSynonyms);
    pageFrequency = frequency.slice(0, 40);  // based on first reference, 40 is a good amount
    wordbars.innerHTML = "";

    currentAllWords = new Set();
    for (let [x, y] of frequency) {
        currentAllWords.add(x);
    }

    content.innerHTML = "<h2>Fetching synonym set from WordNet for <u>first 40 frequency</u></h2>";
    await fetchSynonyms(pageFrequency);

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
    backButton.disabled = true;
    html_str = "";  // do NOT add up on innerHTML (can cause lag)
    wordbars.scrollTo(0, 0);

    maxFreq = pageFrequency[0][1];
    pageFrequency.forEach((freq, index) => {
        rate = freq[1] / maxFreq;

        html_str += `<div onclick="clickWordBars(${index})" 
                    style="cursor: pointer; margin-bottom: 0.2em; 
                    padding-bottom: 0.2em; width: ${(rate * 100) | 0}%; 
                    background-color: rgb(255,${(255 * (1 - rate)) | 0},${(200 * (1 - rate)) | 0});">
                    ${allOriginals[freq[0]][0]}</div>`;
    });
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    rootWord = pageFrequency[index][0];
    wordToShow = allOriginals[rootWord][0];
    synonymTable = cachedSynonyms[rootWord];

    html_str = `<div onclick=clickWordNet(${index},'',-1) style="cursor: pointer; background-color: lightgreen;">
                <h3>single word selection</h3>
                <div>${wordToShow}</div></div>`;

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
                    isValid |= rootWord != table["stemmeds"][j];
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
    rootWord = pageFrequency[index][0];

    if (tense == "") {
        unique = rootWord;
        word = [rootWord];
        str = allOriginals[unique][0];
    }
    else {
        let table = cachedSynonyms[rootWord][tense][synonymIndex];
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


    if (selectionID.includes(unique)) {
        alert("Repeated selection!!!");
        return;
    }
    selectionID.push(unique);

    selection.innerHTML += `&nbsp;<button onclick="clickSelection(${selectedWordsOrSynonyms.length})">${str}</button>&nbsp;`;
    selectedWordsOrSynonyms.push(word);

    await showData();
}

async function addToQuery(word) {
    searchBox.value += " " + word;
    await searchButton.click();
}

function clickSelection(index) {
    select = selection.children[index].textContent;
    html_str = `<div onclick=removeSelection(${index})
                style="cursor: pointer; text-align: center; background-color: pink;">
                <h4>Remove this selection:</br>${select}</h4></div>`;

    words = select.split(" | ");
    for (word of words) {
        html_str += `<div onclick=addToQuery('${word}')
                    style="cursor: pointer; text-align: center; background-color: lightgreen;">
                    <h4>Add <u>${word}</u> to query</h4></div>`;
    }

    wordbars.innerHTML = html_str;
    backButton.disabled = false;
}

async function removeSelection(index) {
    selectedWordsOrSynonyms.splice(index, 1);
    selectionID.splice(index, 1);
    selection.removeChild(selection.children[index]);
    for (; index < selection.children.length; index++) {
        selection.children[index].setAttribute("onclick", `clickSelection(${index})`);
    }

    await showData();
}

backButton.onclick = showWordBars;

searchButton.onclick = async function () {
    clearResults();
    fileBox.value = "";  // this reset the file box

    // alert empty query and return with no other actions
    let query = searchBox.value;
    if (!query) {
        alert("Query (Search Box) can NOT be empty!");
        content.innerHTML = "";
        return;
    }

    try {
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

function saveResults() {
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

fileBox.onchange = async () => {
    if (!fileBox.value) {
        alert("File name (select box) can NOT be empty!");
        content.innerHTML = "";
        return;
    }

    clearResults();

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

    searchBox.value = fileBox.value.substring(0, fileBox.value.lastIndexOf("."));

    await processResults();

    await showData();
};

checkbox.onclick = async () => {
    if (globalResults.length > 0) {
        await showData();
    }
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
        // if (arr.length > 1) {
        //     arr.sort((a, b) => a.length - b.length);
        // }
        allOriginals[key] = arr;
    }
}




function getResults(selectedWords) {
    theResult = null;
    if (selectedWords.length == 0) {
        theResult = globalResults;
    }
    else {
        theResult = getResultsBySelectedWords(selectedWords);
    }

    if (checkbox.checked) {
        theResult = theResult.slice(0, 10);
    }

    return [theResult, getSumFrequency(theResult)];
}

//Copy globalResults,
//Push each result that contains the selected words into a tuple
//Sort the tuple list
function getResultsBySelectedWords(selectedWords) {
    //tuples [result, sum]
    let resultsContainingSelectedWords = [];
    globalResults.forEach(result => {
        let count = 0;
        let allSum = 0;
        for (let wordle of selectedWords) { // for each synonym set
            let oneSum = 0;
            for (let word of wordle) {  // each word of synonym set
                if (result["frequency"].has(word)) {
                    oneSum += result["frequency"].get(word);
                }
            }
            if (oneSum > 0) {
                count++;  // count how many synonym set is matched
            }
            allSum += oneSum;
        }
        // only keep results that fits at least one group
        if (count > 0) {
            resultsContainingSelectedWords.push([result, count, allSum]);
        }
    });
    // sort array
    // first check fitted group count -> ensure results match more groups are top
    // second check the total frequency of matched words
    sorted = resultsContainingSelectedWords.sort((f1, f2) => {
        if (f1[1] == f2[1]) {
            return f2[2] - f1[2];  // more frequency of fit words -> order higer
        }
        else {
            return f2[1] - f1[1];  // more fit groups -> order higher
        }
    });

    // console.log(resultsContainingSelectedWords);

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
