import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Image, ScrollView, Button } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js'
import Termin from './components/Termin/Termin.jsx'
import termini from "./termini.jsx"
import NoviTerminGumb from './components/PregledTermina/NoviTerminGumb.jsx';
import React, { useState, useEffect } from 'react';
import {client} from './utils/KindeConfig.jsx'
const footballIcon = require('../assets/icons/football.png')
import { FontAwesome } from '@expo/vector-icons';
import services from './utils/services.jsx'
import { SelectList } from 'react-native-dropdown-select-list'

export default function App() {
	const [selected, setSelected] = React.useState("");
	const router=useRouter();
  useEffect(()=>{
    checkUserAuth();
  },[])

	const checkUserAuth=async()=> {
    const result=await services.getData('login');
    console.log(result)
    if(!result) {
		router.replace('/login')
    }
  }
  const handleLogout = async () => {
	const loggedOut = await client.logout();
	if (loggedOut) {
	  await services.storeData('login','false');
		router.replace('/login')

	}
  };

  const handleTermini = async() => {
	router.replace('/termini');
  }

    return (
        
        <LinearGradient
        colors={[colors.gradient0, colors.gradient1]}
        style={styles.container}
        ><ScrollView style={styles.scrollViewStyle}>
			
            <View style={styles.header}>
                <Text style={styles.title}>index</Text>
				<Button title='logout' onPress={handleLogout}></Button>
            </View>
			<Button title="termini" onPress={handleTermini}></Button>
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
  },
  selectCityContainer: {
	flexDirection: 'row',
	gap: 10,
	marginBottom: 50,
  },
  selectCityDropdown: {
	color: colors.textPrimary,
	backgroundColor: "white",

  },
  plusIconStyle: {
	width: 25,
	height: 25,
  }
});
