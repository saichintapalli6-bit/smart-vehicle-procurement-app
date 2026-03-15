import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Platform, Dimensions, ImageBackground, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Shield, Cpu, Activity, ChevronRight, Users, Award, Zap, Database, Globe, Lock } from 'lucide-react-native';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.root, { width: (Platform.OS === 'web') ? '100%' : width * 1.1 }]}>
                <AnimatedBackground
                    colors={['#0c0f15', '#161b22', '#21262d', '#30363d']}
                    particleColor="#f0b90b"
                />

                {/* NAVBAR */}
                <View style={styles.navbar}>
                    <View style={styles.navBrand}>
                        <View style={styles.brandIcon}>
                            <Car color="#f0b90b" size={(Platform.OS === 'web') ? 28 : 24} />
                        </View>
                        <Text style={styles.brandText} numberOfLines={1}>VehicleChain Pro</Text>
                    </View>
                    <View style={styles.navLinks}>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnActive]} onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.navBtnActiveText}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnBuyer]} onPress={() => navigation.navigate('Login', { role: 'buyer' })}>
                            <Text style={styles.navBtnText}>🛒 Buyer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnSeller]} onPress={() => navigation.navigate('Login', { role: 'seller' })}>
                            <Text style={styles.navBtnText}>🚗 Seller</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnAdmin]} onPress={() => navigation.navigate('Login', { role: 'admin' })}>
                            <Text style={styles.navBtnText}>👨‍💼 Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* HERO SECTION */}
                    <View style={styles.hero}>
                        <Image
                            source={require('../../assets/vehicle_hero_bg.png')}
                            style={styles.heroImgBg}
                            resizeMode="cover"
                            blurRadius={3}
                        />
                        <LinearGradient
                            colors={['rgba(12, 15, 21, 0.92)', 'rgba(22, 27, 34, 0.95)', 'rgba(33, 38, 45, 1)']}
                            style={styles.heroOverlay}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />

                        <View style={styles.vehicleShowcaseBox}>
                            <Image
                                source={require('../../assets/vehicle_hero_bg.png')}
                                style={styles.vehicleShowcaseImg}
                                resizeMode="contain"
                            />
                            <LinearGradient
                                colors={['rgba(240, 185, 11, 0.25)', 'rgba(251, 191, 36, 0.15)']}
                                style={styles.vehicleGlow}
                            />
                        </View>

                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>🔗 Blockchain Secured</Text>
                        </View>
                        <Text style={styles.heroTitle}>Next-Gen Vehicle{'\n'}Procurement Platform</Text>
                        <Text style={styles.heroSubtitle}>
                            Revolutionizing automotive transactions with{'\n'}enterprise-grade blockchain technology
                        </Text>

                        <View style={styles.heroBtns}>
                            <TouchableOpacity
                                style={styles.heroBtnPrimary}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <LinearGradient
                                    colors={['#f0b90b', '#eab308', '#ca8a04']}
                                    style={styles.heroBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.heroBtnPrimaryText}>🚀 Get Started Free</Text>
                                    <ChevronRight color="#1f2937" size={20} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.heroBtnSecondary}
                                onPress={() => navigation.navigate('Login', { role: 'buyer' })}
                            >
                                <Text style={styles.heroBtnSecondaryText}>👤 Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Enhanced Stats */}
                        <View style={styles.statsRow}>
                            {[
                                { val: '1K+', label: 'Premium Vehicles', icon: Car, color: '#22c55e' },
                                { val: '2.5K+', label: 'Secure Transactions', icon: Lock, color: '#f59e0b' },
                                { val: '100%', label: 'Blockchain Uptime', icon: Database, color: '#f0b90b' },
                                { val: '50+', label: 'Happy Partners', icon: Users, color: '#a855f7' },
                            ].map((s, i) => (
                                <View key={i} style={styles.statItem}>
                                    <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
                                        <s.icon color={s.color} size={24} />
                                    </View>
                                    <Text style={styles.statValue}>{s.val}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* FEATURES SECTION */}
                    <View style={styles.featuresSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionBadge}>
                                <Text style={styles.sectionBadgeText}>Trusted By Thousands</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Enterprise-Grade Features</Text>
                            <Text style={styles.sectionSubtitle}>
                                Powering the future of automotive commerce with cutting-edge blockchain innovation
                            </Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
                            <View style={styles.featuresGrid}>
                                {[
                                    {
                                        icon: <Cpu color="#22c55e" size={(Platform.OS === 'web') ? 48 : 40} />,
                                        title: 'Immutable Ledger',
                                        desc: 'Every transaction permanently recorded on blockchain - zero tampering possible',
                                        color: '#22c55e',
                                        gradient: ['rgba(34, 197, 94, 0.12)', 'rgba(22, 163, 74, 0.08)'],
                                    },
                                    {
                                        icon: <Shield color="#f59e0b" size={(Platform.OS === 'web') ? 48 : 40} />,
                                        title: 'Smart Contracts',
                                        desc: 'Automated escrow & payment release - no middlemen, pure trustless execution',
                                        color: '#f59e0b',
                                        gradient: ['rgba(245, 158, 11, 0.12)', 'rgba(251, 146, 60, 0.08)'],
                                    },
                                    {
                                        icon: <Zap color="#ef4444" size={(Platform.OS === 'web') ? 48 : 40} />,
                                        title: 'Real-Time Verification',
                                        desc: 'Instant transaction validation with enterprise-grade consensus algorithms',
                                        color: '#ef4444',
                                        gradient: ['rgba(239, 68, 68, 0.12)', 'rgba(220, 38, 38, 0.08)'],
                                    },
                                    {
                                        icon: <Globe color="#f0b90b" size={(Platform.OS === 'web') ? 48 : 40} />,
                                        title: 'Global Network',
                                        desc: 'Connect with verified buyers & sellers worldwide - borderless commerce',
                                        color: '#f0b90b',
                                        gradient: ['rgba(240, 185, 11, 0.12)', 'rgba(234, 179, 8, 0.08)'],
                                    },
                                ].map((f, i) => (
                                    <View key={i} style={[styles.featureCard, { minWidth: 320 }]}>
                                        <LinearGradient
                                            colors={f.gradient}
                                            style={styles.featureGradient}
                                        />
                                        <View style={[styles.featureIconBox, { backgroundColor: `${f.color}25`, borderColor: `${f.color}40` }]}>
                                            {f.icon}
                                        </View>
                                        <Text style={[styles.featureTitle, { color: f.color }]}>{f.title}</Text>
                                        <Text style={styles.featureDesc}>{f.desc}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* CTA SECTION */}
                    <View style={styles.ctaSection}>
                        <LinearGradient
                            colors={['rgba(22, 27, 34, 0.95)', 'rgba(33, 38, 45, 0.98)', 'rgba(48, 54, 61, 1)']}
                            style={styles.ctaBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Award color="#f0b90b" size={56} style={styles.ctaIcon} />
                            <Text style={styles.ctaTitle}>Join the Blockchain Revolution Today</Text>
                            <Text style={styles.ctaSubtitle}>
                                Experience secure, transparent vehicle transactions like never before
                            </Text>
                            <View style={styles.ctaButtons}>
                                <TouchableOpacity
                                    style={styles.ctaBtnPrimary}
                                    onPress={() => navigation.navigate('Register')}
                                >
                                    <LinearGradient
                                        colors={['#f0b90b', '#eab308']}
                                        style={styles.ctaBtnGradPrimary}
                                    >
                                        <Text style={styles.ctaBtnTextPrimary}>🎯 Start Free Trial</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.ctaBtnSecondary}
                                    onPress={() => navigation.navigate('Demo')}
                                >
                                    <Text style={styles.ctaBtnTextSecondary}>📱 Live Demo</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <View style={styles.footerContent}>
                            <View style={styles.footerBrand}>
                                <Car color="#f0b90b" size={32} />
                                <Text style={styles.footerBrandText}>VehicleChain Pro</Text>
                            </View>
                            <Text style={styles.footerText}>
                                © 2026 VehicleChain Pro. Built with ❤️ using Blockchain Technology.
                            </Text>
                            <View style={styles.footerLinks}>
                                <Text style={styles.footerLink}>Privacy</Text>
                                <Text style={styles.footerLink}>Terms</Text>
                                <Text style={styles.footerLink}>Support</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0c0f15', // GitHub-inspired dark gray
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 80,
    },

    // NAVBAR - Professional Gold Theme
    navbar: {
        position: 'absolute',
        top: 24,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 24,
        paddingVertical: 20,
        backgroundColor: 'rgba(22, 27, 34, 0.96)',
        backdropFilter: 'blur(32px)',
        borderRadius: 24,
        marginHorizontal: 24,
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.25)',
    },
    navBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    brandIcon: {
        width: 56, height: 56, borderRadius: 18,
        backgroundColor: 'rgba(240, 185, 11, 0.18)',
        borderWidth: 1, borderColor: 'rgba(240, 185, 11, 0.4)',
        alignItems: 'center', justifyContent: 'center',
    },
    brandText: {
        color: '#f0f6fc',
        fontSize: (Platform.OS === 'web') ? 24 : 20,
        fontWeight: '900',
        letterSpacing: -0.8,
    },
    navLinks: { flexDirection: 'row', gap: 16 },
    navBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 24,
        minWidth: 100,
        alignItems: 'center',
        borderWidth: 1,
    },
    navBtnActive: { 
        backgroundColor: 'rgba(240, 185, 11, 0.22)', 
        borderColor: 'rgba(240, 185, 11, 0.5)',
    },
    navBtnBuyer: { 
        backgroundColor: 'rgba(34, 197, 94, 0.18)', 
        borderColor: 'rgba(34, 197, 94, 0.4)',
    },
    navBtnSeller: { 
        backgroundColor: 'rgba(245, 158, 11, 0.18)', 
        borderColor: 'rgba(245, 158, 11, 0.4)',
    },
    navBtnAdmin: { 
        backgroundColor: 'rgba(239, 68, 68, 0.18)', 
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    navBtnText: { color: '#f0f6fc', fontWeight: '700', fontSize: 15 },
    navBtnActiveText: { color: '#f0b90b', fontWeight: '800', fontSize: 15 },

    // HERO - Perfect contrast for all lighting
    hero: {
        alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 28,
        paddingTop: (Platform.OS === 'web') ? 160 : 120,
        paddingBottom: (Platform.OS === 'web') ? 140 : 100,
        marginHorizontal: 24,
        borderRadius: 40,
        marginBottom: 48,
        overflow: 'hidden',
        shadowColor: '#ca8a04', 
        shadowOffset: { width: 0, height: 25 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 50,
        borderWidth: 1, 
        borderColor: 'rgba(48, 54, 61, 0.6)',
    },
    heroImgBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },

    vehicleShowcaseBox: {
        width: '100%',
        maxWidth: (Platform.OS === 'web') ? 1000 : 450,
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    vehicleShowcaseImg: {
        width: '100%',
        height: (Platform.OS === 'web') ? 420 : 280,
        borderRadius: 32,
        shadowColor: '#f0b90b', 
        shadowOffset: { width: 0, height: 25 }, 
        shadowOpacity: 0.45, 
        shadowRadius: 40,
    },
    vehicleGlow: {
        position: 'absolute',
        bottom: -40,
        left: '18%',
        right: '18%',
        height: 100,
        borderRadius: 100,
    },

    heroBadge: {
        backgroundColor: 'rgba(240, 185, 11, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.45)',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 32,
        marginBottom: 40,
        shadowColor: '#f0b90b', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 12,
    },
    heroBadgeText: {
        color: '#f0b90b',
        fontSize: (Platform.OS === 'web') ? 18 : 15,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    heroTitle: {
        fontSize: (Platform.OS === 'web') ? 80 : 42,
        fontWeight: '900',
        color: '#f0f6fc',  // Perfect white for all lighting
        textAlign: 'center',
        lineHeight: (Platform.OS === 'web') ? 92 : 48,
        marginBottom: 24,
        letterSpacing: -1.2,
    },
    heroSubtitle: {
        fontSize: (Platform.OS === 'web') ? 24 : 18,
        color: '#c9d1d9',  // High contrast light gray
        textAlign: 'center',
        lineHeight: (Platform.OS === 'web') ? 36 : 26,
        marginBottom: 56,
        maxWidth: 800,
        paddingHorizontal: 16,
    },

    heroBtns: { flexDirection: 'row', gap: 24, marginBottom: 96, flexWrap: 'wrap', justifyContent: 'center' },
    heroBtnPrimary: {
        height: (Platform.OS === 'web') ? 72 : 60,
        minWidth: (Platform.OS === 'web') ? 280 : 220,
        borderRadius: 36,
        overflow: 'hidden',
        shadowColor: '#ca8a04', 
        shadowOffset: { width: 0, height: 16 }, 
        shadowOpacity: 0.5, 
        shadowRadius: 25,
    },
    heroBtnGrad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 44,
        gap: 12,
    },
    heroBtnPrimaryText: {
        color: '#1f2937',  // Dark text on gold button
        fontWeight: '900',
        fontSize: (Platform.OS === 'web') ? 20 : 17,
        letterSpacing: 0.8,
    },
    heroBtnSecondary: {
        height: (Platform.OS === 'web') ? 72 : 60,
        minWidth: (Platform.OS === 'web') ? 200 : 180,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: 'rgba(240, 185, 11, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: 'rgba(240, 185, 11, 0.12)',
        backdropFilter: 'blur(20px)',
    },
    heroBtnSecondaryText: {
        color: '#f0f6fc',
        fontWeight: '800',
        fontSize: (Platform.OS === 'web') ? 20 : 17,
    },

    statsRow: {
        flexDirection: 'row',
        gap: (Platform.OS === 'web') ? 48 : 28,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    statItem: { 
        alignItems: 'center', 
        paddingHorizontal: 28,
        backgroundColor: 'rgba(240, 185, 11, 0.08)',
        borderRadius: 24,
        paddingVertical: 32,
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.2)',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 16,
    },
    statIcon: {
        width: 56, height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
    },
    statValue: {
        fontSize: (Platform.OS === 'web') ? 48 : 32,
        fontWeight: '900',
        color: '#f0b90b',
        marginBottom: 8,
        letterSpacing: -0.8,
    },
    statLabel: {
        fontSize: (Platform.OS === 'web') ? 16 : 14,
        color: '#c9d1d9',
        fontWeight: '700',
        textAlign: 'center',
    },

    featuresSection: {
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 28,
        paddingVertical: 100,
        alignItems: 'center',
        backgroundColor: 'rgba(33, 38, 45, 0.7)',
        marginHorizontal: 24,
        borderRadius: 40,
        marginBottom: 48,
        borderWidth: 1,
        borderColor: 'rgba(48, 54, 61, 0.8)',
        shadowColor: '#21262d', 
        shadowOffset: { width: 0, height: 20 }, 
        shadowOpacity: 0.35, 
        shadowRadius: 30,
    },
    ctaSection: { paddingHorizontal: (Platform.OS === 'web') ? 60 : 28, paddingVertical: 80, marginHorizontal: 24, marginBottom: 48 },
    ctaBox: {
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.3)',
        padding: (Platform.OS === 'web') ? 80 : 56,
        alignItems: 'center',
        shadowColor: '#ca8a04', 
        shadowOffset: { width: 0, height: 30 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 45,
    },

    // Additional styles for completeness
    sectionHeader: { alignItems: 'center', marginBottom: 60 },
    sectionBadge: {
        backgroundColor: 'rgba(240, 185, 11, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.45)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 28,
        marginBottom: 20,
    },
    sectionBadgeText: {
        color: '#f0b90b',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    sectionTitle: {
        fontSize: (Platform.OS === 'web') ? 56 : 36,
        fontWeight: '900',
        color: '#f0f6fc',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -1,
    },
    sectionSubtitle: {
        fontSize: (Platform.OS === 'web') ? 20 : 16,
        color: '#c9d1d9',
        textAlign: 'center',
        maxWidth: 700,
        lineHeight: 28,
        fontWeight: '500',
    },
    featuresScroll: { width: '100%' },
    featuresGrid: { flexDirection: 'row', gap: 28 },
    featureCard: {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 40,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 15 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 25,
    },
    featureGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
    featureIconBox: {
        width: 84, height: 84, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 24, borderWidth: 1,
    },
    featureTitle: {
        fontSize: (Platform.OS === 'web') ? 24 : 20,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    featureDesc: {
        fontSize: (Platform.OS === 'web') ? 16 : 14,
        color: '#c9d1d9',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    ctaIcon: {
        marginBottom: 28,
        shadowColor: '#f0b90b', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.6, 
        shadowRadius: 16,
    },
    ctaTitle: {
        fontSize: (Platform.OS === 'web') ? 52 : 34,
        fontWeight: '900',
        color: '#f0f6fc',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -1,
    },
    ctaSubtitle: {
        fontSize: (Platform.OS === 'web') ? 19 : 16,
        color: '#c9d1d9',
        textAlign: 'center',
        marginBottom: 44,
        maxWidth: 600,
        lineHeight: 28,
        fontWeight: '500',
    },
    ctaButtons: { flexDirection: 'row', gap: 24, flexWrap: 'wrap', justifyContent: 'center' },
    ctaBtnPrimary: {
        height: 68,
        minWidth: 260,
        borderRadius: 36,
        overflow: 'hidden',
        shadowColor: '#ca8a04', 
        shadowOffset: { width: 0, height: 16 }, 
        shadowOpacity: 0.5, 
        shadowRadius: 25,
    },
    ctaBtnGradPrimary: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 44,
    },
    ctaBtnTextPrimary: {
        color: '#1f2937',
        fontWeight: '900',
        fontSize: 19,
        letterSpacing: 0.5,
    },
    ctaBtnSecondary: {
        height: 68,
        minWidth: 200,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: 'rgba(240, 185, 11, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
        backgroundColor: 'rgba(240, 185, 11, 0.15)',
        backdropFilter: 'blur(20px)',
    },
    ctaBtnTextSecondary: {
        color: '#f0f6fc',
        fontWeight: '800',
        fontSize: 18,
    },
    footer: {
        paddingVertical: 48,
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(240, 185, 11, 0.3)',
        marginHorizontal: 24,
        borderRadius: 28,
        marginBottom: 48,
    },
    footerContent: { alignItems: 'center', gap: 20 },
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    footerBrandText: {
        color: '#f0f6fc',
        fontSize: 24,
        fontWeight: '900',
    },
    footerText: {
        color: '#8b949e',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    footerLinks: { flexDirection: 'row', gap: 28 },
    footerLink: {
        color: '#f0b90b',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default HomeScreen;
