import { StyleSheet, Text, View, Image, TouchableOpacity, Touchable } from 'react-native'
import React from 'react'
import { colors } from '../../styles/colors'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native';


const stadiumIcon = require('../../../assets/icons/stadium.png')
const locationIcon = require('../../../assets/icons/location.png')
const sunIcon = require('../../../assets/icons/sun.png')


const Termin = ({ id, fieldName, time, date, organizerName, playerAmount, maxPlayerAmount }) => {
    const checkPlayerAmountIcon = () => {
        let playerAmountIcon;
        
        if (maxPlayerAmount === 10) {
            playerAmountIcon = require('../../../assets/icons/5v5.png');
        } else {
            playerAmountIcon = require('../../../assets/icons/6v6.png');
        }
        return playerAmountIcon;
    };
    let shoeIcon;
    const checkPlayerAmountColor = () => {
        let playerAmountColor;
        
        if (playerAmount === 10 || playerAmount === 12) {
            playerAmountColor = colors.textRed;
            shoeIcon = require('../../../assets/icons/shoeRed.png')
        }
        else {
            playerAmountColor = colors.textGreen;
            shoeIcon = require('../../../assets/icons/shoeGreen.png')
        }
        
        return playerAmountColor;
    }

    const playerAmountIcon = checkPlayerAmountIcon();
    const playerAmountColor = checkPlayerAmountColor();
    const distance = 0.8;
    const temperature = 28;
    const router = useRouter();

    const handlePress = () => {
        router.push({pathname: "/terminscreen", params: {id: id}})
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={styles.top}>
                <View style={styles.topLeft}>
                    <View style={styles.heading}>
                        <View style={styles.textWithIcon}>
                            <Image source={stadiumIcon} style={styles.stadiumIconStyle}/>
                            <Text style={styles.fieldNameText}>{fieldName}</Text>
                        </View>
                        <View style={styles.textWithIcon}>
                            <Image source={locationIcon} style={styles.locationIconStyle}/>
                            <Text style={styles.text}>{distance}km</Text>
                        </View>
                    </View>
                    <Text style={styles.termTimeText}>{time}</Text>
                </View>
                <View style={styles.topRight}>
                    <Image source={playerAmountIcon} style={styles.playerAmountStyleIcon}/>
                </View>
            </View>
            <View style={styles.textWithIcon}>
                <Image source={sunIcon} style={styles.sunIconStyle}/>
                <Text style={styles.text}>{temperature}°</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.organizerText}>
                Organizira 
                    <Text style={styles.organizerNameStyle}> @{organizerName} </Text>
                </Text>
                <View style={styles.textWithIcon}>
                    <Image source={shoeIcon} style={styles.shoeIconStyle} />
                    <Text style={[styles.playerAmountText, { color: playerAmountColor }]}>{playerAmount}/{maxPlayerAmount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default Termin

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(36, 37, 45, 0.5)",
        color: colors.textPrimary,
        borderColor: "#3D3D3E",
        borderWidth: 1,
        borderRadius: 10,
        padding: 20,
        paddingBottom: 10,
        gap: 10,
        maxWidth: 400,
        minWidth: 400,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 33,
    },
    topLeft: {
        gap: 10,
    },
    text: {
        color: colors.textPrimary,
        fontFamily: "IstokWeb-Regular",
    },
    fieldNameText: {
        color: colors.textPrimary,
        fontSize: 16,
        
    },
    termTimeText: {
        color: colors.textPrimary,
        fontSize: 36,
        fontFamily: "IstokWeb-Bold",
        fontWeight: "bold",
    },
    heading: {
        display: 'flex',
        flexDirection: 'row',
        gap: 30,
        alignItems: "center",
    },
    textWithIcon: {
        flexDirection: "row",
        gap: 5,
        alignItems: 'center',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    playerAmountText: {
        fontSize: 20,
        fontFamily: "IstokWeb-Regular",
        opacity: 0.84,
    },
    playerAmountStyleIcon: {
        width: 40,
        height: 40,
        alignSelf: 'right'
    },
    stadiumIconStyle: {
        width: 27,
        height: 16,
    },
    locationIconStyle: {
        height: 15,
        width: 12,
    },
    sunIconStyle: {
        height: 20,
        width: 20,
    },
    organizerText: {
        fontFamily: "IstokWeb-Regular",
        color: colors.textSecondary,
    },
    organizerNameStyle: {
        color: colors.textPrimary,
        fontFamily: "IstokWeb-Bold"
    },
    shoeIconStyle: {
        width: 20,
        height: 20,
        opacity: 0.84,
    }
})