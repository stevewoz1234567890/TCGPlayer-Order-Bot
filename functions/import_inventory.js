const puppeteer = require('puppeteer-extra')

async function importInventory()
{
    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });
    
    process.stdout.write("Importing inventory ...")
    const import_file_path = 'G:\\Shared drives\\TCGPlayer Axiom\\inventory\\import\\import.csv'
    
    const page = await browser.newPage()

    await page.goto('https://store.tcgplayer.com/admin/Pricing')

    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 1,
      });
      

    await delay(2500);


    import_to_staged_xpath = '/html/body/div[4]/div/div[4]/div[2]/pricing-search/div[4]/pricing-actions/div[1]/div[1]/div/input[4]';
    const import_to_staged_elements = await page.$x(import_to_staged_xpath);
    await import_to_staged_elements[0].click()

    await delay (3000)

    upload_file_xpath = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div[1]/input';
    const upload_file_element = await page.$x(upload_file_xpath);
    await upload_file_element[0].uploadFile(import_file_path)

    await delay (3000)

    continue_button_xpath = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div/input[2]';
    const continue_button_elements = await page.$x(continue_button_xpath);
    await continue_button_elements[0].click()

    await delay (3000)

    move_to_live_button = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div/input[3]';
    const move_to_live_elements = await page.$x(move_to_live_button);
    await move_to_live_elements[0].click()

    await delay (3000)
    confirm_move_to_live_button = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-move-to-live/div/div/div/input[2]';
    const confirm_move_to_live_elements = await page.$x(confirm_move_to_live_button);
    await confirm_move_to_live_elements[0].click()

    await delay(15000);

    page.close()
    return true

}

// add the code below
module.exports = { importInventory };