import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList,
  Modal, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './utils/SupabaseConfig.jsx';
import { client } from './utils/KindeConfig.jsx';
import { colors } from './styles/colors.js';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const newTerminIcon = require('../assets/icons/newtermin.png');
export default function NewTerminScreen() {
  // All state variables
  const [cityList, setCityList] = useState([]);
  const [playgroundList, setPlaygroundList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPlayground, setSelectedPlayground] = useState(null);
  const [teamSize, setTeamSize] = useState('5 vs 5');
  const [dateOption, setDateOption] = useState('');
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPlaygroundDropdown, setShowPlaygroundDropdown] = useState(false);
  const [showTeamSizeDropdown, setShowTeamSizeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [timePickerModalVisible, setTimePickerModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      getPlaygroundList(selectedCity);
    }
  }, [selectedCity]);

  const handleCreate = async () => {
    try {
      const user = await client.getUserDetails();

      if (!user || !user.given_name) {
        throw new Error("User details are incomplete or unavailable.");
      }

      const userName = `${user.given_name} ${user.family_name.charAt(0)}.`;
      const userId = user.id;
      const maxPlayers = teamSize === '5 vs 5' ? 10 : 12;

      const currentDate = new Date();
      const selectedDate = new Date(currentDate);
      if (dateOption === 'Danas') {
        selectedDate.setDate(currentDate.getDate());
      } else if (dateOption === 'Sutra') {
        selectedDate.setDate(currentDate.getDate() + 1);
      } else {
        const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
        selectedDate.setDate(currentDate.getDate() + (daysOfWeek.indexOf(dateOption) - currentDate.getDay() + 7) % 7);
      }

      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const seconds = time.getSeconds().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      const { data, error } = await supabase.from('termins').insert([
        {
          city_id: selectedCity,
          playground_id: selectedPlayground,
          time: formattedTime,
          date: selectedDate.toISOString().split('T')[0],
          created_by: userName,
          description,
          max_players: maxPlayers,
          current_players: 1,
          user_id: userId
        }
      ]);

      if (error) {
        console.error("Error saving termin:", error);
      } else {
        console.log("Termin saved successfully:", data);
        router.navigate('..', { relativeToDirectory: true });
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  const getCityList = async () => {
    const { data, error } = await supabase.from('cities').select('*');
    if (error) {
      console.error("Error fetching cities:", error);
    } else {
      setCityList(data.map(city => ({ key: city.id, value: capitalizeWords(city.name) })));
    }
  };

  const getPlaygroundList = async (cityId) => {
    const { data, error } = await supabase.from('playgrounds').select('*').eq('city_id', cityId);
    if (error) {
      console.error("Error fetching playgrounds:", error);
    } else {
      setPlaygroundList(data.map(pg => ({ key: pg.id, value: pg.name })));
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleTimeChange = (event, selectedDate) => {
    if (event.type === 'set') {
      setTime(selectedDate || time);
    }
  };

  const saveTime = () => {
    setTimePickerModalVisible(false);
  };

  const getDaysOfWeek = () => {
    const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    const today = new Date();
    const dayOffset = today.getDay();
    const days = ['Danas', 'Sutra'];

    for (let i = 2; i <= 6; i++) {
      const dayIndex = (dayOffset + i) % 7;
      days.push(daysOfWeek[dayIndex]);
    }

    return days;
  };

  const renderDropdownItem = (item, onSelect) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        onSelect(item.key);
        setShowCityDropdown(false);
        setShowPlaygroundDropdown(false);
        setShowTeamSizeDropdown(false);
        setShowDateDropdown(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item.value}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.gradient0, colors.gradient1]}
      style={styles.container}
    >
    
      <KeyboardAvoidingView
        style={{marginTop: 60}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
      
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
          
            <View style={styles.componentContainer}>
              <View style={styles.headerText}>
                <Image source={newTerminIcon} style={styles.headerIconStyle} />
                <Text style={styles.title}>Novi termin</Text>
              </View>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowCityDropdown(!showCityDropdown)}>
                <Text style={styles.dropdownText}>{selectedCity ? cityList.find(c => c.key === selectedCity)?.value : 'Odaberi grad'}</Text>
                <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
              </TouchableOpacity>
              {showCityDropdown && (
                <FlatList
                  data={cityList}
                  renderItem={({ item }) => renderDropdownItem(item, setSelectedCity)}
                  keyExtractor={(item) => item.key.toString()}
                  style={styles.dropdownList}
                />
              )}

              <TouchableOpacity style={styles.dropdown} onPress={() => setShowPlaygroundDropdown(!showPlaygroundDropdown)}>
                <Text style={styles.dropdownText}>{selectedPlayground ? playgroundList.find(pg => pg.key === selectedPlayground)?.value : 'Odaberi igralište'}</Text>
                <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
              </TouchableOpacity>
              {showPlaygroundDropdown && (
                <FlatList
                  data={playgroundList}
                  renderItem={({ item }) => renderDropdownItem(item, setSelectedPlayground)}
                  keyExtractor={(item) => item.key.toString()}
                  style={styles.dropdownList}
                />
              )}

              <Text style={styles.label}>Odaberi timsku opciju</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowTeamSizeDropdown(!showTeamSizeDropdown)}>
                <Text style={styles.dropdownText}>{teamSize}</Text>
                <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
              </TouchableOpacity>
              {showTeamSizeDropdown && (
                <FlatList
                  data={[{ key: '5 vs 5', value: '5 vs 5' }, { key: '6 vs 6', value: '6 vs 6' }]}
                  renderItem={({ item }) => renderDropdownItem(item, setTeamSize)}
                  keyExtractor={(item) => item.key.toString()}
                  style={styles.dropdownList}
                />
              )}

              <Text style={styles.label}>Odaberi dan</Text>
              <View style={styles.dateSelector}>
                <View style={styles.dateOptionContainer}>
                  <TouchableOpacity style={styles.dropdown} onPress={() => setShowDateDropdown(!showDateDropdown)}>
                    <Text style={styles.dropdownText}>{dateOption || 'Odaberi dan'}</Text>
                    <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
                  </TouchableOpacity>
                  {showDateDropdown && (
                    <FlatList
                      data={getDaysOfWeek().map(day => ({ key: day, value: day }))}
                      renderItem={({ item }) => renderDropdownItem(item, setDateOption)}
                      keyExtractor={(item) => item.key.toString()}
                      style={styles.dropdownList}
                    />
                  )}
                </View>
                <TouchableOpacity onPress={() => setTimePickerModalVisible(true)}>
                  <View style={styles.timePicker}>
                    <Text style={styles.timePickerText}>{time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Unesi opis termina"
                placeholderTextColor={colors.textPrimary}
                value={description}
                onChangeText={setDescription}
                multiline
                style={styles.input}
              />

              <TouchableOpacity style={styles.buttonBackground} onPress={handleCreate}>
                <Text style={styles.buttonBig}>Kreiraj termin</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal visible={timePickerModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
            <Button title="Spremi" onPress={saveTime} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  componentContainer: {
    borderRadius: 10,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.accent
  },
  dropdownText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'IstokWeb-Regular'
  },
  dropdownList: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    marginBottom: 10,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 10,
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
    alignSelf: 'center'
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20
  },
  headerIconStyle: {
    height: 37,
    width: 37,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    color: colors.textPrimary,
    fontFamily: "IstokWeb-Bold",
    marginTop: 2,
  },
  dateOptionContainer: {
    flex: 1,
    marginRight: 10,
  },
  timePicker: {
    backgroundColor: colors.dropdownBackground,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    
  },
  timePickerText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'IstokWeb-Bold'
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: colors.textPrimary,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
    borderColor: colors.accent,
    borderWidth: 1,
    fontFamily: 'IstokWeb-Regular',
    fontSize: 18
  },
  button: {
    backgroundColor: colors.buttonBackground,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.componentBackground,
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
});
