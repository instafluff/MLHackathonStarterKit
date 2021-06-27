require( "dotenv" ).config();

// -- Set USE_GPU in .env you want to run GPU and have CUDA installed (Windows/Linux) --
const tf = process.env.USE_GPU ? require( "@tensorflow/tfjs-node-gpu" ) : require( "@tensorflow/tfjs-node" );

module.exports = {
    create: ( inputSize = 2, outputSize = 1, hiddenLayers = [ 100, 50, 25 ] ) => {
        const model = tf.sequential();
        model.add( tf.layers.dense( { inputShape: [ inputSize ], activation: "relu", units: hiddenLayers[ 0 ] } ) );
        // Add the rest of the layers
        for( let l = 1; l < hiddenLayers.length; l++ ) {
            model.add( tf.layers.dense( { activation: "relu", units: hiddenLayers[ l ] } ) );
        }
        model.add( tf.layers.dense( { units: outputSize } ) );
        model.compile({
            loss: "meanSquaredError",
            optimizer: "adam",
            metrics: [ "accuracy" ]
        });
        return model;
    },
    compile: ( model ) => {
        model.compile({
            loss: "meanSquaredError",
            optimizer: "adam",
            metrics: [ "accuracy" ]
        });
    }
}
