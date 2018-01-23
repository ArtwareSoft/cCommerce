fs = require('fs');
http = require('http');
ps = require('process');
var child_process = require('child_process');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var command = 'node.exe ';

function getProcessArgument(argName) { // should remain at the beginning
  for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg.indexOf('-' + argName + ':') == 0) 
      return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');  // replacing ' to prevent sql injection;
    if (arg == '-' + argName) return true;
  }
  return '';
}

cmdAsPromise = cmd => new Promise( resolve =>
      child_process.exec(cmd,{maxBuffer: 512 * 1000000}, (error, stdout, stderr) => resolve(stdout) ));

var arena = require('../download/arena.js');
var arenaBase = `http://jbartdb.appspot.com/bart.php?op=proxy&url=https://www.gsmarena.com/`;
var arenaBase2 = `https://www.gsmarena.com/`;

function httpGet(url) {
  console.log('url',url);
  return new Promise(resolve=>
	http.get(arenaBase + url, res => {
	  res.setEncoding("utf8");
	  let body = "";
	  res.on("data", data => {
	    body += data;
	  });
	  res.on("end", () => {
//	  	console.log(body);
	    resolve(body);
	  });
	}));
}

var store = _ => fs.writeFileSync('download/arena.js','module.exports = '+ JSON.stringify(arena));

function brandRefs() {
	var tds = new JSDOM(''+fs.readFileSync('download/arena-brands')).window.document.querySelectorAll('.st-text td');
	return Array.from(tds).map(td=>td.querySelector('a').getAttribute('href'))
}

function brandProducts(html,url2) {
	var tds = new JSDOM(html).window.document.querySelectorAll('.makers li');
	var res = Array.from(tds).map(td=>td.querySelector('a').getAttribute('href'));
	console.log(url2,res);
	return res;
}

function moreBrandPages(html) {
	var items = new JSDOM(html).window.document.querySelectorAll('.nav-pages a');
	return Array.from(items).map(x=>x.getAttribute('href'))
}

function allBrandPages(brand) {
	return httpGet(brand)
		.then(html=>moreBrandPages(html))
		.then(more=>[brand].concat(more))
//		.then(x=>{console.log(x); return x})
}

function getUrls(startWith) {
	arena.urls = [];
	arena.urls2.slice(startWith||0).reduce((pr,url2) => pr
		.then(_=>httpGet(url2))
		.then(html=>brandProducts(html,url2))
		.then(products=>arena.urls = (arena.urls || []).concat(products))
	, Promise.resolve()).then(_=>store());
}

function delay(mSec) {
  return new Promise(resolve=>setTimeout(resolve,mSec))
}

function randomDelay() {
  return delay(0+Math.floor(Math.random() * 300))
}

function getProductContent(startFrom) {
	arena.urls.slice(startFrom).reduce((pr,url,index) => pr
			.then(randomDelay)
			.then(_=>console.log(index+startFrom,url))
			.then(_=> fs.existsSync(`download/arena/${url}`) ? '' : httpGet(url))
			.then(html=> html && fs.writeFileSync(`download/arena/${url}`.replace('*',''),html))
//			.then(spec => arena.specs = (arena.specs || []).concat([spec]))
		, Promise.resolve()).then(_=>store());
}

function parseProduct(html,i) {
	var doc = new JSDOM(html).window.document;
	var res = {
		hits: doc.querySelector('.help-popularity span') && Number(doc.querySelector('.help-popularity span').innerHTML.replace(/[^0-9]/g,'')),
		title: doc.querySelector('.specs-phone-name-title') && doc.querySelector('.specs-phone-name-title').innerHTML,
	};
	Array.from(doc.querySelectorAll('tr')).forEach(tr=> {
		var att = tr.querySelector('.ttl a') && tr.querySelector('.ttl a').innerHTML;
		if (att)
			res[att] = (tr.querySelector('.nfo a') && tr.querySelector('.nfo a').innerHTML) || tr.querySelector('.nfo').innerHTML
	});
	console.log(res.title);
	//var res = Array.from(tds).map(td=>td.querySelector('a').getAttribute('href'));
	//console.log(res.length);
	arena.products = arena.products || [];
	arena.products[i] = res;
	return res;
}

function parseProducts(startIndex) {
	Array.from(new Array(100).keys())
		.map(i=>parseProduct(fs.readFileSync(`download/arena/${arena.urls[startIndex+i]}`.replace('*','')), startIndex+i)) ;
	store();
}

if (getProcessArgument('getProductContent'))
	getProductContent(Number(getProcessArgument('getProductContent')));

if (getProcessArgument('getUrls'))
	getUrls(Number(getProcessArgument('getUrls')));

if (getProcessArgument('parseProducts'))
	parseProducts(Number(getProcessArgument('parseProducts')));

if (getProcessArgument('parseAllProducts'))
	Array.from(new Array(88).keys()).reduce((pr,i) => 
		pr.then(_ =>  { 
			console.log(i);
			return cmdAsPromise('node src\\arena-crawler.js -parseProducts:' + (i*100)) 
		}), Promise.resolve() );


//console.log(parseProduct(fs.readFileSync(`download/arena/0`)))

//setInterval(store, 10000);

