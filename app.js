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
                        if (synonyms.length > 1) {  // remove single synonym set
                            let arr = [];
                            for (s of synonyms) {
                                arr.push(natural.PorterStemmer.stem(s));
                            }
                            let set = [...new Set(arr)];
                            if (set.length > 1) {  // remove single root word synonym set
                                offsets[key] = {
                                    "synonyms": synonyms,
                                    "stemmeds": arr,
                                    "stem": set,
                                    "def": result["def"]
                                };
                            }
                        }
                    }
                }

                let synonymTable = {};
                for (let key in offsets) {
                    let tense = tenses[key.charAt(0)];
                    if (!(tense in synonymTable)) {
                        synonymTable[tense] = [];
                    }
                    synonymTable[tense].push(offsets[key]);
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

// *** Integrated into a post request\wordnet.lookup('ate', function(results) {
// results.forEach(function(result) {
//     console.log('------------------------------------');
//     console.log(result.pos);
//     console.log(result.lemma);
//     console.log(result.synonyms);
//     console.log(result.pos);
//     console.log(result.gloss);
// });
// function list_synonyms(word){
//     let list_synonyms = [];
//     wordnet.lookup(word, function(results) {
//         results.forEach(function(result) {
//             //console.log(result.synonyms);
//             list_synonyms.push(result.synonyms);
//         });
//         let total_synonyms = [];
//         for (let synonym in list_synonyms) {
//             for (let word in list_synonyms[synonym]){
//                 total_synonyms.push(list_synonyms[synonym][word]);
//             }
//         }
//         for( var i = 0; i < total_synonyms.length; i++){                  
//             if ( total_synonyms[i] === word) { 
//                 total_synonyms.splice(i, 1); 
//                 i--; 
//             }
//         }
//         //console.log(total_synonyms);
//         return total_synonyms;
//     });