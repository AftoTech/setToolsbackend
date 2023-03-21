const express = require("express");
const cors = require("cors");
const { parser } = require("html-metadata-parser");
const natural = require("natural");
const stopwords = require("stopwords").english;
const NodeRakeV2 = require("node-rake-v2").NodeRakeV2;
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

app.get("/message", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
