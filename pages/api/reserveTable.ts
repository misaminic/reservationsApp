import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { MongoClient } from 'mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await MongoClient.connect(process.env.MONGODB_URI);

  if (req.method === 'POST') {
    const oneReservation = req.body.state;
    console.log(oneReservation.tables, 'ovo je Reservation state');

    const db = client.db();

    try {
      await db.collection('reservations').findOneAndUpdate(
        { date: oneReservation.date },
        {
          $set: {
            date: oneReservation.date,
            tables: oneReservation.tables,
            kurac: oneReservation.kurac,
          },
        },
        { upsert: true, returnNewDocument: true }
      );
    } catch (e) {
      console.log(e);
    }

    res.status(201).json({ message: 'Data sent to the database' });
  }

  if (req.method === 'GET') {
    const db = client.db();

    const query = req.query;
    console.log(query.dateChosen, 'ovo je kveri');
    try {
      const documents = await db
        .collection('reservations')
        .findOne({ date: query.dateChosen });
      console.log(documents, 'ovo su documents');
      res.status(200).json({ reservations: documents });
    } catch (error) {
      console.log(error, 'error from get request');
    }
  }

  client.close();
}
export default handler;
