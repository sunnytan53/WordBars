const natural = require("natural");
const { removeStopwords } = require("stopword");
const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

app.use("/public", express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// stemming and return both originals and stems (Japheth & Sunny)
var tokenizer = new natural.WordTokenizer();
app.post("/stem", (req, res) => {
    let sent = [];
    for (word of req.body) {
        let stemmed = [];
        let tokens = removeStopwords(  // replaced remove_common_words() in backend
            tokenizer.tokenize(word.toLowerCase().replace(/[0-9]/g, "")).filter(element => element.length > 2)
        );
        for (s of tokens) {
            stemmed.push([s, natural.PorterStemmer.stem(s)]);
        }
        sent.push(stemmed);
    }
    res.send(sent);
});

// look up synonyms in WordNet (Sunny and Japheth)
// question1: what to do with compounded word, e.g. machine_learning
// question2: what to do with single synonyms? 
const tenses = { "n": "Noun", "v": "Verb", "a": "Adj.", "s": "Adj.", "r": "Adv." };
const WordNet = require("node-wordnet");
var wordnet = new WordNet();
app.post("/wordnet", async (req, res) => {
    let promises = [];
    let indices = [];

    for (let stem in req.body) {
        for (let word of req.body[stem]) {
            promises.push(wordnet.lookupAsync(word));
        }
        promises.push(wordnet.lookupAsync(stem));
        indices.push([stem, promises.length]);
    }

    let allSynnonyms = {};
    await Promise.all(promises)
        .then(lookups => {
            let s = 0;
            for (let [stem, i] of indices) {
                let offsets = {};
                for (results of lookups.slice(s, i)) {
                    for (result of results) {
                        let key = result["pos"] + result["synsetOffset"];
                        synonyms = result["synonyms"].filter(ele => !(ele.includes("_")));
                        let arr = [];
                        for (s of synonyms) {
                            arr.push(natural.PorterStemmer.stem(s));
                        }
                        let set = [...new Set(arr)];
                        offsets[key] = {
                            "synonyms": synonyms,
                            "stemmeds": arr,
                            "stem": set,
                            "def": result["def"]
                        };
                    }
                }

                let synonymTable = {};
                for (let key in offsets) {
                    let table = offsets[key];
                    // only keep tables that has two synonym root words
                    // and really contains the original root word
                    // some bad example (found) :
                    // "world" may has a set that does not contain "world"
                    if (table["stem"].length > 1 && table["stem"].includes(stem)) {
                        let tense = tenses[key.charAt(0)];
                        if (!(tense in synonymTable)) {
                            synonymTable[tense] = [];
                        }
                        synonymTable[tense].push(table);
                    }
                }
                allSynnonyms[stem] = synonymTable;

                s = i;
            }
        });

    res.send(allSynnonyms);
});

app.post("/save", (req, res) => {
    fs.writeFileSync("./saved/" + req.body[0] + ".json", JSON.stringify(req.body[1]));
});

app.post("/getsave", (req, res) => {
    res.send(fs.readdirSync("./saved/"));
});

app.post("/getsavefile", (req, res) => {
    res.send(fs.readFileSync("./saved/" + req.body[0]));
});

const port = 3030;
app.listen(port, () => {
    console.log("Host at: http://localhost:" + port);
});