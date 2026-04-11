import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Platform, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, ChevronRight, Menu } from 'lucide-react-native';
import AnimatedBackground from '../components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const isWeb = Platform.OS === 'web';

    return (
        <View style={styles.root}>
            <AnimatedBackground
                colors={['#0c0f15', '#161b22', '#21262d']}
                particleColor="#f0b90b"
            />

            {/* TOP NAVBAR with Hamburger */}
            <View style={styles.navbar}>
                <View style={styles.navBrand}>
                    <View style={styles.brandIcon}>
                        <Car color="#f0b90b" size={22} />
                    </View>
                    <Text style={styles.brandText}>VehicleChain Pro</Text>
                </View>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.openDrawer()}
                >
                    <Menu color="#f0b90b" size={24} />
                </TouchableOpacity>
            </View>

            {/* HERO — Clean Center Content */}
            <View style={styles.hero}>
                {/* Vehicle Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/vehicle_hero_bg.png')}
                        style={styles.vehicleImage}
                        resizeMode="contain"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(12,15,21,0.8)']}
                        style={styles.imageOverlay}
                    />
                    <View style={styles.imageGlow} />
                </View>

                {/* Badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>🔗 Blockchain Secured Platform</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    Next-Gen Vehicle{'\n'}Procurement
                </Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    Secure, transparent & blockchain-powered{'\n'}automotive transactions
                </Text>

                {/* Buttons */}
                <View style={styles.btnRow}>
                    {/* Get Started */}
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#f0b90b', '#eab308', '#ca8a04']}
                            style={styles.btnGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.btnPrimaryText}>🚀 Get Started</Text>
                            <ChevronRight color="#1f2937" size={20} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Sign In */}
                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => navigation.navigate('Login', { role: 'buyer' })}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.btnSecondaryText}>👤 Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0c0f15',
    },

    // NAVBAR
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Platform.OS === 'web' ? 48 : 24,
        paddingTop: Platform.OS === 'android' ? 50 : (Platform.OS === 'ios' ? 56 : 20),
        paddingBottom: 18,
        backgroundColor: 'rgba(12, 15, 21, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(240,185,11,0.2)',
    },
    navBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(240,185,11,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandText: {
        color: '#f0f6fc',
        fontSize: Platform.OS === 'web' ? 20 : 17,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    menuBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(240,185,11,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // HERO
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.OS === 'web' ? 80 : 28,
        paddingTop: Platform.OS === 'android' ? 110 : (Platform.OS === 'ios' ? 120 : 90),
        paddingBottom: 40,
    },

    // IMAGE
    imageContainer: {
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 680 : 380,
        height: Platform.OS === 'web' ? 340 : 220,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 36,
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.2)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 35,
        elevation: 12,
        position: 'relative',
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    imageGlow: {
        position: 'absolute',
        bottom: -30,
        left: '10%',
        right: '10%',
        height: 60,
        backgroundColor: 'rgba(240,185,11,0.15)',
        borderRadius: 100,
    },

    // BADGE
    badge: {
        backgroundColor: 'rgba(240,185,11,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.4)',
        paddingHorizontal: 22,
        paddingVertical: 9,
        borderRadius: 30,
        marginBottom: 24,
    },
    badgeText: {
        color: '#f0b90b',
        fontSize: Platform.OS === 'web' ? 15 : 13,
        fontWeight: '800',
        letterSpacing: 0.8,
    },

    // TITLE
    title: {
        fontSize: Platform.OS === 'web' ? 64 : 38,
        fontWeight: '900',
        color: '#f0f6fc',
        textAlign: 'center',
        lineHeight: Platform.OS === 'web' ? 76 : 46,
        marginBottom: 16,
        letterSpacing: -1,
    },

    // SUBTITLE
    subtitle: {
        fontSize: Platform.OS === 'web' ? 20 : 15,
        color: '#8b949e',
        textAlign: 'center',
        lineHeight: Platform.OS === 'web' ? 32 : 24,
        marginBottom: 44,
        maxWidth: 560,
    },

    // BUTTONS
    btnRow: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 16,
        alignItems: 'center',
        width: '100%',
        maxWidth: 480,
    },
    btnPrimary: {
        height: Platform.OS === 'web' ? 64 : 56,
        minWidth: Platform.OS === 'web' ? 240 : '100%',
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#ca8a04',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    btnGrad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
        gap: 10,
    },
    btnPrimaryText: {
        color: '#1f2937',
        fontWeight: '900',
        fontSize: Platform.OS === 'web' ? 18 : 16,
        letterSpacing: 0.5,
    },
    btnSecondary: {
        height: Platform.OS === 'web' ? 64 : 56,
        minWidth: Platform.OS === 'web' ? 180 : '100%',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(240,185,11,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
        backgroundColor: 'rgba(240,185,11,0.1)',
    },
    btnSecondaryText: {
        color: '#f0f6fc',
        fontWeight: '800',
        fontSize: Platform.OS === 'web' ? 18 : 16,
    },
});

export default HomeScreen;
