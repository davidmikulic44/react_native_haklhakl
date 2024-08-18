import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './styles/colors.js'
import { TouchableOpacity } from 'react-native';
import {client} from './utils/KindeConfig.jsx'
import services from './utils/services.jsx'
import {supabase} from './utils/SupabaseConfig.jsx'
import {useRouter} from 'expo-router'
export default function LoginScreen() {
  const router = useRouter()
  const handleSignIn = async () => {
    const token = await client.login();
    if (token) {
      await services.storeData('login','true')
      const user = await client.getUserDetails();
      checkUser(user);
      router.replace('/termini')
      
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
        <Text style={styles.title}>LoginScreen</Text>
        </View>
      <TouchableOpacity style={styles.buttonBackground} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Login/Signup</Text>
      </TouchableOpacity>
            </ScrollView>  
        </LinearGradient>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    fontSize: 36,
  },
  buttonBackground: {
    backgroundColor: colors.buttonGreen,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 26,
    padding: 20,
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
    flexDirection: 'row',
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