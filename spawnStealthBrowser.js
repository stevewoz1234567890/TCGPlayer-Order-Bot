//include requirements
const puppeteer = require('puppeteer-extra')
var fs = require('fs')
var request = require('request');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// define paths
const downloadPath = path.resolve('./download');

// define chrome location for detection evasion
const chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin())


// helper functions

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}


function spawnReusableBrowser()
{
  process.stdout.write('spawnReusableBrowser() called');

  puppeteer.launch({ headless: false, executablePath: chromeExecutablePath}).then(async reuse_browser => {
    const page = await reuse_browser.newPage()

    process.stdout.write("TCGPlayer Order Retriever Bot 0.1\n"); 

    var browserWSEndpoint = reuse_browser.wsEndpoint();
    console.log('browserWSEndpoint: ' + browserWSEndpoint); // prints: ws://127.0.0.1:51945/devtools/browser/6462daeb-469b-4ae4-bfd1-c3bd2f26aa5e

    console.log("Browser started ... waiting")
    //browser.close()
    })
}


// ----------------- MAIN LOOP -------------------------

//define the browser scope
let browser;

spawnReusableBrowser()