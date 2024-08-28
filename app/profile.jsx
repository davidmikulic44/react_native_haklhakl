import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js';
import { client } from './utils/KindeConfig.jsx';
import { supabase } from './utils/SupabaseConfig.jsx';  // Assuming you have a supabase client setup

export default function App() {
  const [selected, setSelected] = useState("");
  const [user, setUser] = useState(null);
  const [playedCount, setPlayedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const router = useRouter();
  const playerIcon = require('../assets/icons/player.png');
  useEffect(() => {
    const checkUserAuth = async () => {
      const result = await services.getData('login');
      if (!result) {
        router.replace('/login');
      }
    };

    const getUserInfo = async () => {
      try {
        const userDetails = await client.getUserDetails();

        if (!userDetails) {
          router.replace('/login');
          throw new Error("User details are incomplete or unavailable.");
        }

        setUser(userDetails);

        // Fetch the played count from users_termins
        const { data: playedData, error: playedError } = await supabase
          .from('users_termins')
          .select('*', { count: 'exact' })
          .eq('user_id', userDetails.id);
        console.log(playedData)
        if (playedError) {
          throw new Error(`Error fetching played count: ${playedError.message}`);
        }

        // Fetch the created count from termins
        const { data: createdData, error: createdError } = await supabase
          .from('termins')
          .select('*', { count: 'exact' })
          .eq('user_id', userDetails.id);

        if (createdError) {
          throw new Error(`Error fetching created count: ${createdError.message}`);
        }

        const playedCount = playedData.length || 0;
        const createdCount = createdData.length || 0;

        // Update state with the fetched counts
        setPlayedCount(playedCount+createdCount);
        setCreatedCount(createdCount);
      } catch (error) {
        console.error(error.message);
      }
    };

    checkUserAuth();
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    const loggedOut = await client.logout();
    router.replace('/login');
    if (loggedOut) {
      await services.storeData('login', 'false');
      
    }
  };

  return (
    <LinearGradient colors={[colors.gradient0, colors.gradient1]} style={styles.container}>
      <ScrollView style={styles.scrollViewStyle}>
        {user ? (
          <View style={styles.container}>
            <View style={styles.header}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.profileImage} />
                ) : (
                <Image source={playerIcon} style={styles.profileImage} />
              )}
              
              <Text style={styles.nameText}>{user.given_name} {user.family_name}</Text>
            </View>
            <View style={styles.statistics}>
              <View style={styles.statContainer}>
                <View style={styles.numberStatContainer}>
                  <Text style={styles.numberStat}>{playedCount}</Text>
                </View>
                <Text style={styles.statText}>Odigranih termina</Text>
              </View>
              <View style={styles.statContainer}>
                <View style={styles.numberStatContainer}>
                  <Text style={styles.numberStat}>{createdCount}</Text>
                </View>
                <Text style={styles.statText}>Kreiranih termina</Text>
              </View>
            </View>
            <TouchableOpacity title="Odjavi se" style={styles.buttonBackground} onPress={handleLogout}>
              <Text style={styles.logoutButton}>Odjavi se</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text>Loading user information...</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.buttonGreen,
    borderRadius: '50%',
    height: 25,
    width: 25,
    position: 'absolute',
    top: 75,
    right: 65,
    borderWidth: 1,
    borderColor: "#003300"
  },
  buttonBackground: {
    backgroundColor: "rgba(36, 37, 45, 0.5)",
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 26,
    padding: 20,
    width: 300,
    alignSelf: 'center',
    marginTop: 300,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  logoutButton: {
    opacity: 0.8,
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    fontSize: 18,
  },
  statistics: {
    flex: 1,
    flexDirection: 'row',
    height: 150,
    gap: 50
  },
  statContainer: {

  },
  statText: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    textAlign: 'center',
  },
  numberStatContainer: {
    backgroundColor: "rgba(36, 37, 45, 0.5)",
    alignContent: 'center',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    width: 150,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.accent,
    textAlign: 'center',
    
    
  },
  numberStat: {
    fontSize: 77,
    color: colors.textPrimary,
    shadowColor: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    textAlign: 'center',
    lineHeight: 155
  },
  nameText: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100, // Adjust the size as needed
    height: 100,
    borderRadius: 50, // Makes the image circular
    marginBottom: 20,
    borderColor: colors.accent,
    borderWidth: 4,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    fontFamily: "IstokWeb-Bold"
  },
  scrollViewStyle: {},
  header: {
    marginTop: 100,
    marginBottom: 30,
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    color: colors.textPrimary,
    fontFamily: 'IstokWeb-Bold',
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
    backgroundColor: 'white',
  },
  plusIconStyle: {
    width: 25,
    height: 25,
  },
});
