'use strict';

import fs from 'fs-extra';

import bcd from '@mdn/browser-compat-data';

const allbrowsers = ['chrome', 'chrome_android', 'edge', 'firefox', 'ie', 'safari', 'safari_ios', 'webview_android'];

const getStats = (bcd, browsers, folder) => {
	let stats = {all: 0};
	for (const browser of browsers) {
		stats[browser] = {true: 0, null: 0, real: 0};
	}

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

	if (folder) {
		iterateData(bcd[folder]);
	} else {
		for (let data in bcd) {
			if (!(data === 'browsers' || data === 'webextensions')) {
				iterateData(bcd[data]);
			}
		}
	}

	return stats;
}

const addStats = (stats, newStats, version) => {
	for (const [key, data] of Object.entries(newStats)) {
		if (key === 'all') {
			stats.all[version] = data;
			continue;
		}

		stats[key].true[version] = data.true;
		stats[key].null[version] = data.null;
		stats[key].real[version] = data.real;
	}

	return stats;
}

const main = async () => {
	const bcdversion = JSON.parse(await fs.readFile("./node_modules/@mdn/browser-compat-data/package.json")).version;
	
	const oldStats = JSON.parse(await fs.readFile("./bcd-stats.json"));
	const newStats = getStats(bcd, allbrowsers, '');
	const stats = addStats(oldStats, newStats, bcdversion);
	
	await fs.writeFile("./bcd-stats.json", JSON.stringify(stats));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export default getStats;
