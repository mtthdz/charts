

import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

// notes:

// order of contents:
//  1. constructor
//  2. selection event handler
//  3. submit event handler
//    i. API call
//    ii. chartData clean
//    iii. company metaData variables
//    iv. setState stored
//  4. render
//    i. header
//    ii. selection
//    iii. chart
//      a. linechart
//      b. barchart
//    iv. footer


// next steps
// implement search and autofill feature (stretch goal)
// due to limitations with the API call, I can only call the latest 100 intraday points; true previous-day closing price and current-day opening price won't be true. I will solve this issue by pulling intraday data since inception and figuring out how to only display latest 24hr intraday data (MVP)
// due to the lack of support with the Recharts library and limited timeframe for this project (in the scope of Bootcamp due dates), the chart is not responsive. This fix is ongoing (MVP)


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


  // selection event
  // stores selected pulldown option into state
  selectionEvent = (event) => {
    this.setState({
      userSelection: event.target.value,
    })
  }


  // submit event
  // upon event firing, API is called (using selection event variable as lookup value)
  submitEvent = (event) => {
    event.preventDefault();
    const lookupValue = this.state.userSelection;
    const apiKey = 'G7PA4WVLPU036EB6'; // api key

    axios({
      url: 'https://www.alphavantage.co/query?',
      method: 'GET',
      responseType: 'json',
      params: {
        symbol: lookupValue, // input value stored when user hit enter key
        apikey: apiKey, // api key
        function: 'TIME_SERIES_INTRADAY',
        interval: '1min',
        outputsize: 'compact',
      }
    }).then((response) => {
      const rawData = response.data['Time Series (1min)']; // this will be cleaned to store in state
      const cleanData = []; // this will be stored in state

      // chart data cleaned from API
      for (let key in rawData) {
        cleanData.unshift({ // unshift will flip data, as API calls latest data, whereas I want to start chart with oldest data
          label: key.slice(11, 16), 
          time: Number(key.slice(11, 16).replace(':', '.')),
          price: Number(rawData[key]['4. close']),
          volume: Number(rawData[key]['5. volume'])
        })
      }

      // these variables are used to make the chart's y-axis dynamic
      const maximum = Math.max.apply(Math, cleanData.map(function (o) { return o.price }));
      const minimum = Math.min.apply(Math, cleanData.map(function (o) { return o.price }));

      // these variables are meant to populate the meta data above the chart
      // they are all stored in state
      const memeList = {
        amd: 'Advanced Micro Devices, Inc. ($AMD)',
        tsla: 'Tesla, Inc ($TSLA)',
        msft: 'Microsoft Corporation ($MSFT)',
        spce: 'Virgin Galactic Holdings, Inc. ($SPCE)',
      }
      const companyName = memeList[lookupValue]; // this is static due to limited project timeline

      // obtains open and current prices + differential
      const arrayLength = cleanData.length - 1; // needed for determining latest price
      const latest = cleanData[arrayLength].price; 
      const opening = cleanData[0].price;
      const differential = Math.round(((latest - opening) + Number.EPSILON) * 100) / 100;

      // template literals stored in state to hide text (within render) until event is fired
      const latestString = `Current price: $${latest} (${differential})`;
      const openingString = `Opening price: $${opening}`;
      const VolumeString = `Current trading volume: ${cleanData[arrayLength].volume}`;

      // will change html elements red when stock is negative relative to previous day closing price
      // due to api limitations, i use current day opening price rather than previous day closing price
      const red = '#e33720'; 
      const green = '#20e371';
      if(opening > latest) {
        this.setState({
          color: red,
        }) 
      
      } else {
        this.setState({
          color: green,
        })
      };

      // all variables stored in state upon event firing
      this.setState({
        chartData: cleanData,
        maxVal: maximum,
        minVal: minimum,
        displayName: companyName,
        displayOpen: openingString,
        displayCurrent: latestString,
        displayVolume: VolumeString,
      })
    })
  }


  // render
  render() {
    // this variable is stored to change color of current price element
    // i couldn't figure a way to directly style within jsx element tag
    const priceColor = {
      color: this.state.color,
    }

    return (
      <div className='wrapper App'>

        {/* header */}
        <header className='head'>
          <h1 className='head-title'>Charts</h1>
          <p className='head-instructions'>Select one the stocks (from the dropdown menu) to track.</p>
        </header>

        {/* selection */}
        <section className='selection'>
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
        </section>

        {/* main */}
        <main className='chart-container'>
          <div className='company-details'>
            <h2 className='company-name'>{this.state.displayName}</h2>
            <p className='company-meta' style={priceColor}>{this.state.displayCurrent}</p>
            <p className='company-meta'>{this.state.displayOpen}</p>
            <p className='company-meta'>{this.state.displayVolume}</p>
          </div>

          <LineChart 
            className='chart'
            width={1000} height={250} 
            margin={{ top: 20, right: 50, bottom: 0, left: 0 }}
            data={this.state.chartData}
          >
            <Line dataKey='price' stroke={this.state.color} dot={false} strokeWidth={1.5}/>
            <XAxis dataKey='label' stroke={'#ffffff'} hide={true} />
            <YAxis dataKey='price' type='number' domain={[this.state.minVal, this.state.maxVal]} tick={false} hide={true} stroke={'#ffffff'} />
            <Tooltip />
            <ReferenceLine x='16:00' stroke="#999999" strokeDasharray="2 3" />
          </LineChart>

          <BarChart
            className='chart'
            width={1000} height={125}
            margin={{ top: 0, right: 50, bottom: 0, left: 0 }}
            data={this.state.chartData}
          >
            <Bar dataKey="volume" fill="#999999" />
            <XAxis dataKey='label' stroke={'#ffffff'} />
            <Tooltip />
          </BarChart>
        </main>

        {/* footer */}
        <footer className='foot'>
          <p className='disclaimer'>financial data fetched from <a className= 'disclaimer-link' href='https://www.alphavantage.co/' target='_blank'>alphavantage.co</a></p>
        </footer>
      </div>  
    );
  }
}

export default App;
