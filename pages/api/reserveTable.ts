import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { MongoClient } from 'mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  //@ts-ignore
  const client = await MongoClient.connect(process.env.MONGODB_URI);

  if (req.method === 'POST') {
    const oneReservation = req.body.state;
    //@ts-ignore
    const db = client.db();

    try {
      await db.collection('reservations').findOneAndUpdate(
        { date: oneReservation.date },
        {
          $set: {
            date: oneReservation.date,
            tables: oneReservation.tables,
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
    //@ts-ignore
    const db = client.db();
    const query = req.query;
    try {
      const documents = await db
        .collection('reservations')
        .findOne({ date: query.dateChosen });
      res.status(200).json({ reservations: documents });
    } catch (error) {
      console.log(error, 'error from get request');
    }
  }
  //@ts-ignore
  client.close();
}
export default handler;
