import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Home, LogIn, UserPlus, ShoppingCart, Store, Shield, X, ChevronRight } from 'lucide-react-native';

const DrawerContent = ({ navigation, activeRoute }) => {
    const menuItems = [
        {
            key: 'Home',
            label: 'Home',
            icon: Home,
            color: '#f0b90b',
            onPress: () => navigation.navigate('Home'),
        },
        {
            key: 'Login',
            label: 'Sign In',
            icon: LogIn,
            color: '#22c55e',
            onPress: () => navigation.navigate('Login', { role: 'buyer' }),
        },
        {
            key: 'Register',
            label: 'Register',
            icon: UserPlus,
            color: '#3b82f6',
            onPress: () => navigation.navigate('Register'),
        },
        {
            key: 'Buyer',
            label: 'Buyer Login',
            icon: ShoppingCart,
            color: '#22c55e',
            onPress: () => navigation.navigate('Login', { role: 'buyer' }),
        },
        {
            key: 'Seller',
            label: 'Seller Login',
            icon: Store,
            color: '#f59e0b',
            onPress: () => navigation.navigate('Login', { role: 'seller' }),
        },
        {
            key: 'Admin',
            label: 'Admin Login',
            icon: Shield,
            color: '#ef4444',
            onPress: () => navigation.navigate('Login', { role: 'admin' }),
        },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0c0f15', '#161b22', '#1c2128']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <View style={styles.brandIcon}>
                        <Car color="#f0b90b" size={26} />
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>VehicleChain</Text>
                        <Text style={styles.brandSub}>Pro Platform</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.closeDrawer()}>
                    <X color="#8b949e" size={22} />
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Menu Items */}
            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                <Text style={styles.menuSectionLabel}>NAVIGATION</Text>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeRoute === item.key;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.menuItem, isActive && { backgroundColor: `${item.color}18` }]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: `${item.color}22`, borderColor: `${item.color}44` }]}>
                                <Icon color={item.color} size={20} />
                            </View>
                            <Text style={[styles.menuLabel, isActive && { color: item.color }]}>
                                {item.label}
                            </Text>
                            <ChevronRight color={isActive ? item.color : '#3d444d'} size={16} style={styles.menuArrow} />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>© 2026 VehicleChain Pro</Text>
                <Text style={styles.footerSubText}>Blockchain-Powered Vehicles</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c0f15',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 20,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    brandIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: 'rgba(240, 185, 11, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandTitle: {
        color: '#f0f6fc',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    brandSub: {
        color: '#f0b90b',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(240,185,11,0.15)',
        marginHorizontal: 20,
        marginVertical: 8,
    },
    menuList: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 16,
    },
    menuSectionLabel: {
        color: '#3d444d',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        paddingHorizontal: 8,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 6,
        gap: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    menuLabel: {
        flex: 1,
        color: '#c9d1d9',
        fontSize: 15,
        fontWeight: '700',
    },
    menuArrow: {
        marginLeft: 'auto',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    footerText: {
        color: '#3d444d',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 12,
    },
    footerSubText: {
        color: '#f0b90b',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
        opacity: 0.6,
    },
});

export default DrawerContent;
