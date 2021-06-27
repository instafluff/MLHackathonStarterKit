require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

const { CockroachDBAI, DataTypes } = require( "./CockroachDBAI" );

const utils = require( "../utils/useful" );

class AI extends CockroachDBAI {
    constructor() {
        super({
            "SepalLength": DataTypes.FLOAT,
            "SepalWidth": DataTypes.FLOAT,
            "PetalLength": DataTypes.FLOAT,
            "PetalWidth": DataTypes.FLOAT
        }, {
            "Variety": DataTypes.STRING
        }, "Iris" );

        // Create model
        this.model = require( "../models/classify" ).create( 4, 3, [ 100, 100, 10 ] );
        // this.model.summary(); // Print the model

        // Attempt to load a previously saved model
        this.load().then( r => {
            if( r.success ) {
                // Compile the model so it can be trained again
                require( "../models/classify" ).compile( this.model );
            }
        });
        this.parseInput = ( x ) => {
            // Normalize the values by dividing by 10
            let input = [];
            this._inputKeys.forEach( k => {
                input.push( x[ k ] / 10 );
            });
            return input;
        };
        this.parseOutput = ( x ) => {
            // Convert to a one-hot vector
            switch( x[ "Variety" ] ) {
            case "Setosa":
                return [ 1, 0, 0 ];
            case "Versicolor":
                return [ 0, 1, 0 ];
            case "Virginica":
                return [ 0, 0, 1 ];
            default:
                return [ 0, 0, 0 ];
            }
        };
    }
    async initialize() {
        await this.sync(); // Sync the DB
        await this.deleteAll(); // Clear everything

        // --- Load via CSV data ---
        await this.loadCSV( "data/iris.csv" );
    }
    async test() {
        let results = [];
        const labels = [ "Setosa", "Versicolor", "Virginica" ];
        let result = await this.predict( {
            "SepalLength": 5.4,
            "SepalWidth": 3.9,
            "PetalLength": 1.7,
            "PetalWidth": .4,
            // "Variety": "Setosa"
        } );
        results.push( `Expected: Setosa, Predicted: ${utils.getOneHotLabel( result, labels )}` );

        result = await this.predict( {
            "SepalLength": 7,
            "SepalWidth": 3.2,
            "PetalLength": 4.7,
            "PetalWidth": 1.4,
            // "Variety": "Versicolor"
        } );
        results.push( `Expected: Versicolor, Predicted: ${utils.getOneHotLabel( result, labels )}` );

        result = await this.predict( {
            "SepalLength": 6.4,
            "SepalWidth": 2.7,
            "PetalLength": 5.3,
            "PetalWidth": 1.9,
            // "Variety": "Virginica"
        } );
        results.push( `Expected: Virginica, Predicted: ${utils.getOneHotLabel( result, labels )}` );
        return results;
    }
}

module.exports = {
    AI
};
