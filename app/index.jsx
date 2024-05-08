import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js'
import Termin from './components/Termin/Termin.jsx'
import NoviTerminGumb from './components/PregledTermina/NoviTerminGumb.jsx';
import React, { useState } from 'react';
const footballIcon = require('../assets/icons/football.png')
import { FontAwesome } from '@expo/vector-icons';

import { SelectList } from 'react-native-dropdown-select-list'

export default function App() {
	const [selected, setSelected] = React.useState("");
	const data = [
		{key:'1', value:'Osijek', disabled:false},
		{key:'2', value:'Kutina'},
		{key:'3', value:'Zagreb'}
	]

    return (
        
        <LinearGradient
        colors={[colors.gradient0, colors.gradient1]}
        style={styles.container}
        ><ScrollView style={styles.scrollViewStyle}>
			
            <View style={styles.header}>
                <Image source={footballIcon} style={styles.headerIconStyle}/>
                <Text style={styles.title}>Pregled termina</Text>
            </View>
			<View style={styles.selectCityContainer}>
				<SelectList 
					setSelected={(val) => setSelected(val)} 
					data={data} 
					save="value"
					dropdownStyles={{
						backgroundColor: "#24252D",
						width: "100%",
					}}
					dropdownTextStyles={{
						color: colors.textPrimary
					}}
					boxStyles={ {
						backgroundColor: "rgba(36, 37, 45, 0.5)",
						minWidth: 335,
						maxWidth: 335,
						borderRadius: 10,
						borderColor: "#3D3D3E",
						borderWidth: 1,
						height: 50,
						alignItems: 'center',
						color: colors.textPrimary,
					}}
					inputStyles={{
						color: colors.textPrimary,
						fontFamily: "IstokWeb-Regular"
					}}
					arrowicon={<FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />}
					searchicon={<FontAwesome name="search" size={12} color={colors.textPrimary} />}  
					dropdownItemStyles={{
						height: 50,
						justifyContent: 'center',
						fontFamily: "IstokWeb-Regular",
						fontSize: 39,
					}}
					placeholder="Odaberi grad"
					searchPlaceholder="Traži grad"
					search={false}
					closeicon={<FontAwesome name="close" size={12} color={colors.textPrimary} />}
					notFoundText="Traženi grad ne postoji."
					

				/>
				<NoviTerminGumb></NoviTerminGumb>
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
