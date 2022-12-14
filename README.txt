This project is built with Javascript and Node.
So it is required to install node and npm to run this project.

1. Install latest node.js (https://nodejs.org/en/download/)
    In terminal, type "node" and "npm" to see it works correctly

2. Get into the folder "WordBars" which contains "app.js" and "package.json"
    In terminal, type "cd WordBars" and do "ls" to see if you are there

3. Install packages
    In terminal, type "npm i"

4. Run the project and it will host on port 3030
    In terminal, type "node app.js"

5. If you see "Host at: http://localhost:3030", you can now access the application!



Some problems you may ecounter (in case):

--- The server port 3030 was used
    You need to maually change the port in app.js on line 110

--- No Internet permission
    You PC will asks you to give permission of network usage.
    Simply click YES, and it won't prompt for next time.

--- Searching stuck on "fetching results from BING", or show "API reaches limit
    This is the only thing we don't want you to ecounter,
    because this has no way to fix it since this is the limit from Bing API.
    Although you can still use the client files to simulate a search.
    This can be done by changing file "public/js/script.js"
    on line 14, and change "true" to "false".
    This allows the application to load pre-store results from folder "saved"

--- No file permission
    This is because it sometimes load client files.
    We don't expect thi to happen since your environment
    should allow for reading and writing files.

