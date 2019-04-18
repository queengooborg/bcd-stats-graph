# bcd-stats-graph
Generate a graph of the real value statistics of [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data)

## Usage
This package depends on BCD (of course), as well as Plotly.  You will need an API key to run this program.  See [Plotly's Getting Started (Node.js) guide](https://plot.ly/nodejs/getting-started/).

Once you have your API key, make a `.env` file with the following:
```
PLOTLY_USERNAME={Your Username}
PLOTLY_APIKEY={Your API Key}
```

You can then run the following to get the most recent statistics and generate a graph:
```sh
npm update
node index.js
```