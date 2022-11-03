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

app.get("/fake", function (req, res) {
    res.send({
        "webPages": {
            "value": [
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
            ]
        }
    })
})

const port = 3030;
app.listen(port, function () {
    console.log("Host at: http://localhost:" + port);
});