require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const fs = require( "fs" );
const _ = require( "lodash" );
const parse = require( "csv-parse/lib/sync" );
const utils = require( "../utils/useful" );
const { BaseAI } = require( "./BaseAI" );

const { Sequelize, Model, DataTypes } = require( "sequelize" );
const sequelize = new Sequelize( {
    dialect: "postgres",
    username: process.env.COCKROACHDB_USER,
    password: process.env.COCKROACHDB_PASS,
    host: process.env.COCKROACHDB_HOST,
    port: process.env.COCKROACHDB_PORT,
    database: process.env.COCKROACHDB_DATABASE,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync( process.env.COCKROACHDB_CERTIFICATE ).toString()
      },
    },
    logging: false
} );

class DBData extends Model {}

class CockroachDBAI extends BaseAI {
    constructor( inputSchema, outputSchema, name = "CockroachDB_AI" ) {
        super( name );
        this.name = name;
        this._inputKeys = Object.keys( inputSchema );
        this._outputKeys = Object.keys( outputSchema );
        this.schema = {};
        this._inputKeys.forEach( k => {
            this.schema[ k ] = inputSchema[ k ];
        });
        this._outputKeys.forEach( k => {
            this.schema[ k ] = outputSchema[ k ];
        });
        // Default parsers
        this.parseInput = ( x ) => {
            let input = [];
            this._inputKeys.forEach( k => {
                switch( this.schema[ k ] ) {
                case DataTypes.BOOLEAN:
                    input.push( x[ k ] ? 1 : 0 );
                    break;
                case DataTypes.FLOAT:
                    input.push( x[ k ] );
                    break;
                default:
                    throw "Unsupported DataType";
                }
            });
            return input;
        };
        this.parseOutput = ( x ) => {
            let output = [];
            this._outputKeys.forEach( k => {
                switch( this.schema[ k ] ) {
                case DataTypes.BOOLEAN:
                    output.push( x[ k ] ? 1 : 0 );
                    break;
                case DataTypes.FLOAT:
                    output.push( x[ k ] );
                    break;
                default:
                    throw "Unsupported DataType";
                }
            });
            return output;
        };
        DBData.init( this.schema, { sequelize, modelName: name });
    }
    async sync() {
        // Synchronize the DB schema
        await sequelize.sync( { force: true } );
    }
    async deleteAll() {
        // Clear the data
        await DBData.destroy({
            truncate: true
        });
    }
    async loadCSV( filename, keyMap = {} ) {
        // Load the CSV data into Cockroach DB
        const input = fs.readFileSync( filename );
        const records = parse( input, {
            columns: true,
            skip_empty_lines: true
        });
        // Map keys
        const keys = Object.keys( keyMap );
        for( let i = 0; i < records.length; i++ ) {
            keys.forEach( k => {
                if( records[ i ][ k ] ) {
                    records[ i ][ keyMap[ k ] ] = records[ i ][ k ];
                }
            });
        }
        // Filter for schema-matching columns
        const cols = Object.keys( this.schema );
        const filtered = records.map( x => _.pick( x, cols ) );
        return await DBData.bulkCreate( filtered );
    }
    async data() {
        const data = await DBData.findAll();
        return data;
    }
    async add( data ) {
        if( !utils.isArray( data ) ) {
            data = [ data ];
        }
        return await DBData.bulkCreate( data );
    }
    async train( { epochs = 100, shuffle = true } = {} ) {
        // Train model based on schema
        this.inputs = [];
        this.outputs = [];
        const data = await this.data();
        data.forEach( x => {
            this.inputs.push( this.parseInput( x ) );
            this.outputs.push( this.parseOutput( x ) );
        });

        // Train the NN
        let result = await this.model.fit(
            tf.tensor2d( this.inputs ),
            tf.tensor2d( this.outputs ), {
            epochs: epochs,
            shuffle: shuffle,
            callbacks: {
                onEpochEnd: ( epoch, logs ) => {
                    console.log( "Epoch #", epoch, logs );
                }
            }
        } );
        // Automatically save after training
        this.save();
        return result;
    }
    async predict( x ) {
        // Run model based on schema
        let input = this.parseInput( x );
        let result = this.model.predict( tf.tensor2d( [ input ] ) );
        return result.dataSync();
    }
}

module.exports = {
    CockroachDBAI,
    DBData,
    DataTypes
};
