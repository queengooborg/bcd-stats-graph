'use strict';

var fs = require('fs');
const bcd = require('@mdn/browser-compat-data');
const bcdversion = require(require.resolve('@mdn/browser-compat-data/package.json')).version;

const stats = require("./bcd-stats.json");

const browsers = ['chrome', 'chrome_android', 'edge', 'firefox', 'ie', 'safari', 'safari_ios', 'webview_android'];

const getNewStats = () => {
	// Reset stats
	stats.all[bcdversion] = 0;
	for (const browser of browsers) {
		stats[browser].true[bcdversion] = 0;
		stats[browser].null[bcdversion] = 0;
		stats[browser].real[bcdversion] = 0;
	}

	const checkSupport = (supportData, type) => {
		if (!Array.isArray(supportData)) {
			supportData = [supportData];
		}
		return supportData.some(item => item.version_added === type || item.version_removed === type)
	};

	const processData = (data) => {
		if (data.support) {
			stats.all[bcdversion]++;
			browsers.forEach(function(browser) {
				let real_value = true;
				if (!data.support[browser]) {
					stats[browser].null[bcdversion]++;
					real_value = false;
				} else {
					if (checkSupport(data.support[browser], null)) {
						stats[browser].null[bcdversion]++;
						real_value = false;
					}
					if (checkSupport(data.support[browser], true)) {
						stats[browser].true[bcdversion]++;
						real_value = false;
					}
				}
				if (real_value) {
					stats[browser].real[bcdversion]++;
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
}

getNewStats();

fs.writeFile("./bcd-stats.json", JSON.stringify(stats, null, 2), function (err) {
	if (err) return console.log(err);
});
