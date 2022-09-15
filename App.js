import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Button, Text, View } from 'react-native';
import React from 'react';
import { Audio } from 'expo-av';
import * as Sharing from "expo-sharing"


export default function App() {
  const[recording,setRecording]= React.useState();
  const[recordings, setRecordings]=React.useState([]);
  const[message, setMessage] = React.useState("")

  async function startRecording(){
    try{
      const permission = await Audio.requestPermissionsAsync();
     if (permission.status === "granted"){
      await Audio.setAudioModeAsync( { 
        allowsRecordingIOS:true,
        playInSilentMode:true
      });
        const {recording} = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
    setRecording(recording)
     }else{
      setMessage("please grant permission to app to access the microphone")
     }
    }catch (err){
      console.error("fail to start recording error",err)
    }

  }
  async function stopRecording(){
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    let updatedRecordings = [...recordings];
    const {sound, status} = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound : sound,
      duration: getDurationFormatted(status.durationMillis),
      File: recording.getURI()
  

    });
    
    setRecordings(updatedRecordings);

  }

  function getDurationFormatted(millis){
    const minutes = millis/1000/60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}`:  seconds;
    return  `${minutesDisplay}:${secondsDisplay}`;
  }

  function getRecordingLines(){
    return recordings.map((recordingLine, index)=>{
      return(
        <View key ={index} style={styles.row}>
          <Text style={styles.fill}>Recording{index + 1} - {recordingLine.duration}</Text>
          <Button style={styles.button} onPress={()=>recordingLine.sound.replayAsync()} title='play'></Button>
          <Button style={styles.button} onPress={() => Sharing.shareAsync(recordingLine.file)} title="Share"></Button>
        </View>
      )
    })
  }

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Button title ={recording ? 'stop recording' : 'start recording'}onPress={recording ? stopRecording : startRecording}/>
      {getRecordingLines()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    border:"5px solid blue",
    width:"50%",
    height:"30%",
    marginLeft:"50px"
  },
  row:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  },
  fill:{
    flex:1,
    margin:16
  },
  button:{
    margin:16
  }
});
