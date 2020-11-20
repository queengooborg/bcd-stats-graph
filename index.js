'use strict';

var fs = require('fs');
const bcd = require('@mdn/browser-compat-data');

const stats_data = require("./bcd-stats.json");

const browsers = ['chrome', 'chrome_android', 'edge', 'firefox', 'ie', 'safari', 'safari_ios', 'webview_android'];

function getNewStats() {
	let stats = { all: 0 };
	browsers.forEach(browser => {
		stats[browser] = { true: 0, null: 0, real: 0 }
	});

	const checkSupport = (supportData, type) => {
		if (!Array.isArray(supportData)) {
			supportData = [supportData];
		}
		return supportData.some(item => item.version_added === type || item.version_removed === type)
	};

	const processData = (data) => {
		if (data.support) {
			stats.all++;
			browsers.forEach(function(browser) {
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

	stats_data[require(require.resolve('@mdn/browser-compat-data/package.json')).version] = stats;
}

getNewStats();

fs.writeFile("./bcd-stats.json", JSON.stringify(stats_data, null, 2), function (err) {
	if (err) return console.log(err);
});
