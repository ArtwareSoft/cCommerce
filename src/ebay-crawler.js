fs = require('fs');
http = require('http');
ps = require('process');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

require('../download/ebay-products.js');

var eBayProductsUrl = `http://open.api.ebay.com/shopping?callname=FindProducts&responseencoding=JSON&appid=Personal-test1-PRD-c5d7504c4-bb762876&siteid=0&version=967&CategoryID=9355&AvailableItemsOnly=true&MaxEntries=20&FindProductsRequest.ProductSort=Title&PageNumber=`;

function productsPage(index) {
  return new Promise(resolve=>
	http.get(eBayProductsUrl+index, res => {
	  res.setEncoding("utf8");
	  let body = "";
	  res.on("data", data => {
	    body += data;
	  });
	  res.on("end", () => {
	    fs.writeFileSync('c:/cCommerce/download/ebay-products-' + index,body)
	    resolve(body);
	  });
	}));
}

var proxy = ''; //`http://jbartdb.appspot.com/bart.php?op=proxy&url=`;
function httpGet(url) {
//  console.log('url',url);
  return new Promise(resolve=>
	http.get(proxy+url, res => {
	  res.setEncoding("utf8");
	  let body = "";
	  res.on("data", data => {
	    body += data;
	  });
	  res.on("end", () => {
//	  	console.log(proxy+url);
//	  	console.log(body);
	    resolve(body);
	  });
	}));
}

function delay(mSec) {
  return new Promise(resolve=>setTimeout(resolve,mSec))
}

function randomDelay() {
  return delay(600+Math.floor(Math.random() * 300))
}

function getAllProducts() {
	Array.from(new Array(3).keys()).reduce((pr,index) => pr
	//	.then(randomDelay)
		.then(_=>productsPage(index+1)) , Promise.resolve())
}

function concatProducts() {
	var products = [].concat.apply([],Array.from(new Array(500).keys()).map(index=>
		JSON.parse(''+fs.readFileSync('c:/cCommerce/download/ebay-products-' + (index+1))).Product) || [])
    fs.writeFileSync('c:/cCommerce/download/ebay-products.js','global.ebayProducts = '+ JSON.stringify(products))
}

function enrichProducts(indeces) {
//	return Array.from(new Array(toIndex).keys()).reduce((pr,index) => pr
	return indeces.reduce((pr,i) => pr
		.then(_=> httpGet(ebayProducts[i].DetailsURL))
//		.then(randomDelay)
		.then(details=>ebayProducts[i].details = parseDetails(details,i))
		, Promise.resolve() )
}

var toCheck = global.ebayProducts.map((x,i)=> x.ReviewCount > 1 && Object.getOwnPropertyNames(x.details).length == 0 ? i : 0)
	.filter(x=>x);
console.log(toCheck);

enrichProducts(toCheck).then(_=> fs.writeFileSync('c:/cCommerce/download/ebay-products.js','global.ebayProducts = '+ JSON.stringify(ebayProducts)))
	.then(_ => ps.exit(0))

setInterval(_=> 
	fs.writeFileSync('c:/cCommerce/download/ebay-products.js','global.ebayProducts = '+ JSON.stringify(ebayProducts)), 20000);

//enrichProducts()
function parseDetails(details,index) {
	var trs = new JSDOM(details).window.document.querySelectorAll("tr");
	var res = {};
	trs.forEach(tr=> {
			if (tr.querySelectorAll('td').length < 2) return;			
//		try {
			var prop = tr.querySelectorAll('td')[0].querySelector('font');
			var val = tr.querySelectorAll('td')[1].querySelector('font');
			if (prop && val && val && val.nodeType == 1 && val.firstChild.nodeType == 3)
				res[prop.innerHTML.trim()] = val && val.innerHTML.trim();
//		} catch (e) {}
	})
	console.log(index,res.Model + ' ' + res['Family Line'],ebayProducts[index].Title);
	return res;
}

//console.log(parseDetails(d1))