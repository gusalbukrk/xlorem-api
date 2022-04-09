import express from 'express';
import xlorem from 'xlorem';

import './fetch-polyfill.js';

const app = express();

app.get('/:query/:unit?/:quantity?', async (req, res) => {
  const { query, unit, quantity } = req.params;

  const article = await xlorem(query, {
    // unit,
    // quantity: Number(quantity),

    ...(unit !== undefined && { unit }),
    ...(quantity !== undefined && { quantity: Number(quantity), }),
  });

  res.status(200).json(article);
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}.`));
