// global variables
var results = [];
const url_base = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCbWbE7OHpGHPTv3wERt5uU9MjaCp4T4Mc&cx=136594abed8664b18";
const content = document.getElementById("content");
const searchButton = document.getElementById("search-button");

function clearOldData() {
    // remove old results, also letting user that we are pulling out new results
    results = [];
    content.innerHTML = "in progress please wait";
}


// TODO
// await the 1st then show data and then await all of the rest in the back before wordbars enable
async function fetchData() {
    query = document.getElementById("search-box").value;

    // skip empty query
    if (!query) {
        return;
    }

    const url_base_query = url_base + "&q=" + query;
    // we can only fetch 100 results at maximum
    for (let i = 0; i < 1; i++) {
        // fetch results (ten each time)
        await fetch(url_base_query + "&start=" + (i * 10 + 1)).then(res => {
            return res.json();
        }).then(data => {
            // store necessary data into global results pool
            data["items"].forEach(element => {
                results.push({
                    title: element["title"],
                    snippet: element["snippet"],
                    link: element["link"],
                });
            });
        });
    }

    // must be called here instead of onclick() in order to await
    showData();
}

function showData() {
    content.innerHTML = ""
    results.forEach(element => {
        content.innerHTML += `<h1>${element["title"]}</h1><br/>`;
    });
}

searchButton.onclick = function () {
    clearOldData();
    fetchData();
};

searchButton.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
    }
});