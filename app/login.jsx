import { Text, View, StyleSheet, Image, ScrollView, StatusBar, Platform } from 'react-native';
import React, { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js'
import { TouchableOpacity } from 'react-native';
import {client} from './utils/KindeConfig.jsx'
import services from './utils/services.jsx'
import {supabase} from './utils/SupabaseConfig.jsx'
import {useRouter} from 'expo-router'

const logoIcon = require('../assets/images/logo.png')
export default function LoginScreen() {

  useEffect(() => {
    StatusBar.setBarStyle(Platform.OS === 'ios'? 'light-content': 'default')
  },[]);


  const router = useRouter()
  const handleSignIn = async () => {
    const token = await client.login();
    if (token) {
      await services.storeData('login','true')
      const user = await client.getUserDetails();
      checkUser(user);
      router.replace('/')
      
    }
  };

  const checkUser = async (user) => {
    const { id, email, family_name, given_name, picture } = user;
  
    try {
      // Step 1: Check if the user exists in the database
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();
  
      if (selectError && selectError.code !== 'PGRST116') {
        // Handle unexpected errors during selection
        console.error('Error checking user existence:', selectError.message);
        return;
      }
  
      // Step 2: If user does not exist, insert the user into the database
      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id,
              email,
              lastname: family_name,
              firstname: given_name,
              picture,
            },
          ]);
  
        if (insertError) {
          console.error('Error inserting user:', insertError.message);
        } else {
          console.log('User inserted successfully:', newUser);
        }
      } else {
        console.log('User already exists:', existingUser);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
    }
  };
  return (
    <LinearGradient
        colors={[colors.gradient0, colors.gradient1]}
        style={styles.container}
        ><ScrollView style={styles.scrollViewStyle}>
        <View style={styles.header}>
          <Image source={logoIcon} style={styles.logo}></Image>
        </View>
      <TouchableOpacity style={styles.buttonBackground} onPress={handleSignIn}>
        <Text style={styles.buttonBig}>Prijavi se</Text>
      </TouchableOpacity>
      <Text style={styles.info}>*Prijavom prihvaćaš sve uvjete korištenja aplikacije.</Text>
            </ScrollView>  
        </LinearGradient>
  )
}

const styles = StyleSheet.create({
  info: {
    alignSelf: 'center',
    marginTop: 10,
    color: colors.textPrimary,
    fontSize: 12,
  },
  logo: {
    width: 400,
    height: 100,
    marginTop: 230,
    marginBottom: 0,
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
    width: 300,
    alignSelf: 'center'
  },
container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollViewStyle: {
  },
  header : {
    marginTop: 60,
    marginBottom: 30,
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    marginTop: 2,
  },
})