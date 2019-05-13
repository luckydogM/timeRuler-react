import React, { Component } from 'react';
import './App.css';
import 'antd-mobile/dist/antd-mobile.css';
import TimeRuler from './component/timeruler';

// import DatePick from './component/date-pick';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/*
          <DatePick />
        */}
        <TimeRuler />
      </div>
    );
  }
}

export default App;
