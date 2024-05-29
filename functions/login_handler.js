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


async function tcgPlayerLogin(browser_ws, session_path, tcgplayer_login, tcgplayer_password) {

  // define xpaths to clickable elements
  const tcgplayer_login_url = 'https://store.tcgplayer.com/oauth/login?returnUrl=/admin/account/logon'
  const signin_to_seller_xpath = '/html/body/header/div/div/div[2]/a';
  const remember_me_button_xpath = '/html/body/div/div/main/div/div/div/div/div/form/div[4]/div/div/label';
  const tcgplayer_login_button = '/html/body/div[1]/div/main/div/div/div/div/div/form/div[3]/button';
  const email_input_field = '/html/body/div[1]/div/main/div/div/div/div/div/form/div[1]/div/div/div/div/input';
  const password_input_field = '/html/body/div[1]/div/main/div/div/div/div/div/form/div[2]/div/div/div/div/input';

  const browser = await puppeteer.connect({
    browserWSEndpoint: browser_ws,
    defaultViewPort: null,
    userDataDir: session_path,
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width:1920,
      height:1080
    }  
  });

  const page = await browser.newPage()

  await page.goto(tcgplayer_login_url)

  process.stdout.write("Logging in\n"); 
  process.stdout.write("tcgplayer_login: " + tcgplayer_login + "\n");
  process.stdout.write("tcgplayer_password: " + tcgplayer_password + "\n"); 
  // enter login and password


  await sleep(5000);


  await page.type('input[name=Email]', tcgplayer_login, {delay: 100})
  await sleep(2000);
  await page.type('input[name=Password]', tcgplayer_password, {delay: 100})
  await sleep(1000);
 
  // click the remeber me button
  const remember_me_button_elements = await page.$x(remember_me_button_xpath);
  await remember_me_button_elements[0].click()

  await sleep(2500);

  // click the login button  
  const login_elements = await page.$x(tcgplayer_login_button);
  await sleep(1500);
  await login_elements[0].click()
  
  process.stdout.write("Finished logging in to TCGPlayer()\n");

  await sleep (5000)

  await page.close()
}



async function openPage(browser_ws, url) {
  const browser = await puppeteer.connect({ browserWSEndpoint: browser_ws, defaultViewPort: null });
  const page = await browser.newPage()
  await page.goto(url)
  sleep(20000)
}



module.exports = { tcgPlayerLogin, openPage};