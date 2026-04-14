var fs = require('fs')
const session_path = './data_cache'
var express = require('express')
var app = express();

const inventory_handler = require("./functions/inventory_handler.js");
const order_handler = require("./functions/order_handler.js");

// handle arguments
// node index.js tcgplayer_login tcgplayer_password
const arguments = process.argv.slice(2);

tcgplayer_login = arguments[0];
tcgplayer_password = arguments[1];
const browser_lok_file = "browser.lok"


const sleep = async (milliseconds) => {
    process.stdout.write("Sleep called\n")
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}


function find_browser(lok_file) {
    //process.stdout.write("find_browser called\n")
    
    try {
        const data = fs.readFileSync(lok_file, 'utf8');
        process.stdout.write("Browser found: " + data);
        return(data)
    } catch (err) {
        process.stdout.write("Error reading browser file lok file: " + err);
    }
}

process.stdout.write("\n---------------------------------------------------\n"); 
process.stdout.write("Purplemana 2022:  TCGPlayer Order Bot 0.1\n"); 
process.stdout.write("---------------------------------------------------\n");

process.stdout.write("\n----Arguments-------");
process.stdout.write("\nArg 1: " + arguments[0]);
process.stdout.write("\nArg 2: " + arguments[1]);
process.stdout.write("\n--------------------");


// Login to TCGPlayer
app.get('/tcgplayer/login', function (req, res) {
    const login_handler = require("./functions/login_handler.js");
    console.log("Logging in to TCGPlayer");
    login_handler.tcgPlayerLogin(browser_ws, session_path, tcgplayer_login, tcgplayer_password)
    res.send('Logging in to TCGPlayer');
});

// This triggers an order download
app.get('/tcgplayer/download_orders', function (req, res) {
    console.log("Got a GET request for downloading orders");
    order_handler.attachOrderDownloadHandler()
    sleep (5000)
    order_handler.tcgplayer_download_orders(browser_ws, session_path)
    
    res.send('Triggering order download');
});

// Export Inventory
app.get('/tcgplayer/export_inventory', function (req, res) {
    console.log("Exporting inventory");
    inventory_handler.attachInventoryDownloadExportCSV()
    inventory_handler.exportInventory(browser_ws, session_path)
    res.send('Exporting inventory');
});

// Import Inventory
app.get('/tcgplayer/import_inventory', function (req, res) {
    console.log("Importing inventory");
    inventory_handler.importInventory(browser_ws, session_path)
    res.send('Importing inventory');
});


// Add tracking
app.get('/tcgplayer/add_tracking', function (req, res) {
    console.log("Sending tracking for order");
    order_id = req.query.order
    tracking_id = req.query.tracking
    res.send('Sending tracking for ' + order_id + ' with tracking ' + tracking_id);
    order_handler.post_tracking_to_tcpglayer(order_id, tracking_id)
    sleep (5000)
});




// Queue inventory from CSV
app.get('/tcgplayer/queue_inventory', function (req, res) {
    console.log("Queueing inventory ...");
    inventory_handler.queueInventory()
    res.send('Queueing inventory now ...');
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    browser_ws = find_browser(browser_lok_file)
    
    console.log("Purplemana TCGPlayer Order Bot listening at http://%s:%s", host, port)
})

// wrap main function in async
//(async () => {

//    browser_ws = find_browser(browser_lok_file)
    //process.stdout.write("\nbrowser_ws: " + browser_ws)

    //await sleep(2000)
    //await login_handler.tcgPlayerLogin(browser_ws, session_path, tcgplayer_login, tcgplayer_password)

    //await order_handler.attachOrderDownloadHandler()

    //await sleep (5000)
    //await order_handler.tcgplayer_download_orders(browser_ws, session_path)


//})();