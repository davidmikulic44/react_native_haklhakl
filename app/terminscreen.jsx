import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { supabase } from './utils/SupabaseConfig';
import { useRoute } from '@react-navigation/native';
import { client } from './utils/KindeConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js';
import { useFocusEffect } from '@react-navigation/native';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import {useRouter} from 'expo-router'
const TerminDetails = () => {
  const loadingGif = require('../assets/icons/loading.gif')
  const stadiumIcon = require('../assets/icons/stadium.png');
  const locationIcon = require('../assets/icons/location.png');
  const sunIcon = require('../assets/icons/sun.png');
  const playerIcon = require('../assets/icons/player.png');
  const playerIcon5v5 = require('../assets/icons/5v5.png')
  const playerIcon6v6 = require('../assets/icons/6v6.png')
  const organizerIcon = require('../assets/icons/organizer.png');
  const mapsIcon = require('../assets/icons/maps.png');
  const route = useRoute();
  const router=useRouter();
  const { id } = route.params; // Extract id from route params

  const [terminDetails, setTerminDetails] = useState(null);
  const [cityName, setCityName] = useState('');
  const [playgroundName, setPlaygroundName] = useState('');
  const [playgroundLatitude, setPlaygroundLatitude] = useState(null);
  const [playgroundLongitude, setPlaygroundLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distance, setDistance] = useState('?');
  const [temperature, setTemperature] = useState('?')
  const [date, setDate] = useState(null)
  const [maxPlayers, setMaxPlayers] = useState(null)
  const [emptySpots, setEmptySpots] = useState(null)
  useEffect(() => {
    fetchTerminDetails();
    checkWhoIsUser();
    getLocation();
  }, [id, userId]);

  useFocusEffect(
    React.useCallback(() => {
      getLocation();
    }, [])
  );

  const checkWhoIsUser = async () => {
    const user = await client.getUserDetails();
    setUserId(user.id);
  };

  const getTemp = async () => {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${cityName}&days=1&dt=${date}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'c61703482cmsh7750660e9e46221p177403jsnf04e1923f232',
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json(); // Parse the JSON response
        const avgTemp = result.forecast.forecastday[0].day.avgtemp_c;
        const tempRounded = Math.round(avgTemp) // Extract avg temperature
        console.log(`The average temperature in ${cityName} on ${date} will be ${tempRounded}°.`);
        setTemperature(tempRounded)
      } catch (error) {
        console.error(error);
    }
};

  const getLocation = async () => {
    console.log("getting location");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("error");
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
    if (!location) {
      location = await Location.getLastKnownPositionAsync({});
    }

    setLocation(location);
    console.log("set location");

    const { data: playgroundData, error: playgroundError } = await supabase
      .from('playgrounds')
      .select('*')
      .eq('id', terminDetails.playground_id)
      .single();

    if (playgroundError) {
      throw playgroundError;
    }

    setPlaygroundLatitude(playgroundData.latitude);
    setPlaygroundLongitude(playgroundData.longitude);

  };

  useEffect(() => {
    if (location && playgroundLatitude && playgroundLongitude) {
      getDistance();
    }
  }, [location, playgroundLatitude, playgroundLongitude]);

  useEffect(() => {
    if(cityName && date)
      getTemp();
  },[cityName, date])

  useEffect(() => {
    if(users && maxPlayers)
      getEmptySpots()
  },[users,maxPlayers])

  const getEmptySpots = () => {
    setEmptySpots(maxPlayers-users.length-1)
    
  }

  const renderEmptySpots = () => {
    return Array.from({ length: emptySpots }).map((_, index) => (
      <View key={index} style={styles.playerNameContainer}>
        <Image source={playerIcon} style={styles.playerIcon} />
      </View>
    ));
  };

  const getDistance = () => {
    if (!playgroundLatitude || !playgroundLongitude || !location) {
      console.log("playground missing");
      return;
    }

    console.log("getting distance");
    let lat1 = location.coords.latitude;
    let lon1 = location.coords.longitude;
    let lat2 = playgroundLatitude;
    let lon2 = playgroundLongitude;

    let degToRad = Math.PI / 180;
    lat1 *= degToRad;
    lon1 *= degToRad;
    lat2 *= degToRad;
    lon2 *= degToRad;

    let radius = 6371;
    let dLat = lat2 - lat1;
    let dLon = lon2 - lon1;
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let calculatedDistance = radius * c;


    console.log("distance:", calculatedDistance);
    if(calculatedDistance>10){
      calculatedDistanceRounded=Math.round(calculatedDistance)
      setDistance(calculatedDistanceRounded+"km")
    }
    else if (calculatedDistance > 1){
      calculatedDistanceRounded=Math.round(calculatedDistance * 10) / 10
      setDistance(calculatedDistanceRounded+"km")
    }
    else {
      calculatedDistanceRounded=Math.round(calculatedDistance*1000)
      setDistance(calculatedDistanceRounded+"m");
    }
    
  };

  const formatTimeAndDate = (time, date) => {
    const daysOfWeek = [
      "Nedjelja",
      "Ponedjeljak",
      "Utorak",
      "Srijeda",
      "Četvrtak",
      "Petak",
      "Subota"
    ];

    const [hour, minute] = time.split(':');
    const terminDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (
      terminDate.getDate() === today.getDate() &&
      terminDate.getMonth() === today.getMonth() &&
      terminDate.getFullYear() === today.getFullYear()
    ) {
      return `Danas u ${hour}:${minute}`;
    } else if (
      terminDate.getDate() === tomorrow.getDate() &&
      terminDate.getMonth() === tomorrow.getMonth() &&
      terminDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Sutra u ${hour}:${minute}`;
    } else {
      const dayName = daysOfWeek[terminDate.getDay()];
      return `${dayName} u ${hour}:${minute}`;
    }
  };

  const fetchTerminDetails = async () => {
    try {
      const { data: terminData, error: terminError } = await supabase
        .from('termins')
        .select('*')
        .eq('id', id)
        .single();

      if (terminError) {
        throw terminError;
      }

      setTerminDetails(terminData);
      setMaxPlayers(terminData.max_players);
      setDate(terminData.date)
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('name')
        .eq('id', terminData.city_id)
        .single();

      if (cityError) {
        throw cityError;
      }

      setCityName(cityData.name);

      const { data: playgroundData, error: playgroundError } = await supabase
        .from('playgrounds')
        .select('*')
        .eq('id', terminData.playground_id)
        .single();

      if (playgroundError) {
        throw playgroundError;
      }

      setPlaygroundName(playgroundData.name);
      setPlaygroundLatitude(playgroundData.latitude);  // Added
      setPlaygroundLongitude(playgroundData.longitude);  // Added

      const { data: organizerData, error: organizerError } = await supabase
        .from('users')
        .select('firstname, lastname, picture')
        .eq('id', terminData.user_id)
        .single();

      if (organizerError) {
        throw organizerError;
      }

      setTerminDetails((prevDetails) => ({
        ...prevDetails,
        organizerName: `${organizerData.firstname} ${organizerData.lastname}`,
        organizerPicture: organizerData.picture,
      }));

      const { data: userTerminData, error: userTerminError } = await supabase
        .from('users_termins')
        .select('*')
        .eq('termin_id', id)
        .eq('user_id', userId)
        .single();

      if (userTerminData) {
        setHasJoined(true);
      }

      if (userTerminError && userTerminError.code !== 'PGRST116') {
        throw userTerminError;
      }

      const { data: joinedUsers, error: joinedUsersError } = await supabase
        .from('users_termins')
        .select('user_id')
        .eq('termin_id', id);

      if (joinedUsersError) {
        throw joinedUsersError;
      }

      const userIds = joinedUsers.map(ju => ju.user_id);

      if (userIds.length > 0) {
        const { data: userDetails, error: userDetailsError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (userDetailsError) {
          throw userDetailsError;
        }

        const usersList = userDetails
          .map(user => ({
            ...user,
            isCurrentUser: user.id === userId,
          }))
          .sort((a, b) => (a.isCurrentUser ? -1 : 1));

        setUsers(usersList);
      }

      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleJoin = async () => {
    try {
      // Insert into users_termins
      const { error: insertError } = await supabase
        .from('users_termins')
        .insert([{ termin_id: id, user_id: userId }]);

      if (insertError) {
        throw insertError;
      }

      // Update the current_players in termins table
      const { data: updatedTermin, error: updateError } = await supabase
        .from('termins')
        .update({ current_players: terminDetails.current_players + 1 })
        .eq('id', id)
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update the local state with the new current_players value
      setTerminDetails(updatedTermin);
      setHasJoined(true);

      fetchTerminDetails();
      checkWhoIsUser();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLeavePrompt = async () => {
    Alert.alert('Jesi li siguran da želiš izaći?','😭', [
      {
        text: 'Poništi',
        style: 'cancel',
      },
      {text: 'Izađi iz termina', onPress: () => handleLeave()},
    ])

    const handleLeave = async () => {
      try {
        const { error: deleteError } = await supabase
          .from('users_termins')
          .delete()
          .eq('termin_id', id)
          .eq('user_id', userId);
  
        if (deleteError) {
          throw deleteError;
        }
  
        // Update the current_players in termins table
        const { data: updatedTermin, error: updateError } = await supabase
          .from('termins')
          .update({ current_players: terminDetails.current_players - 1 })
          .eq('id', id)
          .single();
  
        if (updateError) {
          throw updateError;
        }
  
        // Update the local state with the new current_players value
        setTerminDetails(updatedTermin);
        setHasJoined(false);
  
        router.replace('/')
  
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  }

  const openMap = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });

    const latLng = `${playgroundLatitude},${playgroundLongitude}`;
    const label = playgroundName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  if (loading) {
    return (
      <LinearGradient
      colors={[colors.gradient0, colors.gradient1]}
      style={styles.container}>
      <Image source={loadingGif} style={styles.loadingIcon}/>
      </LinearGradient>

    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradient0, colors.gradient1]}
      style={styles.container}
    ><ScrollView style={styles.scrollViewStyle}>
        {terminDetails ? (
          <>
            <View style={styles.terminHeader}>
              <Image source={stadiumIcon} style={styles.stadiumIcon}/>
              <Text style={styles.playgroundName}>{playgroundName.toUpperCase()}</Text>
            </View>
            <View style={styles.timeAndMaps}>
              <Text style={styles.terminTime}>
              {formatTimeAndDate(terminDetails.time, terminDetails.date)}
              </Text>
              <TouchableOpacity style={styles.mapsBackground} onPress={openMap}>
                <Image source={mapsIcon} style={styles.mapsIcon}/>
                {(distance) ? (
                <Text style={styles.mapsDistance}>{distance}</Text>
                ):(
                  <Text style={styles.mapsDistance}>?km</Text>
                )
                }
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{terminDetails.description}</Text>
            <View style={styles.weatherAndPlaystyle}>
            <View style={styles.weatherContainer}>
            <Image source={sunIcon} style={styles.sunIcon}/>
            {(temperature) ? (
            <Text style={styles.weatherText}>{temperature}°</Text>)
            :(<Text style={styles.weatherText}>?°</Text>)}
            </View>
            {terminDetails.max_players===10 ? (
              <View style={styles.weatherContainer}>
              <Image source={playerIcon5v5} style={styles.playerAmountStyleIcon}/></View>
              ) : (
                <View style={styles.weatherContainer}>
                <Image source={playerIcon6v6} style={styles.playerAmountStyleIcon}/>
                </View>
              )}
              </View>
            
              {terminDetails.user_id === userId ? (
                <Text style={styles.organizerText}>Ti si organizator.</Text>
            ) : (
              hasJoined ? (
                <TouchableOpacity style={styles.buttonLeave} onPress={handleLeavePrompt}> 
                  <Text style={styles.buttonBig}>Izađi</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.buttonBackground} onPress={handleJoin}> 
                  <Text style={styles.buttonBig}>Pridruži se</Text>
                </TouchableOpacity>
              )
            )}

            <View style={styles.playersContainer}>
            <View style={styles.playerNameContainer}>
            {terminDetails.organizerPicture ? (
              <Image 
                source={{ uri: terminDetails.organizerPicture }} 
                style={styles.profileImage} 
              />
            ) : 
            (
              <Image source={playerIcon} style={styles.playerIcon}/>
            )
            }
              <Text style={styles.userText}>{terminDetails.organizerName}</Text>
              <Image source={organizerIcon} style={styles.organizerIcon}/>
            </View>
            <FlatList
              stlye={styles.flatListPlayers}
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.playerNameContainer}>
                  {item.picture ? (
                    <Image 
                    source={{ uri: item.picture }} 
                    style={styles.profileImage} 
                  />
                  ) : 
                  (
                    <Image source={playerIcon} style={styles.playerIcon}/>
                  )
                  }
                  <Text style={styles.userText}>{item.firstname} {item.lastname}</Text>
                </View> // Display formatted name
              )}
              scrollEnabled={false}  // Disable scrolling
            />
            {renderEmptySpots()}
            </View>
           
          </>
        ) : (
          <Text></Text>
        )}
        
      </ScrollView>
    </LinearGradient>
  );
};

export default TerminDetails;

const styles = StyleSheet.create({
  organizerText : {
    color: colors.textSecondary,
    fontFamily: 'IstokWeb-Regular',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16

  },
  loadingIcon: {
    width: 40,
    height: 40
  },
  scrollViewStyle: {
    width: '100%'
  },
  weatherContainer: {
    backgroundColor: "rgba(36, 37, 45, 0.9)",
    height: 100,
    maxWidth: 100,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent
  },
  weatherText: {
    fontFamily: 'IstokWeb-Bold',
    color: colors.textSecondary,
    fontSize: 28,
    marginLeft: 40
  },
  sunIcon: {
    width: 30,
    height: 30,
    alignSelf: 'left',
    marginTop: 10
  },
  weatherAndPlaystyle: {
    flex:1,
    flexDirection: 'row',
    maxHeight: 100,
    alignItems: 'center',
    gap: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  playerAmountStyleIcon: {
      width: 60,
      height: 60,
  },
  flatListPlayers: {
    
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: "IstokWeb-Regular",
    alignSelf: 'left',
    height: 50,
    marginLeft: 30,
  },
  mapsIcon: {
    width: 20,
    height: 30,
  },
  mapsBackground: {
    backgroundColor: "rgba(36, 37, 45, 0.9)",
    borderRadius: 15,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    paddingLeft: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.accent,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  mapsDistance: {
    color: colors.textSecondary,
    fontSize: 20,
    fontFamily: "IstokWeb-Bold",

  },
  timeAndMaps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginLeft: 30,
    marginRight: 30
  },
  terminTime: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    fontSize: 24,
  },
  terminHeader: {
    marginLeft: 30,
    marginTop: 60,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'left',
    justifyContent: 'left',
    gap: 10,
  },
  stadiumIcon: {
    width: 50,
    height: 30,
  },
  playgroundName: {
    fontFamily: "IstokWeb-Bold",
    color: colors.textPrimary,
    fontSize: 36
  },
  buttonLeave: {
    backgroundColor: colors.buttonRed,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 26,
    padding: 20,
    maxHeight: 100,
    width: 300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonBig: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    fontSize: 38,
  },
  buttonBackground: {
    backgroundColor: colors.buttonGreen,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 26,
    padding: 20,
    maxHeight: 100,
    width: 300,
    alignSelf: 'center',
    marginBottom: 20
  },
  profileImage: {
    width: 40, // Adjust the size as needed
    height: 40,
    borderRadius: 50, // Makes the image circular
    borderColor: colors.accent,
    borderWidth: 1,
  },
  playersContainer: {
    flex: 1,
    flexDirection: 'column',
    marginBottom: 100,
    alignSelf: 'center'
  },
  playerIcon: {
    width: 40,
    height: 40,
  },
  organizerIcon: {
    width: 15,
    height: 13,
    marginBottom: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  },
  userText: {
    fontSize: 16,
    fontFamily: "IstokWeb-Bold",
    color: colors.textPrimary,
  },
  playerNameContainer: {
    flex: 1,
    justifyContent: 'left',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    maxHeight: 60,
    width: 300,
    textAlign: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 10,

  },
  userHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  userHeaderContainer: {
    marginBottom: 0,
  },
});
