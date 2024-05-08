import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js'
import Termin from './components/Termin/Termin.jsx'

const footballIcon = require('../assets/icons/football.png')

export default function App() {
    return (
        
        <LinearGradient
        colors={[colors.gradient0, colors.gradient1]}
        style={styles.container}
        ><ScrollView style={styles.scrollViewStyle}>
        
            <View style={styles.header}>
                <Image source={footballIcon} style={styles.headerIconStyle}/>
                <Text style={styles.title}>Pregled termina</Text>
            </View>
            <View style={styles.terminiContainer}>
                <Termin fieldName="Srednjika" distance="0.7" time="Danas u 20:00" temperature="21" organizerName="davidm" playerAmount="10" maxPlayerAmount="10"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Utorak u 17:30" temperature="26" organizerName="davidm" playerAmount="5" maxPlayerAmount="10"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Četvrtak u 20:00" temperature="22" organizerName="davidm" playerAmount="3" maxPlayerAmount="12"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Četvrtak u 20:00" temperature="22" organizerName="davidm" playerAmount="3" maxPlayerAmount="12"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Četvrtak u 20:00" temperature="22" organizerName="davidm" playerAmount="3" maxPlayerAmount="12"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Četvrtak u 20:00" temperature="22" organizerName="davidm" playerAmount="3" maxPlayerAmount="12"/>
                <Termin fieldName="Srednjika" distance="0.7" time="Četvrtak u 20:00" temperature="22" organizerName="davidm" playerAmount="3" maxPlayerAmount="10"/>
            </View>
            <StatusBar style="auto" />
            </ScrollView>  
        </LinearGradient>
        
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollViewStyle: {
  },
  header : {
    marginTop: 60,
    marginBottom: 30,
    flexDirection: 'row',
    alignSelf: 'left',
    alignItems: 'center',
    paddingLeft: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    marginTop: 2,
  },
  link: {
    color: 'blue',
  },
  headerIconStyle: {
    height: 37,
    width: 37,
  },
  terminiContainer: {
    gap: 19,
    marginBottom: 80,
  }
});
