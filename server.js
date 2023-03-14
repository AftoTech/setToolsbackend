const express = require("express");
const cors = require("cors");
const { parser } = require("html-metadata-parser");
const { stopWords } = require("./constant");
const NodeRakeV2 = require('node-rake-v2').NodeRakeV2;
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
  node_rake_v2.addStopWords(stopWords)

    try {
    const inputData = req.body;
      if (!inputData) throw new Error("No data provided");
        const keywords = node_rake_v2.generate(inputData.text);
      res.json(keywords)
    // // Do some processing with the input data
    
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
})

app.get("/message", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
