import express from 'express';
import xlorem from 'xlorem';

import './fetch-polyfill.js';

const app = express();

function generateOptions(input) {
  const { unit, quantity, format } = input;

  return {
    ...(unit !== undefined && { unit }),
    ...(quantity !== undefined && { quantity: Number(quantity) }),
    ...(format !== undefined && { format }),
  };
}

// input type must be path parameters or query strings; a mix of these two shouldn't be accepted
// make sure that is nothing inside `req.params`, otherwise throw error
app.get('/', async (req, res) => {
  const article = await xlorem(
    req.query.query,
    generateOptions(req.query),
  );

  res.status(200).json(article);
});

app.get('/:query/:unit?/:quantity?/:format?', async (req, res) => {
  const article = await xlorem(
    req.params.query,
    generateOptions(req.params)
  );

  res.status(200).json(article);
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}.`));
