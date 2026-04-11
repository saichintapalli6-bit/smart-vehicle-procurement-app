import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, Lock, User, ChevronRight, CheckCircle, XCircle, Menu } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const LoginScreen = ({ navigation, route }) => {
    const { width } = Dimensions.get('window');
    const isLargeWeb = Platform.OS === 'web';

    const defaultRole = route?.params?.role || 'buyer';

    const [loginid, setLoginid] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(defaultRole); // Still used as default, but not visible
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
            });
            if (response.data) {
                const user = response.data;
                const userRole = user.role;
                if (userRole === 'buyer') navigation.navigate('BuyerDashboard', { user });
                else if (userRole === 'seller') navigation.navigate('SellerDashboard', { user });
                else if (userRole === 'admin') navigation.navigate('AdminDashboard', { user });
            }
        } catch (error) {
            let msg = 'Login failed. Check credentials.';
            if (error.response) {
                msg = error.response.data?.error || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                msg = 'Network Error: Cannot connect to server.';
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

    const S = useMemo(() => getStyles(isLargeWeb), [isLargeWeb]);

    return (
        <View style={S.root}>
            <AnimatedBackground />

            {/* Toast */}
            {toast && (
                <View style={[S.toast, toast.type === 'success' ? S.toastSuccess : S.toastError]}>
                    {toast.type === 'success'
                        ? <CheckCircle color="#22c55e" size={20} />
                        : <XCircle color="#f87171" size={20} />}
                    <Text style={S.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* Navbar */}
            <View style={S.navbar}>
                <TouchableOpacity style={S.navBrand} onPress={() => navigation.navigate('Home')}>
                    <Car color="#f0b90b" size={22} />
                    <Text style={S.brandText}>VehicleChain Pro</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.menuBtn} onPress={() => navigation.openDrawer()}>
                    <Menu color="#f0b90b" size={22} />
                </TouchableOpacity>
            </View>

            {/* Login Card Only */}
            <ScrollView
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                contentContainerStyle={S.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={S.card}>
                    <LinearGradient
                        colors={['rgba(240,185,11,0.12)', 'rgba(234,179,8,0.06)']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />

                    {/* Car Icon */}
                    <View style={S.cardIcon}>
                        <Car color="#f0b90b" size={32} />
                    </View>

                    <Text style={S.cardTitle}>Welcome Back</Text>
                    <Text style={S.cardSubtitle}>Sign in to your account</Text>

                    {/* Role selector removed for Smart Login */}

                    {/* Login ID */}
                    <View style={[S.inputWrapper, focusedField === 'id' && S.inputWrapperFocused]}>
                        <User color={focusedField === 'id' ? '#f0b90b' : '#8b949e'} size={20} />
                        <TextInput
                            style={S.input}
                            placeholder="Login ID"
                            placeholderTextColor="#8b949e"
                            value={loginid}
                            onChangeText={setLoginid}
                            onFocus={() => setFocusedField('id')}
                            onBlur={() => setFocusedField(null)}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <View style={[S.inputWrapper, focusedField === 'pw' && S.inputWrapperFocused]}>
                        <Lock color={focusedField === 'pw' ? '#f0b90b' : '#8b949e'} size={20} />
                        <TextInput
                            style={S.input}
                            placeholder="Password"
                            placeholderTextColor="#8b949e"
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedField('pw')}
                            onBlur={() => setFocusedField(null)}
                            secureTextEntry
                        />
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity style={S.loginBtn} onPress={handleLogin} disabled={loading}>
                        <LinearGradient
                            colors={['#f0b90b', '#eab308', '#ca8a04']}
                            style={S.loginBtnGrad}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            {loading
                                ? <ActivityIndicator color="#1f2937" />
                                : (
                                    <>
                                        <Text style={S.loginBtnText}>Sign In</Text>
                                        <ChevronRight color="#1f2937" size={20} />
                                    </>
                                )
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={S.divider}>
                        <View style={S.dividerLine} />
                        <Text style={S.dividerText}>or</Text>
                        <View style={S.dividerLine} />
                    </View>

                    <TouchableOpacity style={S.registerBtn} onPress={() => navigation.navigate('Register')}>
                        <Text style={S.registerBtnText}>Create New Account →</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (isLargeWeb) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0c0f15',
    },

    // TOAST
    toast: {
        position: 'absolute',
        top: 80,
        alignSelf: 'center',
        width: isLargeWeb ? 460 : '88%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 22,
        paddingVertical: 14,
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
        borderColor: 'rgba(34,197,94,0.4)',
    },
    toastError: {
        backgroundColor: 'rgba(248,113,113,0.15)',
        borderColor: 'rgba(248,113,113,0.4)',
    },
    toastText: {
        color: '#f0f6fc',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
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
        paddingHorizontal: isLargeWeb ? 48 : 24,
        paddingTop: Platform.OS === 'android' ? 50 : (Platform.OS === 'ios' ? 56 : 20),
        paddingBottom: 16,
        backgroundColor: 'rgba(12,15,21,0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(240,185,11,0.2)',
    },
    navBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandText: {
        color: '#f0f6fc',
        fontSize: isLargeWeb ? 18 : 16,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    menuBtn: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: 'rgba(240,185,11,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // SCROLL
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 120 : (Platform.OS === 'ios' ? 130 : 100),
        paddingBottom: 60,
        paddingHorizontal: isLargeWeb ? 40 : 24,
    },

    // CARD
    card: {
        width: isLargeWeb ? 460 : '100%',
        maxWidth: 460,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.25)',
        padding: isLargeWeb ? 48 : 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(22, 27, 34, 0.92)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 35,
        elevation: 15,
    },

    // CARD ICON
    cardIcon: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: 'rgba(240,185,11,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: isLargeWeb ? 32 : 26,
        fontWeight: '900',
        color: '#f0f6fc',
        marginBottom: 6,
        letterSpacing: -0.8,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: isLargeWeb ? 16 : 14,
        color: '#8b949e',
        marginBottom: 28,
        textAlign: 'center',
    },

    // ROLE SELECTOR
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 5,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.18)',
    },
    roleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleBtnText: {
        color: '#8b949e',
        fontWeight: '700',
        fontSize: isLargeWeb ? 15 : 14,
    },

    // INPUT
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 18,
        marginBottom: 16,
        height: isLargeWeb ? 58 : 54,
        gap: 12,
    },
    inputWrapperFocused: {
        borderColor: '#f0b90b',
        backgroundColor: 'rgba(240,185,11,0.1)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    input: {
        flex: 1,
        color: '#f0f6fc',
        fontSize: isLargeWeb ? 16 : 15,
        height: '100%',
        fontWeight: '500',
    },

    // LOGIN BUTTON
    loginBtn: {
        height: isLargeWeb ? 58 : 54,
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#ca8a04',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
        elevation: 10,
    },
    loginBtnGrad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    loginBtnText: {
        color: '#1f2937',
        fontWeight: '900',
        fontSize: isLargeWeb ? 17 : 16,
        letterSpacing: 0.5,
    },

    // DIVIDER
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 14,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#8b949e',
        fontSize: 13,
        fontWeight: '600',
    },

    // REGISTER BUTTON
    registerBtn: {
        height: isLargeWeb ? 54 : 50,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(240,185,11,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240,185,11,0.08)',
    },
    registerBtnText: {
        color: '#f0b90b',
        fontWeight: '800',
        fontSize: isLargeWeb ? 15 : 14,
        letterSpacing: 0.3,
    },
});

export default LoginScreen;
