import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';


class App extends Component {
  constructor() {
    super();
    this.state = {
      userSelection: '',
      chartData: [],
      maxVal: 0,
      minVal: 0,

      displayName: '',
      displayOpen: 0,
      displayCurrent: 0,
      displayVolume: 0,
      color: '#20e371',
    };
  }

  // selection variable store
  selectionEvent = (event) => {
    this.setState({
      userSelection: event.target.value,
    })
  }

  submitEvent = (event) => {
    event.preventDefault();
    const lookupValue = this.state.userSelection;
    const apiKey = 'G7PA4WVLPU036EB6'; // api key
    const memeList = {
      amd: 'Advanced Micro Devices, Inc.',
      tsla: 'Tesla, Inc',
      msft: 'Microsoft Corporation',
      spce: 'Virgin Galactic Holdings, Inc.',
    }

    axios({
      url: 'https://www.alphavantage.co/query?',
      method: 'GET',
      responseType: 'json',
      params: {
        symbol: lookupValue, // input value stored when user hit enter key
        apikey: apiKey, // api key
        function: 'TIME_SERIES_INTRADAY',
        interval: '1min',
        outputsize: 'full',
      }
    }).then((response) => {
      const rawData = response.data['Time Series (1min)']; // created object of 
      const cleanData = [];

      // chart data
      for (let key in rawData) {
        cleanData.unshift({
          label: key.slice(11, 16),
          time: Number(key.slice(11, 16).replace(':', '.')),
          price: Number(rawData[key]['4. close']),
          volume: Number(rawData[key]['5. volume'])
        })
      }

      const maximum = Math.max.apply(Math, cleanData.map(function (o) { return o.price }));
      const minimum = Math.min.apply(Math, cleanData.map(function (o) { return o.price }));

      const arrayLength = cleanData.length - 1
      const latestPrice = cleanData[arrayLength].price;
      const openingPrice = cleanData[0].price;
      const companyName = memeList[lookupValue];
      const latestVolume = cleanData[arrayLength].volume;
      const red = '#e33720';

      if(openingPrice > latestPrice) {
        this.setState({
          color: red,
        })
      }

      this.setState({
        chartData: cleanData,
        maxVal: maximum,
        minVal: minimum,
        displayName: companyName,
        displayOpen: openingPrice,
        displayCurrent: latestPrice,
        displayVolume: latestVolume,
      })
    })
  }




  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      
    }
  }

  render() {
    return (
      <div className='wrapper App'>
        <div className='selection'>
          <h1>tendies tracker</h1>
          <p>select a meme stock to track.</p>
          <form action="">
            <select onChange={this.selectionEvent} name='security-selection'>
              <option value=''></option>
              <option value='amd'>$AMD</option>
              <option value='msft'>$MSFT</option>
              <option value='spce'>$SPCE</option>
              <option value='tsla'>$TSLA</option>
            </select>

            <button onClick={this.submitEvent}>select</button>
          </form>
        </div>

        <div className='chart'>
          <h2 className='company-name'>{this.state.displayName}</h2>
          <p className='company-meta'>current price: ${this.state.displayCurrent}</p>
          <p className='company-meta'>open price: ${this.state.displayOpen}</p>
          <p className='company-meta'>current trading volume: {this.state.displayVolume}</p>
          <LineChart 
            width={800} height={400} 
            data={this.state.chartData}
            margin={{ top: 20, right: 50, bottom: 20, left: 0 }}
          >
            <Line dataKey='price' stroke={this.state.color} dot={false} />
            <XAxis dataKey='label' />
            <YAxis dataKey='price' type='number' domain={[this.state.minVal, this.state.maxVal]} tick={false} />
            <Tooltip />
            <ReferenceLine y={this.state.displayOpen} stroke="#000000" strokeDasharray="3 3" />
          </LineChart>
        </div>
      </div>  
    );
  }


}

export default App;
