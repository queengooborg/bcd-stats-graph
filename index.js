'use strict';
require('dotenv').config();

var fs = require('fs');
var plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_APIKEY);
const bcd = require('mdn-browser-compat-data');

const stats_data = require("./bcd-stats.json");

const browsers = ['chrome', 'chrome_android', 'edge', 'firefox', 'ie', 'safari', 'safari_ios', 'webview_android'];

function getNewStats() {
	let stats = {};
	browsers.forEach(browser => {
		stats[browser] = { all: 0, true: 0, null: 0, real: 0 }
	});

	const checkSupport = (supportData, type) => {
		if (!Array.isArray(supportData)) {
			supportData = [supportData];
		}
		return supportData.some(item => item.version_added === type || item.version_removed === type)
	};

	const processData = (data) => {
		if (data.support) {
			browsers.forEach(function(browser) {
				stats[browser].all++;
				let real_value = true;
				if (!data.support[browser]) {
					stats[browser].null++;
					real_value = false;
				} else {
					if (checkSupport(data.support[browser], null)) {
						stats[browser].null++;
						real_value = false;
					}
					if (checkSupport(data.support[browser], true)) {
						stats[browser].true++;
						real_value = false;
					}
				}
				if (real_value) {
					stats[browser].real++;
				}
			});
		}
	};

	const iterateData = (data) => {
		for (let key in data) {
			if (key === '__compat') {
				processData(data[key]);
			} else {
				iterateData(data[key]);
			}
		}
	};

	for (let data in bcd) {
		if (!(data === 'browsers' || data === 'webextensions')) {
			iterateData(bcd[data]);
		}
	}

	stats_data[require('./node_modules/mdn-browser-compat-data/package.json').version] = stats;
}

function generateGraph(valueType) {
	if (!['real', 'true', 'null'].includes(valueType)) {
		console.log(`${valueType} is not a valid value type.  Must be "real", "true", or "null".`);
		return false;
	}

	var data = {};
	browsers.forEach(browser => {
		data[browser] = {x: [], y: [], text: [], name: browser, type: "bar"};
	});

	for (let version in stats_data) {
		for (let browser in stats_data[version]) {
			data[browser]['x'].push(version);
			data[browser]['y'].push(stats_data[version][browser][valueType]);
			data[browser]['text'].push(`${browser}: ${((stats_data[version][browser][valueType]/stats_data[version][browser]['all']) * 100).toFixed(2)}% of total`)
		};
	};

	var barData = [];
	for (let browser in data) {
		barData.push(data[browser]);
	}

	var graphLayout = {
		title: `MDN BCD: ${valueType} values`,
		xaxis: {title: "BCD Version"},
		yaxis: {title: "Number of Entries"},
		barmode: "stack"
	};

	var graphOptions = {layout: graphLayout, filename: `mdn-bcd-${valueType}`, fileopt: "overwrite"};
	plotly.plot(barData, graphOptions, function(err, msg) {
		if (err) console.error(msg);
		console.log(`${valueType}: ${msg.url}`);
	});
};

getNewStats();

generateGraph('real');
generateGraph('true');
generateGraph('null');

fs.writeFile("./bcd-stats.json", JSON.stringify(stats_data, null, 2), function (err) {
	if (err) return console.log(err);
});
