//include requirements
const puppeteer = require('puppeteer-extra')
var fs = require('fs')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin())


const sleep = async (milliseconds) => {
  process.stdout.write("Sleep called\n")
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function spawnReusableBrowser(chromeExecutablePath, session_path)
{
  process.stdout.write('spawnReusableBrowser() called\n');

  puppeteer.launch(
    { headless: false,
      executablePath: chromeExecutablePath,
      userDataDir: session_path
    }).then(async browser => {

    // now write the ID to file
    await fs.writeFileSync('browser.lok', browser.wsEndpoint());

    process.stdout.write("Browser created: " + browser.wsEndpoint() + "\n")

    return true
    })
}





module.exports = { spawnReusableBrowser, tcgPlayerLogin, openPage};