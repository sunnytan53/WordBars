const natural = require("natural");
const { removeStopwords } = require("stopword");
const express = require("express");
const app = express();

app.use(express.json());

app.use("/public", express.static("public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var tokenizer = new natural.WordTokenizer();
app.post("/stem", function (req, res) {
    let stemmed = [];
    let tokens = removeStopwords(
        tokenizer.tokenize(req.body["data"])
        .filter(element => element.length > 2));
    for (s of tokens) {
        stemmed.push(natural.PorterStemmer.stem(s));
    }
    res.send([tokens, stemmed]);
});

const port = 3030;
app.listen(port, function () {
    console.log("Host at: http://localhost:" + port);
});