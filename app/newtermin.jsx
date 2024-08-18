import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './utils/SupabaseConfig.jsx';
import {client} from './utils/KindeConfig.jsx'
import { colors } from './styles/colors.js';
import { FontAwesome } from '@expo/vector-icons';

export default function NewTerminScreen() {
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerModalVisible, setTimePickerModalVisible] = useState(false);

  const [selectedDay, setSelectedDay] = useState('');

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
        // Fetch user details
        const user = await client.getUserDetails();
        
        if (!user || !user.given_name) {
          throw new Error("User details are incomplete or unavailable.");
        }
    
        // Format user name
        const userName = `${user.given_name} ${user.family_name.charAt(0)}.`; // David M.
        const userId = user.id
        // Determine the maximum number of players based on team size
        const maxPlayers = teamSize === '5 vs 5' ? 10 : 12;
    
        // Construct the date from selectedDay and time
        const currentDate = new Date();
    const selectedDate = new Date(currentDate);
    if (dateOption === 'Danas') {
      selectedDate.setDate(currentDate.getDate());
    } else if (dateOption === 'Sutra') {
      selectedDate.setDate(currentDate.getDate() + 1);
    } else {
      // For other days, we'll assume it's the same week
      const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
      selectedDate.setDate(currentDate.getDate() + (daysOfWeek.indexOf(dateOption) - currentDate.getDay() + 7) % 7);
    }

    // Extract the time part
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
        // Insert termin into the database
        const { data, error } = await supabase.from('termins').insert([
            {
              city_id: selectedCity,
              playground_id: selectedPlayground,
              time: formattedTime, // Insert time part only
              date: selectedDate.toISOString().split('T')[0], // Save only date part
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
            // Clear form or show success message
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

  const handleSave = async () => {
    const { data, error } = await supabase.from('termins').insert([
      {
        city_id: selectedCity,
        playground_id: selectedPlayground,
        team_size: teamSize,
        date_option: dateOption,
        time,
        description,
      }
    ]);
    if (error) {
      console.error("Error saving termin:", error);
    } else {
      console.log("Termin saved successfully:", data);
      // Clear form or show success message
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    if (event.type === 'set') {
      // Update the time state with the selected date.
      setTime(selectedDate || time);
      // Do not close the modal here; only close it on 'Spremi' button press.
    }
  };

  const saveTime = () => {
    setShowTimePicker(false);
    setTimePickerModalVisible(false);
  };

  const getDaysOfWeek = () => {
    const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    const today = new Date();
    const dayOffset = today.getDay();
    const days = [];

    days.push('Danas');
    days.push('Sutra');

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

  const renderHeader = () => (
    <>
      <Text style={styles.label}>Odaberi grad</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowCityDropdown(!showCityDropdown)}>
        <Text style={styles.dropdownText}>{selectedCity ? cityList.find(c => c.key === selectedCity)?.value : 'Odaberi grad'}</Text>
        <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
      </TouchableOpacity>
      {showCityDropdown && (
        <FlatList
          data={cityList}
          renderItem={({ item }) => renderDropdownItem(item, setSelectedCity)}
          keyExtractor={(item) => item.key}
          style={styles.dropdownList}
        />
      )}

      <Text style={styles.label}>Odaberi igralište</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowPlaygroundDropdown(!showPlaygroundDropdown)}>
        <Text style={styles.dropdownText}>{selectedPlayground ? playgroundList.find(pg => pg.key === selectedPlayground)?.value : 'Odaberi igralište'}</Text>
        <FontAwesome name="chevron-down" size={12} color={colors.textPrimary} />
      </TouchableOpacity>
      {showPlaygroundDropdown && (
        <FlatList
          data={playgroundList}
          renderItem={({ item }) => renderDropdownItem(item, setSelectedPlayground)}
          keyExtractor={(item) => item.key}
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
          keyExtractor={(item) => item.key}
          style={styles.dropdownList}
        />
      )}

      <Text style={styles.label}>Odaberi dan</Text>
      <View style={styles.dateSelector}>

        <View style={styles.dateGrid}>
          {getDaysOfWeek().map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.gridButton,
                selectedDay === day && { backgroundColor: colors.selected },
              ]}
              onPress={() => {
                setDateOption(day);
                setSelectedDay(day);
              }}
            >
              <Text style={styles.gridButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.label}>Odaberi vrijeme</Text>
      <TouchableOpacity style={styles.timePicker} onPress={() => setTimePickerModalVisible(true)}>
        <Text style={styles.dropdownText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Opis</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholder="Unesite opis termina"
        placeholderTextColor={colors.textPrimary}
      />

      <Button title="Spremi termin" onPress={handleCreate} />
    </>
  );

  return (
    <LinearGradient
      colors={[colors.gradient0, colors.gradient1]}
      style={styles.container}
    >
      <FlatList
        ListHeaderComponent={renderHeader}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
      />

      {timePickerModalVisible && (
        <Modal
          transparent={true}
          visible={timePickerModalVisible}
          onRequestClose={() => setTimePickerModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePickerComponent}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveTime}
              >
                <Text style={styles.saveButtonText}>Spremi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: colors.textPrimary,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#121E2D',
  },
  dropdownText: {
    flex: 1,
    color: colors.textPrimary,
  },
  dropdownList: {
    maxHeight: 200,
    backgroundColor: '#121E2D',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginVertical: 4,
    padding: 4,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    color: colors.textPrimary,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#121E2D',
  },
  timePickerComponent: {
    width: '100%',
    backgroundColor: '#121E2D',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: "IstokWeb-Bold",
    fontSize: 25
  },
  dateSelector: {
    marginVertical: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#121E2D',
    marginVertical: 4,
  },
  dateButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  gridButton: {
    width: '24%',
    margin: '1%',
    padding: 12,
    backgroundColor: '#1C2C3A',
    borderRadius: 4,
    alignItems: 'center',
  },
  gridButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
