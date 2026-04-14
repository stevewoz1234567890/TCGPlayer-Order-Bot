const puppeteer = require('puppeteer-extra')
const path = require('path');
var fs = require('fs.extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
var request = require('request');
const download = require('image-downloader');

const inventoryDownloadPath = path.resolve('./inventory/export')
const inventoryPath = path.resolve('G:/Shared drives/TCGPlayer Axiom/inventory/export')
const queuePath = path.resolve('G:\\Shared drives\\TCGPlayer Axiom\\inventory\\queue')
const imageTempDownloadPath = path.resolve('C:\\Users\\ankur\\Documents\\GitHub\\tcgplayer-order-bot\\image_temp')


// helper functions
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}



function attachInventoryDownloadExportCSV(){

    process.stdout.write("attachInventoryDownloadExportCSV()")

    fs.watch(inventoryDownloadPath, (eventType, filename) => {
    
        if (eventType.toLowerCase() === "change".toLowerCase()) {
            if (filename.includes('crdownload')) {
                console.log (filename + ' is downloading but is incomplete ... bypassing')
            } else {
                console.log ("Inventory: " + filename + ' has completed download!')
                full_file_path = inventoryDownloadPath + '\\' + filename
    
                try {
                    //mv(full_file_path, inventoryPath + "\\export.csv");
                    process.stdout.write("File to move: " + full_file_path + "\n")

                    delay (5000)

                    fs.move (full_file_path, inventoryPath + "\\" + filename, function (err) {
                        if (err) { throw err; }
                        delay (5000)

                        process.stdout.write("Moved " + full_file_path + "to: " + inventoryPath + "\\" + filename);
                    });
                    
                    json_model = {
                        'file_name' : filename,
                    }

                    request.post(
                        'https://hook.integromat.com/8r890jtyvi49csvukluyunb2a35caydi',
                        { json: { json_model } },
                        function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log(body);
                            }
                        }
                    );
                            
                    } catch (err) {
                    console.error(err);
                    }
            }
        }
        }
    )}


async function importInventory(browser_ws, session_path)
{

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
  
    
    process.stdout.write("Importing inventory ...")
    const import_file_path = 'G:\\Shared drives\\TCGPlayer Axiom\\inventory\\import\\import.csv'
    
    const page = await browser.newPage()

    await page.goto('https://store.tcgplayer.com/admin/Pricing')

    await delay(2500);


    import_to_staged_xpath = '/html/body/div[4]/div/div[4]/div[2]/pricing-search/div[4]/pricing-actions/div[1]/div[1]/div/input[4]';
    const import_to_staged_elements = await page.$x(import_to_staged_xpath);
    await import_to_staged_elements[0].click()

    await delay (3000)

    upload_file_xpath = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div[1]/input';
    const upload_file_element = await page.$x(upload_file_xpath);
    await upload_file_element[0].uploadFile(import_file_path)

    await delay (3000)

    continue_button_xpath = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div[2]/input';
    const continue_button_elements = await page.$x(continue_button_xpath);
    await continue_button_elements[0].click()

    await delay (3000)

    continue_again_button_xpath = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div/input[2]';
    const continue_again_button_elements = await page.$x(continue_again_button_xpath);
    await continue_again_button_elements[0].click()


    await delay (3000)

    move_to_live_button = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-importer/div/div/div/input[3]';
    const move_to_live_elements = await page.$x(move_to_live_button);
    await move_to_live_elements[0].click()

    await delay (3000)
    confirm_move_to_live_button = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-move-to-live/div/div/div/input[2]';
    const confirm_move_to_live_elements = await page.$x(confirm_move_to_live_button);
    await confirm_move_to_live_elements[0].click()

    await delay (5000)
    close_button = '/html/body/div[4]/div/div[6]/pricing-dialog/div/div/div[2]/pricing-move-to-live/div/div/div[2]/input';
    const close_button_elements = await page.$x(close_button);
    await close_button_elements[0].click()  

    await delay(5000);

    page.close()
}

async function exportInventory(browser_ws, session_path) {

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

    await page.goto('https://store.tcgplayer.com/admin/Pricing')

    await delay(2500);

    const client = await page.target().createCDPSession();
    await client .send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: inventoryDownloadPath
    });

    // click export inventory
    const exportInventoryelements = await page.$x('/html/body/div[4]/div/div[4]/div[2]/pricing-search/div[4]/pricing-actions/div[1]/div[1]/div/input[1]');
    await exportInventoryelements[0].click()
    await delay(2500);

    process.stdout.write("Inventory downloaded\n");

    page.close()
    return true
}



//"product_code","price","quantity","title","sku","description","condition","photo_1","photo_2","photo_3","photo_4","cs_id","name","series"
async function queueInventory() {

    const {load} = require('csv-load-sync');
    const csv = load(queuePath + "\\queue.csv");
    // csv is an Array of objects

    let i = 0

    while (i < csv.length) {
        console.log(csv[i])
        await addItem(csv[i]['product_code'], csv[i]['price'], csv[i]['quantity'], csv[i]['title'], csv[i]['sku'], csv[i]['description'], csv[i]['condition'], csv[i]['photo_1'], csv[i]['photo_2'], csv[i]['photo_3'], csv[i]['photo_4'], csv[i]['cs_id'],csv[i]['name'],csv[i]['series'])
        i++
      }

      return csv
}

function downloadImage(image_url, dest_path) {
    
    options = {
        url: image_url,
        dest: dest_path,     // will be saved to /path/to/dest/photo.jpg
      };
    
      download.image(options)
      .then(({ filename }) => {
        console.log('Saved to', filename); // saved to /path/to/dest/photo.jpg
        return filename
      })
      .catch((err) => console.error(err));
}

async function addItem(product_code, price, quantity, title, sku, description, condition, photo_1, photo_2, photo_3, photo_4, cs_id, name, series)
{
    console.log("product_code: " + product_code)
    console.log("price: " + price)
    console.log("quantity: " + quantity)
    console.log("title: " + title)
    console.log("sku: " + sku)
    console.log("description: " + description)
    console.log("photo_1: " + photo_1)
    console.log("photo_2: " + photo_2)
    console.log("photo_3: " + photo_3)
    console.log("photo_4: " + photo_4)
    console.log("cs_id: " + cs_id)
    console.log("name: " + name)
    console.log("series: " + series)
    console.log('-----------------')
    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });
    
    const page = await browser.newPage()

    await page.goto('https://store.tcgplayer.com/admin/product/manage/' + product_code)

    await page.setViewport({
        width: 2000,
        height: 1024
      });
      

    await delay(2500);

    process.stdout.write("Adding item: " + sku + "\n");

    // click add item
    //add_item_xpath = '/html/body/div[4]/div/div[5]/em/div/div[1]/inventory-actions/div/input[1]' //alternate for click button
    add_item_xpath = '/html/body/div[4]/div/div[5]/div[2]/div[1]/inventory-actions/div/input[1]';
    const addItemElements = await page.$x(add_item_xpath);
    await addItemElements[0].click()
    await delay(2000);    


    // add condition
    // do a foil check

    if (name.includes("foil")) {
        condition = condition + " Foil"
    }


    condition_xpath = '/html/body/div[12]/div[2]/div[2]/div/p/select';
    const conditionElements = await page.$x(condition_xpath);
    await conditionElements[0].click()
    await page.keyboard.type(condition)
    await page.keyboard.press('Enter');
    await delay(1000);    


    // add price
    price_input_xpath = '/html/body/div[12]/div[2]/form/div/fieldset[1]/div[1]/input';
    const price_input_elements = await page.$x(price_input_xpath);
    await price_input_elements[0].click()
    await page.keyboard.type(price, {delay: 50})
    await delay(1000);


    // add quantity
    quantity_xpath = '/html/body/div[12]/div[2]/form/div/fieldset[1]/div[2]/input';
    const quantity_elements = await page.$x(quantity_xpath);
    await quantity_elements[0].click()
    await page.keyboard.type(quantity, {delay: 50})
    await delay(1000);


    // add title
    title_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[1]/input';
    const title_elements = await page.$x(title_xpath);
    await title_elements[0].click()
    await page.keyboard.type(title, {dleay:50 })
    await delay(1000);


    // upload first image
    if (photo_1) {
        photo1_path = imageTempDownloadPath + "\\1.jpg"
        downloadImage(photo_1, photo1_path)
        await delay(5000)
        photo1_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[2]/div/input'
        const photo1_element = await page.$x(photo1_xpath);
        await photo1_element[0].uploadFile(photo1_path)
        await delay(5000);
    }


    // upload second image
    if (photo_2) {
        photo2_path = imageTempDownloadPath + "\\2.jpg"
        downloadImage(photo_2, photo2_path)
        await delay(5000)
        photo2_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[3]/div/label[1]/input'
        const photo2_element = await page.$x(photo2_xpath);
        await photo2_element[0].uploadFile(photo2_path)
        await delay(5000);
    }



    // upload third image
    if (photo_3) {
        photo3_path = imageTempDownloadPath + "\\3.jpg"
        downloadImage(photo_3, photo3_path)
        await delay(5000)
        photo3_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[3]/div/label[1]/input'
        const photo3_element = await page.$x(photo3_xpath);
        await photo3_element[0].uploadFile(photo3_path)
        await delay(5000);
    }
    
    // upload fourth image
    if (photo_4) {
        photo4_path = imageTempDownloadPath + "\\4.jpg"
        downloadImage(photo_4, photo4_path)
        await delay(5000)
        photo4_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[3]/div/label[1]/input'
        const photo4_element = await page.$x(photo4_xpath);
        await photo4_element[0].uploadFile(photo4_path)
        await delay(5000);
    }
    
    // add description
    description_xpath = '/html/body/div[12]/div[2]/form/fieldset[2]/div[4]/div';
    const description_elements = await page.$x(description_xpath);
    await description_elements[0].click()
    await page.keyboard.type(description)
    await delay(2500);


    // click "Publish to Live inventory"
    publish_xpath = '/html/body/div[12]/div[3]/div/button[2]';
    const publish_elements = await page.$x(publish_xpath);
    await publish_elements[0].click()

    //hit integromat endpoint

    json_model = {
        'tcgplayer_id' : product_code,
        'price' : price,
        'sku': sku,
        'name' : name,
        'series' : series
    }

    request.post(
        'https://hook.integromat.com/t24v7h374y812kolo33asq4ti5i0k0od',
        { json: { json_model } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );

    process.stdout.write("Finished adding " + sku)
    
    fs.unlink(photo1_path, (err) => {
        if (err) {
          console.error(err)
          return
        }
      
        //file removed
      })

      fs.unlink(photo2_path, (err) => {
        if (err) {
          console.error(err)
          return
        }
      
        //file removed
      })

    await delay(5000);


    // hit integromat

    json_model = {
        'tcgplayer_id' : product_code,
        'price' : price,
        'quantity' : quantity,
        'title': title,
        'sku': sku,
        'description': description,
        'condition' : condition,
        'photo_1' : photo_1,
        'photo_2' : photo_2,
        'photo_3' : photo_3,
        'photo_4' : photo_4,
        'cs_id' : cs_id,
        'name' : name,
        'series' : series
    }

    request.post(
        'https://hook.integromat.com/t24v7h374y812kolo33asq4ti5i0k0od',
        { json: { json_model } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );

    page.close()
    return true
}

module.exports = { importInventory , exportInventory, attachInventoryDownloadExportCSV, queueInventory};