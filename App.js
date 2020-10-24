import { StatusBar } from 'expo-status-bar';
import React, { Component }from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';



function Timer({ interval, style }) {
  const pad = (n) => n < 10 ? '0' + n : n;
  const duration = moment.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds() / 10);

  return (
    <View style={styles.timerContainer}>
      <Text style={style}>{pad(duration.minutes())}:</Text>
      <Text style={style}>{pad(duration.seconds())}:</Text>
      <Text style={style}>{pad(centiseconds)}</Text>
    </View>

  );
    
}
//BTN
//TODO
function RoundBtn({ title, color, background, onPress, disabled }) {
  return(
    <TouchableOpacity 
      onPress={() => !disabled && onPress()} 
      style={[ styles.button,{ backgroundColor: background }]}
      activeOpacity={disabled ? 1.0 : 0.7}>
      <Text style={[styles.buttonTitle,{color}]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default class App extends Component{

  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      now: 0,
      laps: [],
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  start = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
      laps : [0],
    })
    this.timer = setInterval(()=> {
      this.setState({ now: new Date().getTime()})
    }, 100)
  }

  lap = () => {
    const timestamp = new Date().getTime()

    const {laps, now, start} = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      laps: [0, firstLap + now - start, ...other],
      start: timestamp,
      now: timestamp,
    });
  }

  stop = () => {
    clearInterval(this.timer);

    const {laps, now, start} = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      laps: [firstLap + now - start, ...other],
      start: 0,
      now: 0,
    });
  }


  reset = () => {
    this.setState({
      laps: [],
      start: 0,
      now: 0,
    })
  }

  resume = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
    })
    this.timer = setInterval(()=> {
      this.setState({ now: new Date().getTime()})
    }, 100)
  }


  render() {

    const {now, start, laps} = this.state;
    const timer = now - start;

    return(
      <View style={styles.container}>
        <Timer 
          interval={laps.reduce((total, curr) => total + curr, 0) + timer} 
          style={styles.timerColor} />
        
        {laps.length === 0 && (
            <ButtonsRow>
              <RoundBtn 
                title='Reset' 
                color="#999999" 
                background="#872f43"
                disabled />
              <RoundBtn 
                title='Start' 
                color="#fff" 
                background="#799351"
                onPress={this.start} />
            
            </ButtonsRow>
        )}

        {start > 0 && (
          <ButtonsRow>
            <RoundBtn 
              title='Lap' 
              color="#799351" 
              background="#ffa36c"
              onPress={this.lap} />
            <RoundBtn 
              title='Stop' 
              color="#fff" 
              background="#d54062"
              onPress={this.stop} />
          
          </ButtonsRow>
        )}

        {laps.length > 0 && start === 0 && (
          <ButtonsRow>
            <RoundBtn 
              title='Reset' 
              color="#799351" 
              background="#d54062"
              onPress={this.reset} />
            <RoundBtn 
              title='Resume' 
              color="#fff" 
              background="#799351"
              onPress={this.resume} />
          
          </ButtonsRow>
        )}  
        

        <LapsTable laps={laps} timer={timer} />
      </View>
    );
  }
}

function ButtonsRow({children}){
  return(
  <View style={styles.buttonsRow}>{children}</View>
  );
}

function Lap({number, interval, fastest, slowest}) {


  const lapStyle = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest,
  ];

  return(
    <View style={styles.lap}>
      <Text style={lapStyle}>Lap {number}</Text>
      <Timer style={[lapStyle, styles.lapTimer]} interval={interval} />
    </View>
  );
}

function LapsTable({ laps, timer }) {
  const finishedLaps = laps.slice(1);
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;

  if(finishedLaps.length >= 2) {
    finishedLaps.forEach(lap => {
      if(lap < min) min = lap;
      if(lap > max) max = lap;
    });
  }

  return(
    <ScrollView style={styles.scrollView}>
      {laps.map((lap, index) => (
        <Lap 
            number={laps.length - index}
            key={laps.length - index}
            interval={index === 0 ? timer + lap : lap }
            fastest={lap === min }
            slowest={lap === max} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#393b44',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  timerColor: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "200",
    width: 70,
  },
  timerContainer: {
    flexDirection: "row" 
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    fontSize: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignSelf: "stretch",
    justifyContent: 'space-between',
    margin: 50,
    marginTop: 50,
    marginBottom: 30,
  },
  lapText: {
    color: "#f8f1f1",
    fontSize: 18,
  },
  lap: {
    flexDirection: 'row',
    justifyContent: "space-between",
    borderColor: "#2e2e2e",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  lapTimer: {
    width: 30,
  },
  scrollView: {
    alignSelf: "stretch",

  },
  fastest: {
    color: "#799351",
  },
  slowest: {
    color: "#d54062",
  }
});
