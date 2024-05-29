//include requirements
const puppeteer = require('puppeteer-extra')
var fs = require('fs')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const browser_lok_file = "browser.lok"


// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin())


const chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const session_path = './data_cache'


async function spawnReusableBrowser(chromeExecutablePath, session_path)
{
  process.stdout.write('spawnReusableBrowser() called\n');

  puppeteer.launch(
    { headless: false,
      executablePath: chromeExecutablePath,
      userDataDir: session_path,
      args: [`--window-size=1920,1080`],
      defaultViewport: {
        width:1920,
        height:1080
      }
    }).then(async browser => {

    // now write the ID to file
    await fs.writeFileSync('browser.lok', browser.wsEndpoint());

    process.stdout.write("Browser created: " + browser.wsEndpoint() + "\n")

    return true
    })
}


async function delete_browser_lok(lok_file) {

    process.stdout.write("delete_browser_lok(" + lok_file + ") called\n")

    try {
        fs.unlinkSync(browser_lok_file);
        process.stdout.write(browser_lok_file + " has been deleted\n\n")
        return true
    } catch (e) {
        //console.error(e)
        process.stdout.write("Unable to delete file (doesn't exist or missing permissions)\n")
        return false
    }

}


async function main() {
  await delete_browser_lok(browser_lok_file)
  await spawnReusableBrowser(chromeExecutablePath, session_path)
}

main()