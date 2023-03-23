const express = require("express");
const cors = require("cors");
const { parser } = require("html-metadata-parser");
const natural = require("natural");
const google = require('googlethis');
const stopwords = require("stopwords").english;
const NodeRakeV2 = require("node-rake-v2").NodeRakeV2;
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const app = express();
app.use(cors());
app.use(express.json());

// Define the POST endpoint
app.post("/metatagextract", (req, res) => {
  try {
    const inputData = req.body;
    if (!inputData) throw new Error("No data provided");
    // Do some processing with the input data
    parser(inputData?.url).then((result) => {
      res.json(result, null, 3);
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});
// keywordExtractor
app.post("/keywordExtractor", (req, res) => {
  const node_rake_v2 = new NodeRakeV2();
  node_rake_v2.addStopWords(stopwords);

  try {
    const inputData = req.body;
    if (!inputData) throw new Error("No data provided");
    const keywords = node_rake_v2.generate(inputData.text);
    res.json(keywords);
    // // Do some processing with the input data
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});

// KeyWordDesityChecker

app.post("/keywordDensityChecker", (req, res) => {
  try {
     const inputData = req.body;
    // Remove stop words
      const words = inputData.text.toLowerCase().split(' ').filter(word => !stopwords.includes(word));

  // Split into one, two, and three-word phrases
  const onePhrases = words.map(word => [word]);
  const twoPhrases = [];
  const threePhrases = [];

  for (let i = 0; i < words.length - 1; i++) {
    twoPhrases.push([words[i], words[i + 1]]);

    if (i < words.length - 2) {
      threePhrases.push([words[i], words[i + 1], words[i + 2]]);
    }
  }

  // Get frequency count for each phrase
  const phraseCounts = {};

  onePhrases.forEach(phrase => {
    const phraseStr = phrase.join(' ');
    phraseCounts[phraseStr] = (phraseCounts[phraseStr] || 0) + 1;
  });

  twoPhrases.forEach(phrase => {
    const phraseStr = phrase.join(' ');
    phraseCounts[phraseStr] = (phraseCounts[phraseStr] || 0) + 1;
  });

  threePhrases.forEach(phrase => {
    const phraseStr = phrase.join(' ');
    phraseCounts[phraseStr] = (phraseCounts[phraseStr] || 0) + 1;
  });

  // Get top 10 keywords
  const sortedPhrases = Object.keys(phraseCounts).sort((a, b) => phraseCounts[b] - phraseCounts[a]);
    const topPhrases = sortedPhrases.slice(0, 10);
    
    const Objectvalue = {
      "onePhrases": onePhrases,
      "twoPhrases": twoPhrases,
      "threePhrases": threePhrases,
      "topKeywords": topPhrases,
     }
    let strigit = JSON.stringify(Objectvalue)
    res.json(strigit)
  } catch (error) {
    res.json(error)
  }
});

// KeywordCompetitorAnalysis

app.post("/KeywordCompetitorAnalysis", (req, res) => {
  try {
    const inputData = req.body;
    if (!inputData) throw new Error("No data provided");
   const options = {
  page: 0, 
  safe: false, // Safe Search
  parse_ads: false, // If set to true sponsored results will be parsed
  additional_params: { 
    // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    hl: 'en' 
  }
   }
    google.search(inputData.text, options).then((response) => {
      res.json(JSON.stringify(response))
    });
   
    // // Do some processing with the input data
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post("/BacklinkChecker", (req, res) => {
  try {
    const inputData = req.body;
    let url = inputData.text
    if (!inputData) throw new Error("No data provided");
    const baseUrl = 'https://www.google.com/search?q=';
  const query = 'link:' + url;
  const urls = [];

  // Generate URLs for first 10 pages of Google search results
  for (let i = 0; i < 10; i++) {
    urls.push(baseUrl + query + '&start=' + i * 10);
  }

  // Send HTTP requests to Google search result pages in parallel
  async.mapLimit(urls, 5, function(url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        callback(error);
        return;
      }

      // Parse HTML content using Cheerio
      let $ = cheerio.load(body);

      // Find all links on page
      $('a').each(function() {
        let link = $(this).attr('href');

        // Check if link is an external backlink to target URL
        if (link && link.includes('://') && link.includes(url)) {
          console.log(link + ' is an external backlink to ' + url);
        }
      });

      callback(null);
    });
  }, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      console.log('Finished checking backlinks for ' + url);
    }
  });
   
   
    // // Do some processing with the input data
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});



app.get("/message", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
