// global variables
var results = [];
const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchButton = document.getElementById("search-button");

function showData(data) {
    content.innerHTML = "";
    results.forEach(element => {
        content.innerHTML += `<h3>${element["title"]}</h3><br/><h5>${element["snippet"]}</h5><br/>`;
    });
}

searchButton.onclick = async function () {
    // remove old results, also letting user that we are fetching new results
    results = [];
    content.innerHTML = "";
    wordbars.innerHTML = "<h2>WordBars Area (under devleopment)</h2>";

    // alert empty query
    query = document.getElementById("search-box").value;
    if (!query) {
        content.innerHTML = "query can NOT be empty!";
        wordbars.innerHTML = "";
        return;
    }

    // fetch max allowed amount of results
    // based on API Doc, this amount is 50, but after test, it is only 20
    await fetch("https://api.bing.microsoft.com/v7.0/search?count=50&q=" + query,
        { headers: { "Ocp-Apim-Subscription-Key": "68dc5cf46ecc419688a1066dd7b2b9d5" } })
        .then(response => response.json())
        .then(data => {
            data["webPages"]["value"].forEach(element => {
                results.push({
                    title: element["name"],
                    snippet: element["snippet"],
                    url: element["url"]
                });
            });
        });

    showData();
};

// not working
// searchButton.addEventListener("keypress", function (event) {
//     if (event.key === "Enter") {
//         event.preventDefault();
//         searchButton.click();
//     }
// });