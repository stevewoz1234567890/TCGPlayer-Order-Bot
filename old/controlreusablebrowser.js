const puppeteer = require('puppeteer-extra')
const path = require('path');
const { parse } = require('path');
var request = require('request');
var fs = require('fs.extra')
const fastCSV = require("fast-csv")
var express = require('express')
var app = express();
const client = require('https')
const download = require('image-downloader');
//var mv = require ("mv")

// This triggers an order download
app.get('/tcgplayer/download_orders', function (req, res) {
    console.log("Got a GET request for downloading orders");
    tcgplayer_download_orders(tcgplayer_all_open_orders_button, tcgplayer_select_all_button, tcgplayer_export_order_list_button)
    res.send('Triggering order download');
});

// Download Inventory
app.get('/tcgplayer/export_inventory', function (req, res) {
    console.log("Exporting inventory");
    exportInventory()
    res.send('Exporting inventory');
});

// Login to TCGPlayer
app.get('/tcgplayer/login', function (req, res) {
    console.log("Logging in to TCGPlayer");
    tcgPlayerLogin(tcgplayer_login_url, signin_to_seller_xpath, tcgplayer_login, tcgplayer_password, remember_me_button_xpath, tcgplayer_login_button)
    res.send('Logging in to TCGPlayer');
});

// Queue inventory from CSV
app.get('/tcgplayer/queue_inventory', function (req, res) {
    console.log("Queueing inventory ...");
    queueInventory()
    res.send('Queueing inventory now ...');
});


// Load import.csv to TCGPlayer (output inventory from Purplemana)
app.get('/tcgplayer/import_inventory', function (req, res) {
    console.log("Importing inventory from Purplemana ...");
    importInventory()
    res.send('Importing inventory from Purplemana ...');
});


var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Purplemana TCGPlayer Bot listening at http://%s:%s", host, port)
})

    // define paths
const downloadPath = path.resolve('./download');
const inventoryDownloadPath = path.resolve('./inventory/export')
const queuePath = path.resolve('G:\\Shared drives\\TCGPlayer Axiom\\inventory\\queue')
const inventoryPath = path.resolve('G:/Shared drives/TCGPlayer Axiom/inventory/export')
const imageTempDownloadPath = path.resolve('C:\\Users\\ankur\\Documents\\GitHub\\tcgplayer_bot\\image_temp')



// define login and password
const tcgplayer_login = 'tcgplayer@purplemana.com'
const tcgplayer_password = 'Purplemana#1'

// define xpaths to clickable elements
const tcgplayer_login_url = 'https://store.tcgplayer.com/oauth/login?returnUrl=/admin/account/logon'
const signin_to_seller_xpath = '/html/body/header/div/div/div[2]/a';
const remember_me_button_xpath = '/html/body/div/div/main/div/div/div/div/div/form/div[4]/div/div/label';
const tcgplayer_login_button = '/html/body/div[1]/div/main/div/div/div/div/div/form/div[3]/button';
const tcgplayer_orders_button = '/html/body/header/div[3]/div[3]/nav/ul/li[4]/a/span';
const tcgplayer_all_open_orders_button = '/html/body/div[4]/div/div[4]/div/div[2]/div[1]/div[2]/div[2]/div[1]/button';
const tcgplayer_select_all_button = '/html/body/div[4]/div/div[4]/div/span/div/div[3]/div/div[2]/table/thead/tr/th[1]/div/span[1]/div/label/span[1]';
const tcgplayer_export_order_list_button = '/html/body/div[4]/div/div[4]/div/span/div/div[2]/div/div[2]/button';

browser_ws = 'ws://127.0.0.1:58841/devtools/browser/fb58fabf-f21a-46c4-9400-e370f72976f8';

// helper functions

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
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

async function importInventory()
{
    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });
    
    process.stdout.write("Importing inventory from Purplemana ...")
    const import_file_path = 'G:\\Shared drives\\TCGPlayer Axiom\\inventory\\import\\import.csv'
    
    const page = await browser.newPage()

    await page.goto('https://store.tcgplayer.com/admin/Pricing')

    await page.setViewport({
        width: 1900,
        height: 1600,
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

async function exportInventory() {

    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });
    
    const page = await browser.newPage()

    await page.goto('https://store.tcgplayer.com/admin/Pricing')

    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 1,
      });
      

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


async function tcgplayer_download_orders(tcgplayer_all_open_orders_button, tcgplayer_select_all_button, tcgplayer_export_order_list_button) {

    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });
    
    const page = await browser.newPage()
    //const page = browser.pages().then(allPages => allPages[0]);

    await page.goto('https://store.tcgplayer.com/admin/orders/orderlist')

    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 1,
      });

    // click all open orders button
    const all_open_ordres_button_elements = await page.$x(tcgplayer_all_open_orders_button);
    await all_open_ordres_button_elements[0].click()
    
    await delay(2500);


    // click select all button
    const select_all_button_elements = await page.$x(tcgplayer_select_all_button);
    await select_all_button_elements[0].click()
    
    await delay(3000);
    

    const client = await page.target().createCDPSession();
    await client .send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
    });

    // click export orders
    const export_orders_button_elements = await page.$x(tcgplayer_export_order_list_button);
    await export_orders_button_elements[0].click()
    await delay(2500);

    process.stdout.write("Downloaded\n"); 

    process.stdout.write("Finished download_orders()\n");
    page.close()
    return true
}

async function retrieve_order_details(order) {

    const browser = await puppeteer.connect({
        browserWSEndpoint: browser_ws,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ]     
    });

    const page = await browser.newPage()
    //const page = browser.pages().then(allPages => allPages[0]);

    await page.goto('https://store.tcgplayer.com/admin/orders/manageorder/' + order)

    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 1,
      });
      

    await delay (5000)

    process.stdout.write("Snarfing order")
    await delay(100);

    snarfed = [];

    const order_model = await page.evaluate(async () => {
        return[[JSON.stringify(model)]]
      });
    console.log(order_model)


    // post to integromat as fall back
    request.post(
        'https://hook.integromat.com/df19ufjsjs2y1mqii7glp4yeioktq0i4',
        { json: { order_model } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );

    return page.close()
}


function parseOrdersCSV(orders_csv_file) {
    console.log("parseOrdersCSV() called with file: " + orders_csv_file)

    const newCSVHeaders = ['order', 'buyer_name', 'order_date', 'channel', 'status', 'shipping_type', 'product_amt', 'shipping_amt', 'total_amt', 'buyer_paid']

    const options = {
        headers: newCSVHeaders,
        objectMode: true,
        delimiter: ",",
        quote: '"',
        renameHeaders: true,
        };
        
        const data = [];
        
        fs.createReadStream(orders_csv_file)
        .pipe(fastCSV.parse(options))
        .on("error", (error) => {
            console.log(error);
        })
        .on("data", (row) => {
            //console.log("Row: " + row)
            console.log("Order number: " + row.order);
            data.push(row);
            retrieve_order_details(row.order)
        })
        .on("end", (rowCount) => {
            console.log("Finished parsing " + rowCount + " rows")
            //console.log(data);
        });

    return data
}


function attachOrderDownloadHandler(){
fs.watch(downloadPath, (eventType, filename) => {

    if (eventType.toLowerCase() === "change".toLowerCase()) {
        if (filename.includes('crdownload')) {
            console.log (filename + ' is downloading but is incomplete ... bypassing')
        } else {
            console.log (filename + ' has completed download!')
            full_file_path = downloadPath + '\\' + filename

            try {
                const parsedOrders = parseOrdersCSV(full_file_path)
                console.log('parsedOrders: ' + parsedOrders)       
                } catch (err) {
                console.error(err);
                }
        }
    }
    }
)}

function attachInventoryDownloadExportCSV(){
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



    async function tcgPlayerLogin(tcgplayer_login_url, signin_to_seller_xpath, tcgplayer_login, tcgplayer_password, remember_me_button_xpath, tcgplayer_login_button) {

        const browser = await puppeteer.connect({
            browserWSEndpoint: browser_ws,
            args:[
                '--start-maximized' // you can also use '--start-fullscreen'
             ]     
        });
        
        const page = await browser.newPage()
        //const page = browser.pages().then(allPages => allPages[0]);
    
        await page.goto(tcgplayer_login_url)
    
        await page.setViewport({
            width: 1280,
            height: 1024,
            deviceScaleFactor: 1,
          });
          

    
        process.stdout.write("Logging in\n"); 
        // enter login and password

    
        await delay(2000);
        await page.type('input[name=Email]', tcgplayer_login, {delay: 100})
        await page.type('input[name=Password]', tcgplayer_password, {delay: 100})
        await delay(1000);
       
        // click the remeber me button
        const remember_me_button_elements = await page.$x(remember_me_button_xpath);
        await remember_me_button_elements[0].click()
    
        await delay(2500);
    
        // click the login button  
        const login_elements = await page.$x(tcgplayer_login_button);
        await delay(1500);
        await login_elements[0].click()
        
        process.stdout.write("Finished logging in to TCGPlayer()\n");

        await delay (5000)
        return true
    }


attachOrderDownloadHandler()
attachInventoryDownloadExportCSV()

//reuse_page = tcgPlayerLogin(tcgplayer_login_url, signin_to_seller_xpath, tcgplayer_login, tcgplayer_password, remember_me_button_xpath, tcgplayer_login_button, tcgplayer_orders_button, tcgplayer_all_open_orders_button, tcgplayer_select_all_button, tcgplayer_export_order_list_button)