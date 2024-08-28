
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, Button, StatusBar, Platform, LogBox  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from './utils/SupabaseConfig.jsx';
import { SelectList } from 'react-native-dropdown-select-list';
import { colors } from './styles/colors.js';
import {client} from './utils/KindeConfig.jsx'
import Termin from './components/Termin/Termin.jsx';
import NoviTerminGumb from './components/PregledTermina/NoviTerminGumb.jsx';
import {useRouter} from 'expo-router'
import { useFocusEffect } from '@react-navigation/native';
const footballIcon = require('../assets/icons/football.png');

export default function App() {
  LogBox.ignoreAllLogs();
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityList, setCityList] = useState([]);
  const [termins, setTermins] = useState([]);
  const [playgrounds, setPlaygrounds] = useState([]);
  const [filteredTermins, setFilteredTermins] = useState([]);
  const router=useRouter();
  const [user, setUser] = useState(null);
  const playerIcon = require('../assets/icons/player.png');
  useEffect(() => {
    StatusBar.setBarStyle(Platform.OS === 'ios'? 'light-content': 'default')
    checkUserAuth();
    getCityList();
    getPlaygroundList();
    getTerminList();
    getUserInfo();
  },[]);

  useEffect(() => {
    if (selectedCity) {
      filterTerminsByCity();
    } else {
      setFilteredTermins([]);
    }
  }, [selectedCity, termins, playgrounds]);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle(Platform.OS === 'ios'? 'light-content': 'default')
      getTerminList();
      getCityList();
      getPlaygroundList();
    }, [])
  );

  const checkUserAuth = async () => {

    const result = await services.getData('login');
   
    if (!result) {
      router.replace('/login');
    }
  };

  const getUserInfo = async () => {
    try {
      const user = await client.getUserDetails();

      if (!user) {
        router.replace('/login');
        throw new Error("User details are incomplete or unavailable.");
      }

      setUser(user);
    } catch (error) {
      console.error(error.message);
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleRefresh = async () => {
	getTerminList();
	getCityList();
	getPlaygroundList();
  }

  const handleProfile = async () => {
    router.push("/profile");
  }
  const getCityList = async () => {
    const { data, error } = await supabase.from('cities').select('*');
    if (error) {
      console.error("Error fetching cities:", error);
    } else {
      const mappedData = data.map((city) => ({
        key: city.id,
        value: capitalizeWords(city.name),
      }));
      setCityList(mappedData);
    }
  };

  const getPlaygroundList = async () => {
    const { data, error } = await supabase.from('playgrounds').select('*');
    if (error) {
      console.error("Error fetching playgrounds:", error);
    } else {
      setPlaygrounds(data);
    }
  };

  const getTerminList = async () => {
    const { data, error } = await supabase.from('termins').select('*');
    if (error) {
      console.error("Error fetching termins:", error);
    } else {
      setTermins(data);
    }
  };

  const filterTerminsByCity = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7); // End of next week
    nextWeek.setHours(23, 59, 59, 999); // End of the day

    const filtered = termins.filter((termin) => {
      const playground = playgrounds.find(
        (pg) => pg.id === termin.playground_id
      );

      const terminDate = new Date(termin.date);
      terminDate.setHours(0, 0, 0, 0); // Normalize date to start of the day

      return (
        playground &&
        playground.city_id === parseInt(selectedCity, 10) &&
        terminDate >= today &&
        terminDate <= nextWeek
      );
    });

    setFilteredTermins(filtered);
  };

  const getPlaygroundName = (playground_id) => {
    const playground = playgrounds.find((pg) => pg.id === playground_id);
    return playground ? playground.name.toUpperCase() : `PLAYGROUND ${playground_id}`;
  };

  const formatTimeAndDate = (time, date) => {
    const daysOfWeek = [
      "NED",
      "PON",
      "UTO",
      "SRI",
      "ČET",
      "PET",
      "SUB"
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

  return (
    <LinearGradient
      colors={[colors.gradient0, colors.gradient1]}
      style={styles.container}
    >
    <StatusBar barStyle="light-content"/>
      <ScrollView style={styles.scrollViewStyle}>
        <View style={styles.header}>
        <View style={styles.headerText}>
          <Image source={footballIcon} style={styles.headerIconStyle} />
          <Text style={styles.title}>Pregled termina</Text>
          </View>
          {user ? (
          <TouchableOpacity onPress={handleProfile}>
          {user.picture ? (<Image 
                source={{ uri: user.picture }} 
                style={styles.profileImage} 
              />) : (
                <Image 
                source={playerIcon} 
                style={styles.profileImage} 
              />
              )}
          
          </TouchableOpacity>
          ) : (
          <Text>Loading user information...</Text>
        )}
        </View>
        <View style={styles.selectCityContainer}>
          <SelectList
            setSelected={(val) => setSelectedCity(val)}
            data={cityList}
            save="key"
            dropdownStyles={{
              backgroundColor: "#24252D",
              width: "100%",
            }}
            dropdownTextStyles={{
              color: colors.textPrimary,
            }}
            boxStyles={{
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
              fontFamily: "IstokWeb-Regular",
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
          <NoviTerminGumb />
        </View>
        <View style={styles.terminiContainer}>
          {selectedCity === null ? (
            <Text style={styles.noTerminsText}>Odaberi grad.</Text>
          ) : filteredTermins.length > 0 ? (
            filteredTermins.map((termin) => (
              <Termin
                key={termin.id}
                id={termin.id}
                fieldName={getPlaygroundName(termin.playground_id)}
                time={formatTimeAndDate(termin.time, termin.date)}
                date={termin.date}
                organizerName={termin.created_by}
                playerAmount={termin.current_players || 0}
                maxPlayerAmount={termin.max_players}
              />
            ))
          ) : (
            <Text style={styles.noTerminsText}>Trenutno nema termina u ovom gradu</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 65, // Adjust the size as needed
    height: 65,
    borderRadius: 50, // Makes the image circular
    borderColor: colors.accent,
    borderWidth: 3,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollViewStyle: {},
  headerText: {
    flex: 1,
    flexDirection: 'row'
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    flexDirection: 'row',
    alignSelf: 'left',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    marginTop: 2,
  },
  headerIconStyle: {
    height: 37,
    width: 37,
  },
  terminiContainer: {
    gap: 19,
    marginBottom: 100,
  },
  selectCityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  noTerminsText: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Regular",
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
