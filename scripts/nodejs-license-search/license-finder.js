#!/usr/bin/env node

/*
 * license-finder.js
 *
 * Tries to files that look like licenses in a give Docker image,
 * given a search text $LICENSE_SEARCH_MUST_CONTAIN
 *
*/

const fs = require('fs');
const path = require('path');
const match = require(path.resolve(__dirname, './match.js'));

function *walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const pathToFile = path.join(dir, file);
        const fileStats = fs.statSync(pathToFile);
        if (fileStats.isDirectory()) {
            yield *walkSync(pathToFile);
        } else {
            yield {
                path: pathToFile,
                stats: fileStats,
            };
        }
    }
}

function isLicenseFilePath(filePath) {
    return filePath.match(/\/[^\/]*license[^\/]*$/i) &&
        (filePath.match(/node_modules/g) || []).length <= 1; // no modules of modules
}

function humanFileSize(bytes, si) {
    const thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function main() {
    const mustContainText = process.env.LICENSE_SEARCH_MUST_CONTAIN;
    const rootDir = process.cwd();
    const absolutePath = path.resolve(rootDir);
    for (const file of walkSync(absolutePath)) {
        if (isLicenseFilePath(file.path)) {
            if (mustContainText && !file.path.includes('/' + mustContainText + '/')) {
                continue;
            }
            fs.readFile(file.path, 'utf8', function(err, contents) {
                const type = match(contents);
                console.info(
                    humanFileSize(file.stats.size)
                    + ' ' + type
                    + ' ' + file.path);
                process.exit();
            });

        }
    }
}

main();
