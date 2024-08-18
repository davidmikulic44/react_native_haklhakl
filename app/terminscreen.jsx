import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, FlatList } from 'react-native';
import { supabase } from './utils/SupabaseConfig';
import { useRoute } from '@react-navigation/native';
import { client } from './utils/KindeConfig';

const TerminDetails = () => {
  const route = useRoute();
  const { id } = route.params; // Extract id from route params

  const [terminDetails, setTerminDetails] = useState(null);
  const [cityName, setCityName] = useState('');
  const [playgroundName, setPlaygroundName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const checkWhoIsUser = async () => {
      const user = await client.getUserDetails();
      setUserId(user.id);
    };

    const fetchTerminDetails = async () => {
      try {
        // Query to fetch termin details by id
        const { data: terminData, error: terminError } = await supabase
          .from('termins')
          .select('*')
          .eq('id', id)
          .single();

        if (terminError) {
          throw terminError;
        }

        setTerminDetails(terminData);

        // Fetch the city name based on city_id
        const { data: cityData, error: cityError } = await supabase
          .from('cities')
          .select('name')
          .eq('id', terminData.city_id)
          .single();

        if (cityError) {
          throw cityError;
        }

        setCityName(cityData.name);

        // Fetch the playground name based on playground_id
        const { data: playgroundData, error: playgroundError } = await supabase
          .from('playgrounds')
          .select('name')
          .eq('id', terminData.playground_id)
          .single();

        if (playgroundError) {
          throw playgroundError;
        }

        setPlaygroundName(playgroundData.name);

        // Check if the user has already joined the termin
        const { data: userTerminData, error: userTerminError } = await supabase
          .from('users_termins')
          .select('*')
          .eq('termin_id', id)
          .eq('user_id', userId)
          .single();

        if (userTerminData) {
          setHasJoined(true);
        }

        if (userTerminError && userTerminError.code !== 'PGRST116') { // 'PGRST116' indicates no rows found
          throw userTerminError;
        }

        // Fetch all user_ids who have joined the termin
        const { data: joinedUsers, error: joinedUsersError } = await supabase
          .from('users_termins')
          .select('user_id')
          .eq('termin_id', id);

        if (joinedUsersError) {
          throw joinedUsersError;
        }

        // Extract user_ids from the joinedUsers
        const userIds = joinedUsers.map(ju => ju.user_id);

        if (userIds.length > 0) {
          // Fetch user details for these user_ids
          const { data: userDetails, error: userDetailsError } = await supabase
            .from('users')
            .select('id, firstname, lastname')
            .in('id', userIds);

          if (userDetailsError) {
            throw userDetailsError;
          }

          // Ensure the organizer is first
          const organizer = terminData.user_id;
          const usersList = userDetails
            .map(user => ({
              ...user,
              isOrganizer: user.id === organizer
            }))
            .sort((a, b) => a.isOrganizer ? -1 : 1) // Organizer first
            .map(user => ({
              ...user,
              formattedName: `${user.firstname} ${user.lastname.charAt(0).toUpperCase()}.` // Format the name
            }));

          setUsers(usersList);
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminDetails();
    checkWhoIsUser();
  }, [id, userId]);

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

      Alert.alert('Success', 'You have successfully joined the termin!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLeave = async () => {
    try {
      // Delete the user's record from users_termins
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

      Alert.alert('Success', 'You have successfully left the termin!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {terminDetails ? (
        <>
          <Text>Organizira {terminDetails.created_by}</Text>
          <Text>City: {cityName.toUpperCase()}</Text>
          <Text>Playground: {playgroundName.toUpperCase()}</Text>
          <Text>Team Size: {terminDetails.max_players / 2}</Text>
          <Text>Date Option: {terminDetails.date}</Text>
          <Text>Time: {terminDetails.time}</Text>
          <Text>Description: {terminDetails.description}</Text>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Text style={styles.userText}>{item.formattedName}</Text> // Display formatted name
            )}
            ListHeaderComponent={() => (
              <Text style={styles.userHeader}>Users Joined:</Text>
            )}
            ListHeaderComponentStyle={styles.userHeaderContainer}
          />

          {terminDetails.user_id === userId ? (
            <Text>You are the organizer.</Text>
          ) : (
            hasJoined ? (
              <Button title="Leave" onPress={handleLeave} />
            ) : (
              <Button title="Join" onPress={handleJoin} />
            )
          )}
        </>
      ) : (
        <Text>No details available for this termin.</Text>
      )}
    </View>
  );
};

export default TerminDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    marginTop: 100,
  },
  userText: {
    fontSize: 16,
    marginVertical: 0,
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
