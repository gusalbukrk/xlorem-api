import express from 'express';
import xlorem from 'xlorem';

// must be polyfill instead of ponyfill
// because fetch will be used in imported module `xlorem`, not in this file
// `import 'cross-fetch';` won't work because it imports ponyfill 
import 'cross-fetch/dist/node-polyfill.js';

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

// NOTE: `query` parameter is required
// test: http://localhost:8888/?query=mad%20men
app.get('/', async (req, res) => {
  const obj = Object.entries(req.query.query ? req.query : req.body).reduce((acc, cur) => {
    const [ k, v ] = cur;
    
    if (k === 'requirements') return { ...v, ...acc };
    
    acc[k] = v;
    return acc;
  }, {});

  const article = await xlorem(
    obj.query,
    generateOptions({ ...obj, ...obj.requirements }),
  );

  res.status(200).json(article);
});

// parameter `query` is required
// test: http://localhost:8888/lord%20of%20the%20rings
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
