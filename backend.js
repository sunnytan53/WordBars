// let results = []

document.getElementById("search").onclick = function search() {
    let url_base = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCbWbE7OHpGHPTv3wERt5uU9MjaCp4T4Mc&cx=136594abed8664b18&q=" + document.getElementById("search-box").value

    // maxmimum results we can fetch is 100 which is 10 rounds
    // set the second expression to reduce the request amount
    for (let i = 0; i < 1; i++) {  
        start = i * 10 + 1;  // each start is *1
        url = url_base + "&start=" + i

        // fetch ten results each time
        fetch(url).then(function(res) { 
            return res.json()
        }).then(function(data) {
            console.log(data["items"])
        })
        }
}

// function hndlr(response) {
//   console.log(response)
// for (var i = 0; i < response.items.length; i++) {
//   var item = response.items[i];
//   // Make sure HTML in item.htmlTitle is escaped.
//   document.getElementById("content").append(
//     document.createElement("br"),
//     document.createTextNode(item.htmlTitle)
//   );
// }
// }