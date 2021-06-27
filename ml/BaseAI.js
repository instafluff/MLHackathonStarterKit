require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const fs = require( "fs" );
const _ = require( "lodash" );
const parse = require( "csv-parse/lib/sync" );
const utils = require( "../utils/useful" );

class BaseAI {
    constructor( name = "Base_AI" ) {
        this.name = name;
        this.inputs = [];
        this.outputs = [];
    }
    async deleteAll() {
        // Clear the data
        this.inputs = [];
        this.outputs = [];
    }
    async data() {
        return {
            inputs: this.inputs,
            outputs: this.outputs
        };
    }
    async add( data ) {
        if( !utils.isArray( data ) ) {
            this.inputs.push( data.input );
            this.outputs.push( data.output );
        }
        else {
            data.forEach( x => {
                this.inputs.push( x.input );
                this.outputs.push( x.output );
            });
        }
    }
    async train( { epochs = 100, shuffle = true } = {} ) {
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
    async predict( input ) {
        // Run model
        let result = this.model.predict( tf.tensor2d( [ input ] ) );
        return result.dataSync();
    }
    async save() {
        return await this.model.save( `file://${__dirname}/${this.name}` );
    }
    async load() {
        if( fs.existsSync( `${__dirname}/${this.name}/model.json` ) ) {
            this.model = await tf.loadLayersModel( `file://${__dirname}/${this.name}/model.json` );
            return { success: 1 };
        }
        return { error: "No saved model" };
    }
}

module.exports = {
    BaseAI,
};
