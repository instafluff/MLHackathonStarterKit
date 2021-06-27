import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';

const baseUrl = "http://localhost:4000";

function ignoreSubmit( event ) {
    event.preventDefault();
}

function App() {
    const [modelName, setModelName] = useState('');
    const [outputText, setOutputText] = useState('');
    const [inputText, setInputText] = useState('');
    const [dataText, setDataText] = useState('');
    let appStyle = {
        backgroundColor: "rgb(0, 0, 0)"
    };

    fetch( `${baseUrl}/` ).then( r => r.json() ).then( info => {
        setModelName( info.name );
    });

    const mlTest = async () => {
        let result = await fetch( `${baseUrl}/test` ).then( r => r.json() );
        setOutputText( result.join( "\n" ) );
    };

    const mlTrain = async () => {
        let result = await fetch( `${baseUrl}/train` ).then( r => r.json() );
        setOutputText( JSON.stringify( result, null, 2 ) );
    };

    const mlColor = async () => {
        const red = Math.random();
        const green = Math.random();
        const blue = Math.random();
        document.body.style.backgroundColor = `rgb(${red * 255}, ${green * 255}, ${blue * 255})`;
        setInputText( `{ "R": ${red.toFixed( 3 )}, "G": ${green.toFixed( 3 )}, "B": ${blue.toFixed( 3 )} }` );
        let result = await fetch( `${baseUrl}/predict`, {
            method: "POST",
            body: inputText,
            headers: {
                "Content-Type": "application/json"
            }
        } ).then( r => r.json() );
        setDataText( `{ "Light": ${result > 0.5 ? 1 : 0}, "R": ${red.toFixed( 3 )}, "G": ${green.toFixed( 3 )}, "B": ${blue.toFixed( 3 )} }` );
    };

    const mlPredict = async () => {
        let result = await fetch( `${baseUrl}/predict`, {
            method: "POST",
            body: inputText,
            headers: {
                "Content-Type": "application/json"
            }
        } ).then( r => r.json() );
        setOutputText( JSON.stringify( result, null, 2 ) );
    };

    const mlAddData = async () => {
        let result = await fetch( `${baseUrl}/data`, {
            method: "POST",
            body: dataText,
            headers: {
                "Content-Type": "application/json"
            }
        } ).then( r => r.json() );
        setOutputText( JSON.stringify( result, null, 2 ) );
    };

    const handleInputChange = e => {
        setInputText( e.target.value );
    };

    const handleDataChange = e => {
        setDataText( e.target.value );
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>ML Hackathon Starter Kit (Loaded: {modelName})</p>
                <form onSubmit={ignoreSubmit}>
                    <button onClick={mlTest} type="button">Run Test</button>
                    <button onClick={mlTrain} type="button">Run Training</button>
                    <button onClick={mlColor} type="button">Random Color</button>
                </form>
                <form onSubmit={ignoreSubmit}>
                    <label>
                    Input:
                    <input type="text" value={inputText} onChange={handleInputChange}/>
                    </label>
                    <button onClick={mlPredict} type="button">Predict</button>
                </form>
                <form onSubmit={ignoreSubmit}>
                    <label>
                    Data:
                    <input type="text" value={dataText} onChange={handleDataChange}/>
                    </label>
                    <button onClick={mlAddData} type="button">Add Data</button>
                </form>
                <pre>{outputText}</pre>
            </header>
        </div>
    );
}

export default App;
