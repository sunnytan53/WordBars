// FRONTEND
const content = document.getElementById("content");
const wordbars = document.getElementById("word-bars");
const searchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const selection = document.getElementById("selection");

var selecetedWords = [];
var pageFrequency = [];

function showData() {
    let [results, frequency] = getResults(selecetedWords);
    pageFrequency = frequency;

    html_str = ""
    results.forEach(element => {
        html_str += `<div>${element["title"]}<br/>${element["snippet"]}<br/>${element["url"]}<br/></div><br/>`
    });
    content.innerHTML = html_str;

    html_str = ""
    frequency.forEach((element, index) => {
        html_str += `<div onclick="clickWordBars(${index})">${element[0]}: ${element[1]}</div>`
    })
    wordbars.innerHTML = html_str;
}

function clickWordBars(index) {
    word = pageFrequency[index][0]
    selection.innerHTML += `<div onclick="clickSelection(${selection.length})">${word}</div>`;
    selecetedWords.push(word);
    showData();
}

function clickSelection(index) {
    selecetedWords.splice(index, 1);

    html_str = "";
    selecetedWords.forEach((element, index) => {
        html_str += `<div onclick="clickSelection(${index})">${element}</div>`
    })
    selection.innerHTML = html_str;
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
          name: 'Computer science - Wikipedia',
          snippet: 'Computer science is the study of computation, automation, and information. [1] Computer science spans theoretical disciplines (such as algorithms, theory of computation, information theory, and automation) to practical disciplines (including the design and implementation of hardware and software ).',
          url: 'https://en.wikipedia.org/wiki/Computer_science'
        },
        {
          name: 'computer science | Definition, Types, & Facts | Britannica',
          snippet: 'Computer science is considered as part of a family of five separate yet interrelated disciplines: computer engineering, computer science, information systems, information technology, and software engineering. This family has come to be known collectively as the discipline of computing.',
          url: 'https://www.britannica.com/science/computer-science'
        },
        {
          name: 'Computer Science – MIT EECS',
          snippet: 'Computer science deals with the theory and practice of algorithms, from idealized mathematical procedures to the computer systems deployed by major tech companies to answer billions of user requests per day.',
          url: 'https://www.eecs.mit.edu/research/computer-science/'
        },
        {
          name: 'What is Computer Science? - Codecademy News',
          snippet: 'Computer science is the study of computers and how they work, including software, hardware, and algorithms. An algorithm is a list of instructions for completing a task. In computer science, an algorithm tells the computer what to do and how to do it.',
          url: 'https://www.codecademy.com/resources/blog/what-is-computer-science/'
        },
        {
          name: 'Computer Science',
          snippet: "From healthcare to telecommunications to aerospace, today's fastest growing careers are tech-driven. By 2026, computer science research jobs are projected to increase by 19%.* Take advantage of the high demand for your problem-solving skills and find the right career for you. Video Game Designer Software Engineer Systems Analyst IT Architect",
          url: 'https://www.computerscience.org/'
        },
        {
          name: 'What is Computer Science? | Definition, Tools and Resources',
          snippet: 'Computer science is the study of computers, including computational theory, hardware and software design, algorithms and the way humans interact with technology. If you’re interested in a challenging and rewarding career path, you may want to consider becoming a computer scientist. SPONSORED SCHOOL Simmons University info',
          url: 'https://www.mastersindatascience.org/learning/what-is-computer-science/'
        },
        {
          name: 'What is Computer Science? | National University',
          snippet: 'Interactive Python defines computer science as “the study of problems, problem-solving, and the solutions that come out of the problem-solving process. Given a problem, a computer scientist’s goal is to develop an algorithm, a step-by-step list of instructions for solving any instance of the problem that might arise.',
          url: 'https://www.nu.edu/blog/what-is-computer-science/'
        },
        {
          name: 'Computer Science | University of California Santa Cruz',
          snippet: 'The computer science curriculum gives students a solid grounding in both theoretical and practical computer usage. Students become proficient in many areas, with a good academic foundation for various careers in the software industry, as well as preparation for graduate school.',
          url: 'https://admissions.ucsc.edu/programs/computer-science'
        },
        {
          name: 'Computer Science < University of California, Berkeley',
          snippet: 'It includes the theory of computation, the design and analysis of algorithms, the architecture and logic design of computers, programming languages, compilers, operating systems, scientific computation, computer graphics, databases, artificial intelligence, and natural language processing.',
          url: 'https://guide.berkeley.edu/undergraduate/degree-programs/computer-science/'
        },
        {
          name: 'Computer Science Degrees - University of the People',
          snippet: 'Our Computer Science certificate programs help students gain an advanced skillset in a shorter timeframe than a traditional undergraduate degree. Students will learn the latest in specific areas of computing, helping them thrive in the evolving field of technology. Learn More.',
          url: 'https://www.uopeople.edu/programs/computer-science/'
        },
        {
          name: 'Computer Science Courses | Harvard University',
          snippet: 'Computer Science Online Fundamentals of TinyML Focusing on the basics of machine learning and embedded systems, such as smartphones, this course will introduce you to the “... Free* 5 weeks long Available now Computer Science Online Applications of TinyML Get the opportunity to see TinyML in practice.',
          url: 'https://pll.harvard.edu/subject/computer-science'
        },
        {
          name: 'What Is a Computer Science Degree? | Coursera',
          snippet: 'Computer science is a broad field that encompasses everything from computer systems and networks to cybersecurity. Computer scientists may work as software developers, computer systems analysts, database administrators, or other careers related to the way software systems operate.',
          url: 'https://www.coursera.org/articles/what-is-computer-science-degree'
        },
        {
          name: 'What Is Computer Science? Experts Explain Their Field',
          snippet: 'Computer science professionals solve those problems by writing code, creating algorithms and putting their creativity to work. Computer science may appear mysterious or even magical to the inexperienced. But in reality, it’s a field filled with hard-working programmers who use many skills and tools to make computers function.',
          url: 'https://www.rasmussen.edu/degrees/technology/blog/what-is-computer-science/'
        },
        {
          name: 'Computer Science | University Of Cincinnati',
          snippet: 'Computer Scientists design and build computational information processing systems. They develop software, algorithms, data management, and analysis systems. From pacemakers to race cars, these systems are used in all aspects of society. Contact Us',
          url: 'https://ceas.uc.edu/academics/departments/computer-science.html'
        },
        {
          name: 'Computer Science | Columbia Engineering',
          snippet: 'Computer science is now integral to almost every field of study, from engineering and the natural and social sciences, to economics and business, and increasingly to the heavily text-based fields of literature and history. The trend is irreversible, driven by more powerful computers, larger data sets, the conversion of text and imagery into data, and better, more optimized algorithms.',
          url: 'https://www.engineering.columbia.edu/departments/computer-science'
        },
        {
          name: 'Learn Computer Science with Online Courses, Classes, & Lessons - edX',
          snippet: "Stanford Online offers a Computer Science 101 course designed to introduce students to the basics. Students will learn fundamental information about software and hardware systems as well as information on software development. Students can also take focused courses such as Harvard's certification series in Computer Science for Artificial ...",
          url: 'https://www.edx.org/learn/computer-science'
        },
        {
          name: 'What You Need to Know About Becoming a Computer Science Major',
          snippet: 'Computer science is a major for problem solvers who want to learn how to use computers and computational processes to build websites, program robots, mine data and more. Computer science majors may...',
          url: 'https://www.usnews.com/education/best-colleges/computer-science-major-overview'
        },
        {
          name: 'B.S. in Computer Science Degree - University of Cincinnati',
          snippet: 'Some important areas of computer science are: the design of more powerful or more easily used computer languages; the design of more powerful compilers, which translate programs written in computer languages into machine-executable code; the design of operating systems; and the design of networks and methodologies for computing over multiple ...',
          url: 'https://ceas.uc.edu/academics/departments/computer-science/degrees-programs/computer-science-bachelor-of-science.html'
        },
        {
          name: 'Computer Science Major | Computer Science and Engineering at Michigan',
          snippet: 'The computer science program requires students to have a solid foundation in computer software, hardware, and theory, but also gives each student ample opportunity to take advanced electives in areas of computer science such as databases, architecture, networks, artificial intelligence, and graphics, or in emerging interdisciplinary areas such ...',
          url: 'https://cse.engin.umich.edu/academics/undergraduate/computer-science-eng/'
        },
        {
          name: 'Explore A Degree In Computer Science : Top Programs & Majors',
          snippet: "According to the BLS, web developers earn a median annual salary of $73,760. Students who complete master's degrees in computer science can work as computer and information research scientists. According to the BLS, professionals in this career earn a median annual salary of $122,840. Computer science graduates with all levels of education ...",
          url: 'https://www.computerscience.org/degrees/'
        }
    ];

    for (let result of fake) {
        await addResult(result["name"], result["snippet"], result["url"]);
    }

    showData();
};




// BACKEND
var globalResults = [];

function clearResults() {
    // simply set your global array = []
    // nothing to return
    globalResults = [];
}


async function addResult(title, snippet, url) {
    let [original, stemmed] = await fetch("/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({"data": (title + " " + snippet).replace(/[0-9]/g, "")})
    })
    .then(response => response.json());

    globalResults.push({
        "title": title,
        "snippet": snippet,
        "url": url,
        "original": original,
        "frequency": getLocalFrequencyTable(stemmed),
    });
}

function getResults(selectedWords) {
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
        return [array, selectedFreqArr];
    }
}

// not needed, already done in app.js
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

function getLocalFrequencyTable(data) {
    let frequencyTable = new Map();

    data.forEach(element => {
        if (frequencyTable.has(element)) {
            frequencyTable.set(element, frequencyTable.get(element) + 1);
        }
        else {
            frequencyTable.set(element, 1);
        }
    })
    
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
        for(let tupleWord of element.frequency){
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