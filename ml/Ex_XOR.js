require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const { BaseAI } = require( "./BaseAI" );

class AI extends BaseAI {
    constructor() {
        super( "XOR" );

        // Create model
        this.model = require( "../models/classify" ).create( 2, 1, [ 100, 100, 10 ] );
        // this.model.summary(); // Print the model

        // Attempt to load a previously saved model
        this.load().then( r => {
            if( r.success ) {
                // Compile the model so it can be trained again
                require( "../models/classify" ).compile( this.model );
            }
        });
    }
    async initialize() {
        await this.deleteAll(); // Clear everything

        await this.add([
            { input: [ 0, 0 ], output: [ 0 ] },
            { input: [ 0, 1 ], output: [ 1 ] },
            { input: [ 1, 0 ], output: [ 1 ] },
            { input: [ 1, 1 ], output: [ 0 ] },
        ]);
    }
    async test() {
        let results = [];
        let result = await this.predict( [ 0, 0 ] );
        results.push( `[ 0, 0 ] -> ${result[ 0 ]}` );
        result = await this.predict( [ 0, 1 ] );
        results.push( `[ 0, 1 ] -> ${result[ 0 ]}` );
        result = await this.predict( [ 1, 0 ] );
        results.push( `[ 1, 0 ] -> ${result[ 0 ]}` );
        result = await this.predict( [ 1, 1 ] );
        results.push( `[ 1, 1 ] -> ${result[ 0 ]}` );
        return results;
    }
}

module.exports = {
    AI
};
