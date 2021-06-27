require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const { CockroachDBAI, DataTypes } = require( "./CockroachDBAI" );

class AI extends CockroachDBAI {
    constructor() {
        super({
            A: DataTypes.BOOLEAN,
            B: DataTypes.BOOLEAN
        }, {
            Out: DataTypes.BOOLEAN
        }, "XOR" );

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
        await this.sync(); // Sync the DB
        await this.deleteAll(); // Clear everything

        // There are two ways to load the data into the DB:
        // --- Load via CSV data ---
        // await net.loadCSV( "data/xor.csv", {
        //     Output: "Out"
        // } );
        // --- Load from JSON object/data ---
        await this.add([
            { A: 0, B: 0, Out: 0 },
            { A: 0, B: 1, Out: 1 },
            { A: 1, B: 0, Out: 1 },
            { A: 1, B: 1, Out: 0 },
        ]);
    }
    async test() {
        let results = [];
        let result = await this.predict( { A: 0, B: 0 } );
        results.push( `{ A: 0, B: 0 } -> ${result[ 0 ]}` );
        result = await this.predict( { A: 0, B: 1 } );
        results.push( `{ A: 0, B: 1 } -> ${result[ 0 ]}` );
        result = await this.predict( { A: 1, B: 0 } );
        results.push( `{ A: 1, B: 0 } -> ${result[ 0 ]}` );
        result = await this.predict( { A: 1, B: 1 } );
        results.push( `{ A: 1, B: 1 } -> ${result[ 0 ]}` );
        return results;
    }
}

module.exports = {
    AI
};
