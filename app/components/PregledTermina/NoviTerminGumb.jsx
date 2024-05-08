import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../../styles/colors'
import { useRouter } from 'expo-router'
const plusIcon = require('../../../assets/icons/plus.png')
const NoviTerminGumb = () => {
    const router = useRouter();

    const handlePress = () => {
        router.push("/profile")
    };


    return (
        <TouchableOpacity onPress={handlePress}>
        <Image source={plusIcon} style={styles.plusIconStyle}/>
        </TouchableOpacity>
    )
}

export default NoviTerminGumb

const styles = StyleSheet.create({
    plusIconStyle: {
        width: 50,
        height: 50,
        borderRadius: 10,
        borderColor: "#3D3D3E",
        borderWidth: 1,
        position: 'fixed',
    }
})