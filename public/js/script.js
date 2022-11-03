// global variables
const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");

function showData() {
    content.innerHTML = "";
    wordbars.innerHTML = "";
    let [results, frequency] = getResults([])

    results.forEach(element => {
        content.innerHTML += element["title"] + "<br/>" + element["snippet"] + "<br/>" + element["url"] + "<br/>";
    });
    frequency.forEach(element => {
        wordbars.innerHTML += element[0] + ": " + element[1] + "<br/>";
    })
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
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";

    // fetch max allowed amount of results
    // based on API Doc, this amount is 50, but after test, it is only 20
    let fetched = await fetch("https://api.bing.microsoft.com/v7.0/search?count=50&q=" + query,
        { headers: { "Ocp-Apim-Subscription-Key": "68dc5cf46ecc419688a1066dd7b2b9d5" } })
        .then(response => response.json())
        .then(data => data["webPages"]["value"]);

    for (let result of fetched) {
        await addResult(result["name"], result["snippet"], result["url"]);
    }

    showData();
};

// press enter = clicking search button
searchBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
    }
});


const testButton = document.getElementById("test-button");
testButton.onclick = async function () {
    // remove old results, also tell users we are fetching new results
    clearResults();
    content.innerHTML = "<h2>Fetching Results From Bing</h2>";
    wordbars.innerHTML = "";

    // fetch max allowed amount of results
    // based on API Doc, this amount is 50, but after test, it is only 20
    let fake = [
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.0",
            "contractualRules": [
                {
                    "_type": "ContractualRules/LicenseAttribution",
                    "targetPropertyName": "snippet",
                    "targetPropertyIndex": 0,
                    "mustBeCloseToContent": true,
                    "license": {
                        "name": "CC-BY-SA",
                        "url": "http://creativecommons.org/licenses/by-sa/3.0/"
                    },
                    "licenseNotice": "Text under CC-BY-SA license"
                }
            ],
            "name": "Computer science - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Computer_science",
            "isFamilyFriendly": true,
            "displayUrl": "https://en.wikipedia.org/wiki/Computer_science",
            "snippet": "Computer science is the study of computation, automation, and information. [1] Computer science spans theoretical disciplines (such as algorithms, theory of computation, information theory, and automation) to practical disciplines (including the design and implementation of hardware and software ).",
            "dateLastCrawled": "2022-10-05T12:30:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.1",
            "name": "computer science | Definition, Types, & Facts | Britannica",
            "url": "https://www.britannica.com/science/computer-science",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.britannica.com/science/computer-science",
            "snippet": "Computer science is considered as part of a family of five separate yet interrelated disciplines: computer engineering, computer science, information systems, information technology, and software engineering. This family has come to be known collectively as the discipline of computing.",
            "dateLastCrawled": "2022-10-05T11:16:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.2",
            "name": "Computer Science – MIT EECS",
            "url": "https://www.eecs.mit.edu/research/computer-science/",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.eecs.mit.edu/research/computer-science",
            "snippet": "Computer science deals with the theory and practice of algorithms, from idealized mathematical procedures to the computer systems deployed by major tech companies to answer billions of user requests per day.",
            "dateLastCrawled": "2022-10-05T09:23:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.3",
            "name": "What is Computer Science? - Codecademy News",
            "url": "https://www.codecademy.com/resources/blog/what-is-computer-science/",
            "thumbnailUrl": "https://www.bing.com/th?id=OIP.Ku1qau6xB9uTZkcxMZ7wOAHaDH&pid=Api",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.codecademy.com/resources/blog/what-is-computer-science",
            "snippet": "Computer science is the study of computers and how they work, including software, hardware, and algorithms. An algorithm is a list of instructions for completing a task. In computer science, an algorithm tells the computer what to do and how to do it.",
            "dateLastCrawled": "2022-10-04T13:10:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.4",
            "name": "Computer Science",
            "url": "https://www.computerscience.org/",
            "thumbnailUrl": "https://www.bing.com/th?id=OIP.N7B9slV4xJ59INwavTFf_gHaED&pid=Api",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.computerscience.org",
            "snippet": "From healthcare to telecommunications to aerospace, today's fastest growing careers are tech-driven. By 2026, computer science research jobs are projected to increase by 19%.* Take advantage of the high demand for your problem-solving skills and find the right career for you. Video Game Designer Software Engineer Systems Analyst IT Architect",
            "dateLastCrawled": "2022-10-04T10:14:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.5",
            "name": "What is Computer Science? | Definition, Tools and Resources",
            "url": "https://www.mastersindatascience.org/learning/what-is-computer-science/",
            "thumbnailUrl": "https://www.bing.com/th?id=OIP.QxFCssKUFLjf54FTR0te8wHaD7&pid=Api",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.mastersindatascience.org/learning/what-is-computer-science",
            "snippet": "Computer science is the study of computers, including computational theory, hardware and software design, algorithms and the way humans interact with technology. If you’re interested in a challenging and rewarding career path, you may want to consider becoming a computer scientist. SPONSORED SCHOOL Simmons University info",
            "dateLastCrawled": "2022-10-05T17:06:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.6",
            "name": "What is Computer Science? | National University",
            "url": "https://www.nu.edu/blog/what-is-computer-science/",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.nu.edu/blog/what-is-computer-science",
            "snippet": "Interactive Python defines computer science as “the study of problems, problem-solving, and the solutions that come out of the problem-solving process. Given a problem, a computer scientist’s goal is to develop an algorithm, a step-by-step list of instructions for solving any instance of the problem that might arise.",
            "dateLastCrawled": "2022-10-05T12:33:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.7",
            "name": "Computer Science | University of California Santa Cruz",
            "url": "https://admissions.ucsc.edu/programs/computer-science",
            "isFamilyFriendly": true,
            "displayUrl": "https://admissions.ucsc.edu/programs/computer-science",
            "snippet": "The computer science curriculum gives students a solid grounding in both theoretical and practical computer usage. Students become proficient in many areas, with a good academic foundation for various careers in the software industry, as well as preparation for graduate school.",
            "dateLastCrawled": "2022-10-05T06:37:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.8",
            "name": "Computer Science < University of California, Berkeley",
            "url": "https://guide.berkeley.edu/undergraduate/degree-programs/computer-science/",
            "isFamilyFriendly": true,
            "displayUrl": "https://guide.berkeley.edu/undergraduate/degree-programs/computer-science",
            "snippet": "It includes the theory of computation, the design and analysis of algorithms, the architecture and logic design of computers, programming languages, compilers, operating systems, scientific computation, computer graphics, databases, artificial intelligence, and natural language processing.",
            "dateLastCrawled": "2022-08-28T21:08:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.9",
            "name": "Computer Science Degrees - University of the People",
            "url": "https://www.uopeople.edu/programs/computer-science/",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.uopeople.edu/programs/computer-science",
            "snippet": "Our Computer Science certificate programs help students gain an advanced skillset in a shorter timeframe than a traditional undergraduate degree. Students will learn the latest in specific areas of computing, helping them thrive in the evolving field of technology. Learn More.",
            "dateLastCrawled": "2022-10-05T11:44:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.10",
            "name": "Computer Science Courses | Harvard University",
            "url": "https://pll.harvard.edu/subject/computer-science",
            "isFamilyFriendly": true,
            "displayUrl": "https://pll.harvard.edu/subject/computer-science",
            "snippet": "Computer Science Online Fundamentals of TinyML Focusing on the basics of machine learning and embedded systems, such as smartphones, this course will introduce you to the “... Free* 5 weeks long Available now Computer Science Online Applications of TinyML Get the opportunity to see TinyML in practice.",
            "dateLastCrawled": "2022-10-04T09:42:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.11",
            "name": "What Is a Computer Science Degree? | Coursera",
            "url": "https://www.coursera.org/articles/what-is-computer-science-degree",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.coursera.org/articles/what-is-computer-science-degree",
            "snippet": "Computer science is a broad field that encompasses everything from computer systems and networks to cybersecurity. Computer scientists may work as software developers, computer systems analysts, database administrators, or other careers related to the way software systems operate.",
            "dateLastCrawled": "2022-10-04T22:31:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.12",
            "name": "What Is Computer Science? Experts Explain Their Field",
            "url": "https://www.rasmussen.edu/degrees/technology/blog/what-is-computer-science/",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.rasmussen.edu/degrees/technology/blog/what-is-computer-science",
            "snippet": "Computer science professionals solve those problems by writing code, creating algorithms and putting their creativity to work. Computer science may appear mysterious or even magical to the inexperienced. But in reality, it’s a field filled with hard-working programmers who use many skills and tools to make computers function.",
            "dateLastCrawled": "2022-10-05T10:06:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.13",
            "name": "Computer Science | University Of Cincinnati",
            "url": "https://ceas.uc.edu/academics/departments/computer-science.html",
            "isFamilyFriendly": true,
            "displayUrl": "https://ceas.uc.edu/academics/departments/computer-science.html",
            "snippet": "Computer Scientists design and build computational information processing systems. They develop software, algorithms, data management, and analysis systems. From pacemakers to race cars, these systems are used in all aspects of society. Contact Us",
            "dateLastCrawled": "2022-10-04T21:38:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.14",
            "name": "Computer Science | Columbia Engineering",
            "url": "https://www.engineering.columbia.edu/departments/computer-science",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.engineering.columbia.edu/departments/computer-science",
            "snippet": "Computer science is now integral to almost every field of study, from engineering and the natural and social sciences, to economics and business, and increasingly to the heavily text-based fields of literature and history. The trend is irreversible, driven by more powerful computers, larger data sets, the conversion of text and imagery into data, and better, more optimized algorithms.",
            "dateLastCrawled": "2022-10-05T16:26:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.15",
            "name": "Learn Computer Science with Online Courses, Classes, & Lessons - edX",
            "url": "https://www.edx.org/learn/computer-science",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.edx.org/learn/computer-science",
            "snippet": "Stanford Online offers a Computer Science 101 course designed to introduce students to the basics. Students will learn fundamental information about software and hardware systems as well as information on software development. Students can also take focused courses such as Harvard's certification series in Computer Science for Artificial ...",
            "dateLastCrawled": "2022-10-05T04:16:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.16",
            "name": "What You Need to Know About Becoming a Computer Science Major",
            "url": "https://www.usnews.com/education/best-colleges/computer-science-major-overview",
            "thumbnailUrl": "https://www.bing.com/th?id=OIP.WuBU8h3FQJtVgabEN-ob-wHaE3&pid=Api",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.usnews.com/education/best-colleges/computer-science-major-overview",
            "snippet": "Computer science is a major for problem solvers who want to learn how to use computers and computational processes to build websites, program robots, mine data and more. Computer science majors may...",
            "dateLastCrawled": "2022-10-04T22:50:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.17",
            "name": "B.S. in Computer Science Degree - University of Cincinnati",
            "url": "https://ceas.uc.edu/academics/departments/computer-science/degrees-programs/computer-science-bachelor-of-science.html",
            "isFamilyFriendly": true,
            "displayUrl": "https://ceas.uc.edu/academics/departments/computer-science/degrees-programs/computer...",
            "snippet": "Some important areas of computer science are: the design of more powerful or more easily used computer languages; the design of more powerful compilers, which translate programs written in computer languages into machine-executable code; the design of operating systems; and the design of networks and methodologies for computing over multiple ...",
            "dateLastCrawled": "2022-10-05T22:30:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.18",
            "name": "Computer Science Major | Computer Science and Engineering at Michigan",
            "url": "https://cse.engin.umich.edu/academics/undergraduate/computer-science-eng/",
            "isFamilyFriendly": true,
            "displayUrl": "https://cse.engin.umich.edu/academics/undergraduate/computer-science-eng",
            "snippet": "The computer science program requires students to have a solid foundation in computer software, hardware, and theory, but also gives each student ample opportunity to take advanced electives in areas of computer science such as databases, architecture, networks, artificial intelligence, and graphics, or in emerging interdisciplinary areas such ...",
            "dateLastCrawled": "2022-10-06T00:08:00.0000000Z",
            "language": "en",
            "isNavigational": false
        },
        {
            "id": "https://api.bing.microsoft.com/api/v7/#WebPages.19",
            "name": "Explore A Degree In Computer Science : Top Programs & Majors",
            "url": "https://www.computerscience.org/degrees/",
            "isFamilyFriendly": true,
            "displayUrl": "https://www.computerscience.org/degrees",
            "snippet": "According to the BLS, web developers earn a median annual salary of $73,760. Students who complete master's degrees in computer science can work as computer and information research scientists. According to the BLS, professionals in this career earn a median annual salary of $122,840. Computer science graduates with all levels of education ...",
            "dateLastCrawled": "2022-10-05T00:32:00.0000000Z",
            "language": "en",
            "isNavigational": false
        }
    ];

    for (let result of fake) {
        await addResult(result["name"], result["snippet"], result["url"]);
    }

    showData();
};




// BACKEND STARTS HERE
// BELOW ARE template methods
var globalResults = [];

function clearResults() {
    // simply set your global array = []
    // nothing to return
    globalResults = [];
}


async function addResult(title, snippet, url) {
    let results = title+ " " + snippet;
    // results = remove_common_words(results);
    // nothing to return
    globalResults.push({
        "title": title,
        "snippet": snippet,
        "url": url,
        "frequency": await getLocalFrequencyTable(results),
        "original": remove_common_words(title +" "+ snippet).split(" ")
    });
}

function getResults(selectedWords) {
    // selectedWords are corresponding to WordBars, which is a list
    // HOWEVER, if I pass in empty array [], that means no selection
    // return the original order of results, 
    // this is also the first thing you will test

    // Potential BUG:
    // the results length may not be >= 20
    // so please check it first before you use 20 as a fixed length
    
    if (selectedWords.length == 0) {
        let localFrequency = new Map();
        globalResults.forEach(result => {
            for (let [key, value] of  result["frequency"].entries()) {
                if(localFrequency.has(key)){
                    localFrequency.set(key, localFrequency.get(key) + value);
                }
                else {
                    localFrequency.set(key,value);
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
        let localFrequency = new Map();
        const array = [];
        globalResults.forEach(result => {
            for(let word of selectedWords){
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
            for (select of selectedWords){
                // add to all values
                allValuesOfSelectedWords += result["frequency"][select]; 
                selectedFreqArr.push([result,allValuesOfSelectedWords]);
            }
        }
        selectedFreqArr = selectedFreqArr.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
        return array;
    }
}


function remove_common_words(results) {
    // you get a json object
    //let whole_str = result["title"] + result["snippet"];
    var uselessWordsArray = 
        [
          "a", "at", "be", "can", "cant", "could", "couldnt", 
          "do", "does", "how", "i", "in", "is", "many", "much", "of", 
          "on", "or", "should", "shouldnt", "so", "such", "the", 
          "them", "they", "to", "us",  "we", "what", "who", "why", 
          "with", "wont", "would", "wouldnt", "you"
        ];
    results = ' ' + results + ' ';
    results = results.toLowerCase().replace(/\s+/g, ' ').trim();    
	results = results.replace(/[^a-zA-Z0-9 ]/g, '');
    results.replace(uselessWordsArray, '');
    return results;
}

async function getLocalFrequencyTable(results) {
    let frequencyTable = new Map();
    
    await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({"data": results})
    })
    .then(response => response.json())
    .then(data =>
        data.forEach(element => {
            if (frequencyTable.has(element)) {
                frequencyTable.set(element, frequencyTable.get(element) + 1);
            }
            else {
                frequencyTable.set(element, 1);
            }
    }));

    return frequencyTable;
}

//Copy globalResults,
//Push each result that contains the selected words into a tuple
//Sort the tuple list
function getResultsBySelectedWords(globalResults,selectedWords){ 
   let resultList = JSON.parse(JSON.stringify(globalResults));
   //tuples [result, sum]
   let resultsContainingSelectedWords = {};
   resultList.forEach(element => {
    let sum = 0;
    for(let word in selectedWords){
        for(let tupleWord in element.frequency){
            if(tupleWord[0] == word){
                sum =+ tupleWord[1];
            }
        }
        resultsContainingSelectedWords.push([element,sum]);
    }
   });
   //sort array
   resultsContainingSelectedWords = resultsContainingSelectedWords.sort((f1, f2) => (f1[1] < f2[1]) ? 1 : (f1[1] > f2[1]) ? -1 : 0);
}