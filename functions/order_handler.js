//include requirements
const puppeteer = require('puppeteer-extra')
const path = require('path');
var fs = require('fs')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fastCSV = require("fast-csv")
var request = require('request');

// helper functions
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}


const downloadPath = path.resolve('./download/orders');


async function tcgplayer_download_orders(browser_ws, session_path) {

    process.stdout.write("tcgplayer_download_orders called: " + browser_ws)

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

    await page.goto('https://store.tcgplayer.com/admin/orders/orderlist')


    
    const tcgplayer_all_open_orders_button = '/html/body/div[4]/div/div[4]/div/div[2]/div[1]/div[2]/div[2]/div[1]/button';
    const tcgplayer_select_all_button = '/html/body/div[4]/div/div[4]/div/span/div/div[3]/div/div[2]/table/thead/tr/th[1]/div/span[1]/div/label/span[1]';
    const tcgplayer_export_order_list_button = '/html/body/div[4]/div/div[4]/div/span/div/div[2]/div/div[2]/button';
    
    await delay(10000);


    // click all open orders button
    const all_open_orders_button_elements = await page.$x(tcgplayer_all_open_orders_button);
    await all_open_orders_button_elements[0].click()
    


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
    process.stdout.write("attachOrderDownloadHandler now listening in: " + downloadPath + "\n")

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




async function post_tracking_to_tcpglayer(order, tracking) {

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

    process.stdout.write("Sending tracking code")
    await delay(100);

    // click all open orders button
    const add_tracking_button = "/html/body/div[4]/div/div[4]/div[2]/div[1]/div[1]/div[2]/div[2]/div/div[1]/div/div/ul/li/a/span"
    const add_tracking_elements = await page.$x(add_tracking_button);
    await add_tracking_elements[0].click()
    await delay(2500);

    // keyboard in the tracking code
    tracking_input_xpath = '/html/body/div[4]/div/div[4]/div[2]/div[1]/div[1]/div[2]/div[2]/div[2]/div/div[2]/div[1]/input';
    const tracking_input_elements = await page.$x(tracking_input_xpath);
    await tracking_input_elements[0].click()
    await page.keyboard.type(tracking, {delay: 50})
    await delay(1000);


    // click save
    const save_xpath = "/html/body/div[4]/div/div[4]/div[2]/div[1]/div[1]/div[2]/div[2]/div[2]/div/div[2]/div[2]/input[1]"
    const save_elements = await page.$x(save_xpath);
    await save_elements[0].click()
    await delay(2500);
    
    return page.close()
}



module.exports = { tcgplayer_download_orders, attachOrderDownloadHandler, post_tracking_to_tcpglayer};