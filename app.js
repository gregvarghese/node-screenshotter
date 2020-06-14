const fs = require('fs');
const path = require('path');
const puppeteer = require("puppeteer");
const readline = require("readline");
const sharp = require('sharp');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("What is the root folder path of the Veeva project? \n", function (name) {
    fs.access(name, function (error) {

        if (error) {
            console.log("Directory does not exist.")
        } else {
            dirs = getDirectories(name);

            Object.keys(dirs).forEach(function (key) {
                var folderName = require('path').basename(val);
                var val = dirs[key];
                filename = val + '/' + folderName + '.html';
                fs.readFile(filename, 'utf8', function (err, data) {
                    
                    getScreenshot(filename, val + "/" + folderName + ".jpg", val + "/" + folderName + "_thumb.jpg");
                });
            });
        }
    });
});

function flatten(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .map(file => path.join(srcpath, file))
        .filter(path => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
    return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}

function getScreenshot(path, output, thumb) {
    const run = async () => {
        // open the browser and prepare a page
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        // set the size of the viewport, so our screenshot will have the desired size
        await page.setViewport({
            width: 1024,
            height: 768
        })

        await page.goto('file://' + path, {waitUntil: 'domcontentloaded'})
        await page.screenshot({
            path: output,
            fullPage: false
        }).then((result) => {
            sharp(output)
            .resize(200,150)
            .toFile(thumb);
        });

        console.log("Screenshot saved to " + output);

        // close the browser 
        await browser.close();

    };

    // run the async function
    run();
}