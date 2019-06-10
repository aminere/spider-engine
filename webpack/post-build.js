
const fs = require('fs');

exports.postBuild = (bundlePath) => {
    const orig = fs.readFileSync(bundlePath);
    const final = `
      if (typeof exports === 'undefined') { var exports = {}; }
      var spider = exports;${orig.toString()}
      `;
    fs.writeFileSync(bundlePath, final);
};
