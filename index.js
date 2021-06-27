require( "dotenv" ).config();

const fetch = require( "node-fetch" );
const fs = require( "fs" );

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const express = require( "express" );
const cookieParser = require( "cookie-parser" );
const compression = require( "compression" );
const helmet = require( "helmet" );
const cors = require( "cors" );
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use( cors() );
app.use( helmet() );
app.use( compression() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( cookieParser() );

// -- SET YOUR ML MODEL HERE --
const { AI } = require( "./ml/DB_Contrast" );
const net = new AI();
net.initialize(); // Note: This is an asynchronous function and can take some time to load

// -- EDIT ROUTES AND ACCESS HERE --
app.get( "/", async ( req, res ) => {
    res.json( net );
});

app.get( "/data", async ( req, res ) => {
    // Data
    res.json( await net.data() );
});
app.post( "/data", async ( req, res ) => {
    // Add to Data
    res.json( await net.add( req.body ) );
});

app.get( "/train", async ( req, res ) => {
    // Train
    res.json( await net.train() );
});

app.post( "/predict", async ( req, res ) => {
    // Predict
    res.json( await net.predict( req.body ) );
});

app.get( "/save", async ( req, res ) => {
    // Save
    res.json( await net.save() );
});

app.get( "/load", async ( req, res ) => {
    // Load
    res.json( await net.load() );
});

app.get( "/test", async ( req, res ) => {
    // Test
    res.json( await net.test() );
});

app.use( ( err, req, res, next ) => {
    console.error( err.stack );
    res.status( 500 ).send( "Server Error" );
})

app.listen( port, () => {
    console.log( `App listening at http://localhost:${port}` );
});
