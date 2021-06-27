# MLHackathonStarterKit
Hackathon Starter Kit for Machine Learning and Data-Focused Projects

This is a boilerplate starter kit designed to let you easily create and iterate on TensorFlow projects with JavaScript and Node.js. It is set up to connect to [CockroachDB](https://www.cockroachlabs.com/) so that the data can be easily viewed, cleaned, queried using existing SQL tools and then used for training the AI.

## Technologies Used
- [Node.js](http://nodejs.org/) - The main server for the project
- [Express](https://expressjs.com/) - For the backend APIs
- [React.js](https://reactjs.org/) - Used for the frontend app
- [CockroachDB/CockroachCloud](https://www.cockroachlabs.com/) - Stores the ML training data
- [Sequelize](https://sequelize.org/) - ODM to connect to CockroachDB
- [TensorFlow.js](https://www.tensorflow.org/js/) - The machine learning library

## Components
- **app** - Contains the entire frontend application. You can edit src/App.js to update the starter client app, which provides an interface to control the server and to add data to the set.
- **data** - Sample CSV datasets that are used by the example ML models for seed data
- **ml** - Code for defining, training, and running your AI. The DB_*.js files are model examples that demonstrate how to easily import data into CockroachDB and can be used as reference templates for new projects. Ex_XOR.js is a basic model if your project does not require much data.
- **models** - Contains the TensorFlow model factory, currently just for a classification model.
- **utils** - Some useful basic utility functions
- **index.js** - The main server code with the AI model instance and routes. You will want to edit this.

## Getting Started
1. Clone or download the repository
2. Run `npm install`
3. Setup [CockroachDB/CockroachCloud](https://www.cockroachlabs.com/get-started-cockroachdb/) for free and download the **cc-ca.crt** file to the project folder
4. Create a **.env** file that looks a bit like this:
```
COCKROACHDB_USER=instafluff
COCKROACHDB_PASS=z6NShLj3ux
COCKROACHDB_HOST=free-tier4.aws-us-west-2.cockroachlabs.cloud
COCKROACHDB_PORT=26257
COCKROACHDB_DATABASE=instafluff-288.defaultdb
COCKROACHDB_CERTIFICATE=cc-ca.crt
```
5. Run the server with `node index.js`
6. Run the client app inside the **app** directory with `npm start`
