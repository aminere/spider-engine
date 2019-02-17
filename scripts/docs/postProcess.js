
const fs = require("fs");

const processFiles = (directoryPath, processFile) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        for (let f of files) {
            if (f.isFile()) {
                processFile(`${directoryPath}/${f.name}`);
            }
        }
    });
};

processFiles("./docs/build/html", filePath => {    
    if (filePath.endsWith("html")) {
        fs.readFile(filePath, (err, data) => {
            // replace http://api with /api
            // sphinx sadly doesn't support external links to local routes
            let apiIndex = data.indexOf("http://api");
            if (apiIndex > 0) {			
				console.log(`Fixing api link in ${filePath}`);
                data = `${data}`.replace(/http:\/\/api/g, "/api");
                fs.writeFile(filePath, data, (err) => {});
            }
        });
    }
});
