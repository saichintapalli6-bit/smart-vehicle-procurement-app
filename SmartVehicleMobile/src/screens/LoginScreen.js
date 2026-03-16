import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, Lock, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const LoginScreen = ({ navigation, route }) => {
    const { width } = Dimensions.get('window');
    const isLargeWeb = Platform.OS === 'web';

    // Pre-select role if passed from Home page buttons
    const defaultRole = route?.params?.role || 'buyer';

    const [loginid, setLoginid] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(defaultRole);
    const isMobile = Platform.OS !== 'web' && width < 768;
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogin = async () => {
        if (!loginid.trim() || !password) {
            showToast('error', 'Please enter Login ID and Password');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(ENDPOINTS.LOGIN, {
                loginid: loginid.trim(),
                password,
                role,
            });
            if (response.data) {
                const user = response.data;
                if (role === 'buyer') navigation.navigate('BuyerDashboard', { user });
                else if (role === 'seller') navigation.navigate('SellerDashboard', { user });
                else if (role === 'admin') navigation.navigate('AdminDashboard', { user });
            }
        } catch (error) {
            let msg = 'Login failed. Check credentials.';
            if (error.response) {
                msg = error.response.data?.error || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                msg = 'Network Error: Cannot connect to server. Check IP & WiFi.';
            } else {
                msg = `Error: ${error.message}`;
            }
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { key: 'buyer', label: 'Buyer', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: '#22c55e' },
        { key: 'seller', label: 'Seller', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
        { key: 'admin', label: 'Admin', color: '#f0b90b', bg: 'rgba(240,185,11,0.15)', border: '#f0b90b' },
    ];

    const stylesOptions = useMemo(() => getStyles(isLargeWeb), [isLargeWeb]);

    return (
        <View style={stylesOptions.root}>
            {/* ✅ FIXED: No inline arrays allowed to prevent remounts */}
            <AnimatedBackground />

            {/* Toast Notification */}
            {toast && (
                <View style={[stylesOptions.toast, toast.type === 'success' ? stylesOptions.toastSuccess : stylesOptions.toastError]}>
                    {toast.type === 'success'
                        ? <CheckCircle color="#22c55e" size={20} />
                        : <XCircle color="#f87171" size={20} />}
                    <Text style={stylesOptions.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* Navbar */}
            <View style={stylesOptions.navbar}>
                <TouchableOpacity style={stylesOptions.navBrand} onPress={() => navigation.navigate('Home')}>
                    <Car color="#f0b90b" size={24} />
                    <Text style={stylesOptions.brandText}>VehicleChain Pro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={stylesOptions.navHomeLink}>← Back to Home</Text>
                </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode="none" contentContainerStyle={stylesOptions.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={stylesOptions.centerWrapper}>
                    {/* Left Panel - Web only */}
                    {isLargeWeb && (
                        <View style={stylesOptions.leftPanel}>
                            <View style={stylesOptions.leftBadge}>
                                <Text style={stylesOptions.leftBadgeText}>🔐 Blockchain Secured</Text>
                            </View>
                            {/* ✅ FIXED: Proper newline */}
                            <Text style={stylesOptions.leftTitle}>Welcome to{'\n'}VehicleChain{'\n'}Platform</Text>
                            <Text style={stylesOptions.leftSubtitle}>
                                Access your secure dashboard to manage blockchain-powered vehicle transactions with enterprise-grade security.
                            </Text>
                            <View style={stylesOptions.leftFeatures}>
                                {[
                                    '✓ Immutable Ledger',
                                    '✓ Smart Contracts', 
                                    '✓ Real-time Verification',
                                ].map((f, i) => (
                                    <Text key={i} style={stylesOptions.leftFeatureText}>{f}</Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Login Card */}
                    <View style={stylesOptions.card}>
                        <LinearGradient
                            colors={['rgba(240,185,11,0.12)', 'rgba(234,179,8,0.08)']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <Text style={stylesOptions.cardTitle}>Welcome Back</Text>
                        <Text style={stylesOptions.cardSubtitle}>Sign in to your account</Text>

                        {/* Role Selector */}
                        <View style={stylesOptions.roleContainer}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r.key}
                                    style={[
                                        stylesOptions.roleBtn, 
                                        role === r.key && { 
                                            backgroundColor: r.bg, 
                                            borderColor: r.color, 
                                            borderWidth: 2 
                                        }
                                    ]}
                                    onPress={() => setRole(r.key)}
                                >
                                    <Text style={[stylesOptions.roleBtnText, role === r.key && { color: r.color }]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Login ID */}
                        <View style={[stylesOptions.inputWrapper, focusedField === 'id' && stylesOptions.inputWrapperFocused]}>
                            <User color={focusedField === 'id' ? '#f0b90b' : '#8b949e'} size={20} />
                            <TextInput
                                style={stylesOptions.input}
                                placeholder="Login ID"
                                placeholderTextColor="#8b949e"
                                value={loginid}
                                onChangeText={setLoginid}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password */}
                        <View style={[stylesOptions.inputWrapper, focusedField === 'pw' && stylesOptions.inputWrapperFocused]}>
                            <Lock color={focusedField === 'pw' ? '#f0b90b' : '#8b949e'} size={20} />
                            <TextInput
                                style={stylesOptions.input}
                                placeholder="Password"
                                placeholderTextColor="#8b949e"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity style={stylesOptions.loginBtn} onPress={handleLogin} disabled={loading}>
                            <LinearGradient
                                colors={['#f0b90b', '#eab308', '#ca8a04']}
                                style={stylesOptions.loginBtnGrad}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                                {loading
                                    ? <ActivityIndicator color="#1f2937" />
                                    : (
                                        <>
                                            <Text style={stylesOptions.loginBtnText}>Sign In</Text>
                                            <ChevronRight color="#1f2937" size={20} />
                                        </>
                                    )
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={stylesOptions.divider}>
                            <View style={stylesOptions.dividerLine} />
                            <Text style={stylesOptions.dividerText}>or</Text>
                            <View style={stylesOptions.dividerLine} />
                        </View>

                        <TouchableOpacity style={stylesOptions.registerBtn} onPress={() => navigation.navigate('Register')}>
                            <Text style={stylesOptions.registerBtnText}>Create New Account →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Text style={stylesOptions.backLink}>← Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (isLargeWeb) => StyleSheet.create({
    root: { 
        flex: 1, 
        backgroundColor: '#0c0f15' // Perfect GitHub dark base
    },

    // TOAST - Professional notifications
    toast: {
        position: 'absolute', 
        top: 70, 
        alignSelf: 'center',
        width: isLargeWeb ? 480 : '90%',
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12,
        paddingHorizontal: 24, 
        paddingVertical: 16,
        borderRadius: 16, 
        zIndex: 999, 
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    toastSuccess: { 
        backgroundColor: 'rgba(34,197,94,0.15)', 
        borderColor: 'rgba(34,197,94,0.4)' 
    },
    toastError: { 
        backgroundColor: 'rgba(248,113,113,0.15)', 
        borderColor: 'rgba(248,113,113,0.4)' 
    },
    toastText: { 
        color: '#f0f6fc', 
        fontSize: 15, 
        fontWeight: '700', 
        flex: 1 
    },

    // NAVBAR - Luxury gold theme
    navbar: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100,
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: isLargeWeb ? 60 : 24, 
        paddingVertical: 18,
        backgroundColor: 'rgba(22, 27, 34, 0.96)',
        backdropFilter: 'blur(32px)',
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(240,185,11,0.25)',
    },
    navBrand: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14 
    },
    brandText: { 
        color: '#f0f6fc', 
        fontSize: isLargeWeb ? 20 : 16, 
        fontWeight: '900', 
        letterSpacing: -0.5 
    },
    navHomeLink: { 
        color: '#f0b90b', 
        fontSize: isLargeWeb ? 15 : 14, 
        fontWeight: '700' 
    },

    scrollContent: {
        flexGrow: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: 90, 
        paddingBottom: 60, 
        paddingHorizontal: isLargeWeb ? 40 : 24,
    },
    centerWrapper: {
        flexDirection: isLargeWeb ? 'row' : 'column', 
        alignItems: 'center',
        gap: isLargeWeb ? 80 : 40, 
        width: '100%',
        maxWidth: isLargeWeb ? 1200 : 520, 
        justifyContent: 'center',
    },

    // LEFT PANEL - Perfect contrast
    leftPanel: { 
        flex: 1, 
        maxWidth: 480, 
        paddingRight: 24 
    },
    leftBadge: {
        backgroundColor: 'rgba(240,185,11,0.18)', 
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.4)', 
        paddingHorizontal: 18,
        paddingVertical: 8, 
        borderRadius: 24, 
        alignSelf: 'flex-start', 
        marginBottom: 32,
    },
    leftBadgeText: { 
        color: '#f0b90b', 
        fontSize: 14, 
        fontWeight: '800',
        letterSpacing: 1 
    },
    leftTitle: {
        fontSize: isLargeWeb ? 56 : 40, 
        fontWeight: '900', 
        color: '#f0f6fc',
        lineHeight: isLargeWeb ? 68 : 48, 
        marginBottom: 24,
        letterSpacing: -1,
    },
    leftSubtitle: { 
        fontSize: isLargeWeb ? 18 : 15, 
        color: '#c9d1d9', 
        lineHeight: 28, 
        marginBottom: 32 
    },
    leftFeatures: { 
        gap: 12 
    },
    leftFeatureText: { 
        color: '#c9d1d9', 
        fontSize: 16, 
        fontWeight: '600',
        lineHeight: 24 
    },

    // LOGIN CARD - Luxury glass morphism
    card: {
        width: isLargeWeb ? 440 : '100%', 
        borderRadius: 28, 
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.25)', 
        padding: isLargeWeb ? 48 : 36,
        overflow: 'hidden', 
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 35,
        elevation: 15,
    },
    cardTitle: { 
        fontSize: isLargeWeb ? 34 : 28, 
        fontWeight: '900', 
        color: '#f0f6fc', 
        marginBottom: 8,
        letterSpacing: -0.8 
    },
    cardSubtitle: { 
        fontSize: isLargeWeb ? 17 : 15, 
        color: '#c9d1d9', 
        marginBottom: 32 
    },

    // Role selector - Professional segmented control
    roleContainer: {
        flexDirection: 'row', 
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, 
        padding: 6, 
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.2)',
    },
    roleBtn: { 
        flex: 1, 
        paddingVertical: 14, 
        alignItems: 'center', 
        borderRadius: 12 
    },
    roleBtnText: { 
        color: '#8b949e', 
        fontWeight: '700', 
        fontSize: isLargeWeb ? 16 : 15 
    },

    // Input fields - Perfect focus states
    inputWrapper: {
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', 
        borderRadius: 16,
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 20, 
        marginBottom: 20, 
        height: isLargeWeb ? 60 : 56, 
        gap: 14,
    },
    inputWrapperFocused: { 
        borderColor: '#f0b90b', 
        backgroundColor: 'rgba(240,185,11,0.12)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    input: { 
        flex: 1, 
        color: '#f0f6fc', 
        fontSize: isLargeWeb ? 17 : 16, 
        height: '100%',
        fontWeight: '500'
    },

    // Login button - Luxury gold gradient
    loginBtn: { 
        height: isLargeWeb ? 60 : 56, 
        borderRadius: 16, 
        overflow: 'hidden', 
        marginTop: 12, 
        marginBottom: 28,
        shadowColor: '#ca8a04',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    loginBtnGrad: { 
        flex: 1, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 10 
    },
    loginBtnText: { 
        color: '#1f2937', 
        fontWeight: '900', 
        fontSize: isLargeWeb ? 18 : 17,
        letterSpacing: 0.5 
    },

    divider: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 24, 
        gap: 16 
    },
    dividerLine: { 
        flex: 1, 
        height: 1, 
        backgroundColor: 'rgba(255,255,255,0.12)' 
    },
    dividerText: { 
        color: '#8b949e', 
        fontSize: 14, 
        fontWeight: '600' 
    },

    registerBtn: {
        height: isLargeWeb ? 56 : 52, 
        borderRadius: 16, 
        borderWidth: 2,
        borderColor: 'rgba(240,185,11,0.4)', 
        justifyContent: 'center',
        alignItems: 'center', 
        marginBottom: 24,
        backgroundColor: 'rgba(240,185,11,0.12)',
    },
    registerBtnText: { 
        color: '#f0b90b', 
        fontWeight: '800', 
        fontSize: isLargeWeb ? 16 : 15,
        letterSpacing: 0.3 
    },
    backLink: { 
        color: '#8b949e', 
        textAlign: 'center', 
        fontSize: 14,
        fontWeight: '600' 
    },
});

export default LoginScreen;
