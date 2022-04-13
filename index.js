import express from 'express';
import xlorem from 'xlorem';

import './fetch-polyfill.js';

const app = express();

app.use(express.json()) // for parsing body of type application/json

function generateOptions(input) {
  const { 
    unit,
    quantity,
    format,
    sentencesPerParagraphMin,
    sentencesPerParagraphMax,
    wordsPerSentenceMin,
    wordsPerSentenceMax
  } = input;
  
  return {
    ...(unit !== undefined && { unit }),
    ...(quantity !== undefined && { quantity: Number(quantity) }),
    ...(format !== undefined && { format }),
    requirements: Object.entries({
      ...(sentencesPerParagraphMin !== undefined && { sentencesPerParagraphMin }),
      ...(sentencesPerParagraphMax !== undefined && { sentencesPerParagraphMax }),
      ...(wordsPerSentenceMin !== undefined && { wordsPerSentenceMin }),
      ...(wordsPerSentenceMax !== undefined && { wordsPerSentenceMax }),
    }).reduce((acc, cur) => { acc[cur[0]] = Number(cur[1]); return acc; }, {}),
  };
}

// input type must be path parameters, query & body strings; a mix of these two shouldn't be accepted
// make sure that is nothing inside `req.params`, otherwise throw error

app.get('/', async (req, res) => {
  const obj = req.query.query ? req.query : req.body; // prefer `query` over `body`

  const article = await xlorem(
    obj.query,
    generateOptions(obj),
  );

  res.status(200).json(article);
});

app.get(
  '/:query/:unit?/:quantity?/:format?/:sentencesPerParagraphMin?/:sentencesPerParagraphMax?/:wordsPerSentenceMin?/:wordsPerSentenceMax?',
  async (req, res) => {
  const article = await xlorem(
    req.params.query,
    generateOptions(req.params)
  );

  res.status(200).json(article);
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}.`));
