const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wear
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.mh2ii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("getAway");
        const toursCollection = database.collection('tours');
        const bookCollection = database.collection('bookTour');

        // GET api
        app.get('/tours', async(req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours)
        });

        // GET single tour
        app.get('/tours/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const tour = await toursCollection.findOne(query);
            res.json(tour);
        });

        // POST api
        app.post('/tours', async (req, res) => {
            const tour = req.body;
            // console.log('hit the post api', tour);

            const result = await toursCollection.insertOne(tour);
            // console.log(result);
            res.json(result);
            // res.send('post hited');
        });

        // ADD order
        app.post('/bookTour', async(req, res) => {
            const book = req.body;
            const result = await bookCollection.insertOne(book);
            res.json(result);
        });

        // GET orders
        app.get('/myOrders/:email', async(req, res) => {
            const myBook = req.params.email;
            const result = await bookCollection.find({email: myBook}).toArray();
            res.json(result);
        });

        // DELETE api
        app.delete('/myOrders/:email/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await bookCollection.deleteOne(query);

            // console.log('delete item',id);
            res.json(result)
        })
        
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running GetAway Server');
});

app.listen(port, () => {
    console.log('Running GetAway server on port', port);
});