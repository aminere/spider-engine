
const fs = require("fs");

const directories = [
    "./docs/build/html",
    "./docs/build/html/2d",
    "./docs/build/html/3d",
    "./docs/build/html/behaviors"
];

const processFile = filePath => {
    if (!filePath.endsWith("html")) {
        return;
    }
    fs.readFile(filePath, (err, data) => {

        let modified = false;        
        // Make data a string to be able to use RegEx
        data = `${data}`;

        // replace http://api with /api
        // sphinx sadly doesn't support external links to local routes
        let apiLinks = data.match(/http:\/\/api/g);
        if (apiLinks) {			
            console.log(`Fixing api link in ${filePath}`);
            data = data.replace(new RegExp(apiLinks[0], "g"), "/api");
            modified = true;
        }
        
        // add rules="cols" frame="box" to tables
        // sphinx doesn't seem to support overriding table properties
        let tables = data.match(/<table border=\"1\"/g);
        if (tables) {
            console.log(`Fixing table format in ${filePath}`);
            data = data.replace(new RegExp(tables[0], "g"), `${tables[0]} rules="cols" frame="box"`);
            modified = true;
        }
        
        // Make external links open in a new window
        // There's gotta a better way to do this!!
        let externalLinks = data.match(/href=\"http[s]*:/g);
        if (externalLinks) {
            console.log(`Fixing external links in ${filePath}`);
            let uniques = externalLinks.reduce(
                (prev, cur) => {
                    if (prev.indexOf(cur) < 0) {
                        prev = prev.concat(cur);
                    }
                    return prev;
                },
                []
            );
            for (let e of uniques) {
                data = data.replace(new RegExp(e, "g"), `target="_blank" ${e}`);
            }  
            modified = true;          
        }

        if (modified) {
            fs.writeFile(filePath, data, (err) => {});
        }
    });
};

const processDirectory = directoryPath => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        for (let f of files) {
            if (f.isFile()) {
                processFile(`${directoryPath}/${f.name}`);
            }
        }
    });
};

directories.forEach(d => processDirectory(d));
