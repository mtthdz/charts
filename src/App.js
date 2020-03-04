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
      displayOpen: '',
      displayCurrent: '',
      displayVolume: '',
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
      amd: 'Advanced Micro Devices, Inc. ($AMD)',
      tsla: 'Tesla, Inc ($TSLA)',
      msft: 'Microsoft Corporation ($MSFT)',
      spce: 'Virgin Galactic Holdings, Inc. ($SPCE)',
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
      const companyName = memeList[lookupValue];
      const latestPrice = cleanData[arrayLength].price;
      const openingPrice = cleanData[0].price;
      const latestPriceString = `Current price: $${cleanData[arrayLength].price}`;
      const openingPriceString = `Opening price: $${cleanData[0].price}`;
      const latestVolumeString = `Current trading volume: ${cleanData[arrayLength].volume}`;
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
        displayOpen: openingPriceString,
        displayCurrent: latestPriceString,
        displayVolume: latestVolumeString,
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

        <header className='head'>
          <h1 className='head-title'>tendies tracker</h1>
          <p className='head-instructions'>Select one the hottest meme stocks (from the dropdown menu) to track.</p>
        </header>

        <div className='selection'>
          <form className='selection-container' action=''>
            <select className='selection-dropdown' onChange={this.selectionEvent} name='security-selection'>
              <option value=''></option>
              <option value='amd'>$AMD</option>
              <option value='msft'>$MSFT</option>
              <option value='spce'>$SPCE</option>
              <option value='tsla'>$TSLA</option>
            </select>

            <button className='selection-button' onClick={this.submitEvent}>track</button>
          </form>
        </div>

        <main className='chart-container'>
          <div className='company-details'>
            <h2 className='company-name'>{this.state.displayName}</h2>
            <p className='company-meta'>{this.state.displayCurrent}</p>
            <p className='company-meta'>{this.state.displayOpen}</p>
            <p className='company-meta'>{this.state.displayVolume}</p>
          </div>

          <LineChart 
            className='chart'
            width={600} height={350} 
            data={this.state.chartData}
            margin={{ top: 20, right: 50, bottom: 20, left: 0 }}
          >
            <Line dataKey='price' stroke={this.state.color} dot={false} strokeWidth={1.5}/>
            <XAxis dataKey='label' stroke={'#ffffff'} />
            <YAxis dataKey='price' type='number' domain={[this.state.minVal, this.state.maxVal]} tick={false} hide={true} stroke={'#ffffff'} />
            <Tooltip />
            <ReferenceLine y={this.state.displayOpen} stroke="#000000" strokeDasharray="3 3" />
          </LineChart>
        </main>

        <footer className='foot'>
          <p className='disclaimer'> All data displayed on this website is not accurate real-time trading data. Any and all trades based on information displayed on this website is made at the sole discretion of the user. </p>
          <p className='disclaimer'>financial data fetched from alphavantage.co</p>
        </footer>
      </div>  
    );
  }


}

export default App;
