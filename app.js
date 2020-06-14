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
    
    name = name.replace(/(\s+)/g, '\\$1');

    console.log(name);

    fs.access(name, function (error) {

        if (error) {
            console.log('Directory '  +  name + '  does not exist.')
        } else {
            dirs = getDirectories(name);
            getScreenshot(dirs);
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

function getScreenshot(urls) {
    const run = async () => {
        // open the browser and prepare a page
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        // set the size of the viewport, so our screenshot will have the desired size
        await page.setViewport({
            width: 1024,
            height: 768
        })

        for (let i = 0; i < urls.length; i ++) {
            var val = urls[i];
            var folderName = require('path').basename(val);

            filename = val + '/' + folderName + '.html';  
            let full = val + "/" + folderName + "-full.jpg";
            let thumb = val + "/" + folderName + "-thumb.jpg";

            if (fs.existsSync(filename)) {
                console.log('Creating screenshot for ' + val);
                await page.goto('file://' + filename, {waitUntil: 'domcontentloaded'})
                await page.screenshot({
                    path: full,
                    fullPage: false
                })
                .then((result) => {
                    sharp(full)
                    .resize(200,150)
                    .toFile(thumb);
                });
        
                console.log("Screenshot saved to " + full + ' & ' + thumb);
            }
            else {
                console.log(filename + ' does not exist.');
            }
        };

        
        // close the browser 
        await browser.close();

    };

    // run the async function
    run();
}