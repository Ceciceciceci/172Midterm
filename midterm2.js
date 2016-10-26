//Midterm CMPE 172
//Cecilia Tran

//*******************stuff needed
var repl = require('repl');
var underscore = require('underscore');
var sa = require('superagent');
var fs = require('fs');

//csv
var csvpart = require('fast-csv');

//currency exchange
var coinbaseurl = "https://api.coinbase.com/v1/currencies/exchange_rates";
var units = sa.get('https://api.coinbase.com/v1/currencies').set('Accept', 'application/json').end(
        function(error, response){
            units = response.body;
        });

//Prompt for REPL
var r = repl.start({
    prompt: 'Coinbase repl >> ',
    ignoreUndefined: true,
    eval: callbackFunc});


function callbackFunc(cmd, context, filename, callback){
    var cmds = cmd.split(' ');
    var args = cmds[0].trim().toUpperCase();
    switch(args) {
        case "ORDERS": ORDERS(); break;    
        case "BUY": BUY(cmds); break;
        case "SELL": SELL(cmds); break;
    }
    return;
}

// Get currency exchange ratio
function curexchange(amt, cur, type){
    var order = type + " " + amt + " " + cur + " ";
    sa.get(coinbaseurl).set('Accept', 'application/json').end(
        function(error, response){
            var jsonresp = response.body;
            
            //currency key check
            if (cur != null){
                var currency_btc = cur.toLowerCase() + "_to_btc";
                var btc_currency = "btc_to_" + cur.toLowerCase();
                
                var rate1 = getRate(jsonresp, currency_btc);             
                var rate2 = getRate(jsonresp, btc_currency);
                
                console.log("\n Bitcoin Rates at the moment: \n");
                console.log("\n "+ rate1 + "" + currency_btc + "-->" + rate2 + btc_currency + "\n");
                
            var output = " CURRENT ORDERS \n";    
            var orderdisplay = "Order to" + order + " worth of BTC queued @ " + rate1 + " " + "BTC/" + cur.toUpperCase() + " ("	+ rate2 + " BTC)\n"; 
		
		  anotherOrder(type, amt, cur);
          console.log(output);
		  console.log(orderdisplay);
            }
            
        });
        return ;
}
     
//Display Order

    
//Return value of the rate
function getRate(json, unit){
	return json[unit];
}

var orders = [];
function anotherOrder(amt, cur, type){
    var btctext = "BTC";
    if (cur != null){
        cur = type;
    } 
    
    var pushOrder = {
        'timestamp': new Date(),
        'type': type,
        'amt': amt,
        'cur': cur,
        'status': 'UNFILLED'
    }
    orders.push(pushOrder);
}

function validCurrency(amt, type, cur){
    console.log("Cur" + cur + "\n");
    var check = false;
    underscore.filter(units, function(error, index){
        if (units[index][1] === cur) {
            check = true;
            curexchange(amt, cur, type);
            return;
        }
    });
    
    //error check
    if (check === false){
        console.log("Order error: There's no BTC exchange rate for " + cur + "\n");
    }
    return;
}

//BUY
// args contains amount and currency
function BUY(args){
    var amt = args[1].trim();
    var type = args[0].trim().toUpperCase();
    //var cur= args[2].trim().toUpperCase();
    
    if (args[2] != null){
	var cur = args[2].trim().toUpperCase();
        validCurrency(amt, type, cur);
    }
    else if (args[2] == null){
        if (args[1] > 0){
            var orderDisplay = "Order to " + type + " " + amt + "BTC in queue\n";
            anotherOrder(amt, type, null);
            console.log(orderDisplay);
        }
        //if the order fails!! ,error msg, chef
        else{
            console.log("No Amount of Currency added. Please enter a number.");
        }
    }
    return;
}

//SELL
function SELL (args){
    var amt = args[1].trim();
    var type = args[0].trim().toUpperCase();
    //var cur= args[2].trim().toUpperCase();
 
    if (args[2] != null){
        var cur = args[2].trim().toUpperCase();
	validCurrency(amt, type, cur);
    }
    else if (args[2] == null){
        if (args[1] > 0){
            var orderDisplay = "Order to " + type + " " + amt + "BTC in queue\n";
            anotherOrder(type, amt, null);
            console.log(orderDisplay);
        }
        //if the order fails!! ,error msg, chef
        else{
            console.log("No Amount of Currency added. Please enter a number.");
        }
    }
    return;
    
}

//CVS and ORDERS
var csvfile = "orders.csv";
function ORDERS(args){
    var csvStream = csvpart.format({headers: true, quoteHeaders: true}),
        writeableStream = fs.createWriteStream(csvfile);
        writeableStream.on("finish", 
            function(){ console.log("Saved orders.")});
                csvStream.pipe(writeableStream);
                console.log("/n ALL ORDERS: /n");
                underscore.each(orders,
                    function(error, index){
                        order = orders[index];
                        orderDisplay = order.timestamp +  ": " + order.type + " " + order.amt + " || " + order.cur + ": " + order.status;
                    console.log(orderDisplay);
                    
                        csvStream.write({time: order.timestamp, type: order.type, type: order.type, cur: order.cur, status: order.status
                        
                        })
                    })
                csvStream.end();
    
}


