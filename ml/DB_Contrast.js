require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const { CockroachDBAI, DataTypes } = require( "./CockroachDBAI" );

class AI extends CockroachDBAI {
    constructor() {
        super({
            R: DataTypes.FLOAT,
            G: DataTypes.FLOAT,
            B: DataTypes.FLOAT
        }, {
            Light: DataTypes.BOOLEAN
        }, "Contrast" );

        // Create model
        this.model = require( "../models/classify" ).create( 3, 1, [ 100, 100, 10 ] );
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
        await this.sync(); // Sync the DB
        await this.deleteAll(); // Clear everything

        // Load Basic Data
        await this.add([
            { R: 0, G: 0, B: 0, Light: 0 },
            { R: 1, G: 1, B: 1, Light: 1 },
        ]);
    }
    async test() {
        let results = [];
        let result = await this.predict( { R: 0, G: 0, B: 0 } );
        results.push( `{ R: 0, G: 0, B: 0 } -> ${result[ 0 ]}` );
        result = await this.predict( { R: 1, G: 1, B: 1 } );
        results.push( `{ R: 1, G: 1, B: 1 } -> ${result[ 0 ]}` );
        for( let i = 0; i < 10; i++ ) {
            const red = Math.random();
            const green = Math.random();
            const blue = Math.random();
            result = await this.predict( { R: red, G: green, B: blue } );
            results.push( `{ "R": ${red.toFixed( 3 )}, "G": ${green.toFixed( 3 )}, "B": ${blue.toFixed( 3 )} } -> ${result[ 0 ]}` );
        }
        return results;
    }
}

module.exports = {
    AI
};
