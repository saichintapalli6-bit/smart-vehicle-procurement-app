import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, User, Mail, Phone, Lock, ChevronRight, CheckCircle, XCircle, CreditCard, Library } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const RegisterScreen = ({ navigation }) => {
    const { width } = Dimensions.get('window');
    const isLargeWeb = Platform.OS === 'web';

    const [form, setForm] = useState({
        name: '', email: '', loginid: '', mobile: '', password: '', confirmPassword: '',
        bank_account_number: '', ifsc_code: '', bank_name: ''
    });
    const [role, setRole] = useState('buyer');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [toast, setToast] = useState(null);

    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: null }));
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        if (type === 'success') {
            setTimeout(() => {
                setToast(null);
                navigation.navigate('Login');
            }, 2000);
        } else {
            setTimeout(() => setToast(null), 4000);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        else if (form.name.trim().length < 3) e.name = 'Min 3 characters';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
        if (!form.loginid.trim()) e.loginid = 'Login ID required';
        if (!form.mobile.trim()) e.mobile = 'Mobile required';
        else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Must be 10 digits';
        if (!form.password) e.password = 'Password required';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
            e.password = 'Must be 8+ chars and include upper, lower, digit & special char';
        }
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

        if (role === 'seller') {
            if (!form.bank_account_number.trim()) e.bank_account_number = 'Bank Account Number required';
            if (!form.ifsc_code.trim()) e.ifsc_code = 'IFSC Code required';
            if (!form.bank_name.trim()) e.bank_name = 'Bank Name required';
        }

        setFieldErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await axios.post(ENDPOINTS.REGISTER, {
                name: form.name.trim(),
                email: form.email.trim(),
                loginid: form.loginid.trim(),
                mobile: form.mobile.trim(),
                password: form.password,
                role,
                ...(role === 'seller' && {
                    bank_account_number: form.bank_account_number.trim(),
                    ifsc_code: form.ifsc_code.trim(),
                    bank_name: form.bank_name.trim(),
                })
            });
            showToast('success', response.data.message || 'Registered! Redirecting to login...');
        } catch (error) {
            let msg = 'Registration failed. Please try again.';
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
        { key: 'buyer', label: '🛒 Buyer', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: '#22c55e' },
        { key: 'seller', label: '🚗 Seller', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
    ];

    const fields = useMemo(() => {
        const baseFields = [
            { key: 'name', label: 'Full Name', icon: <User color="#8b949e" size={20} />, placeholder: 'Enter your full name', secure: false, keyboard: 'default' },
            { key: 'email', label: 'Email Address', icon: <Mail color="#8b949e" size={20} />, placeholder: 'Enter your email', secure: false, keyboard: 'email-address' },
            { key: 'loginid', label: 'Login ID', icon: <User color="#8b949e" size={20} />, placeholder: 'Choose a login ID', secure: false, keyboard: 'default' },
            { key: 'mobile', label: 'Mobile Number', icon: <Phone color="#8b949e" size={20} />, placeholder: '10-digit mobile', secure: false, keyboard: 'phone-pad' },
            { key: 'password', label: 'Password', icon: <Lock color="#8b949e" size={20} />, placeholder: 'Min 8 characters', secure: true, keyboard: 'default' },
            { key: 'confirmPassword', label: 'Confirm Password', icon: <Lock color="#8b949e" size={20} />, placeholder: 'Re-enter password', secure: true, keyboard: 'default' },
        ];

        if (role === 'seller') {
            baseFields.push(
                { key: 'bank_account_number', label: 'Bank Account Number', icon: <CreditCard color="#8b949e" size={20} />, placeholder: 'Enter Account Number', secure: false, keyboard: 'number-pad' },
                { key: 'ifsc_code', label: 'IFSC Code', icon: <Library color="#8b949e" size={20} />, placeholder: 'Enter IFSC Code', secure: false, keyboard: 'default' },
                { key: 'bank_name', label: 'Bank Name', icon: <Library color="#8b949e" size={20} />, placeholder: 'Enter Bank Name', secure: false, keyboard: 'default' }
            );
        }

        return baseFields;
    }, [role]);

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
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={stylesOptions.navLink}>Sign In →</Text>
                </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode="none" contentContainerStyle={stylesOptions.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={stylesOptions.centerWrapper}>
                    {/* Left Panel - Web only */}
                    {isLargeWeb && (
                        <View style={stylesOptions.leftPanel}>
                            <View style={stylesOptions.leftBadge}>
                                <Text style={stylesOptions.leftBadgeText}>🚀 Join the Platform</Text>
                            </View>
                            <Text style={stylesOptions.leftTitle}>Create Your{'\n'}Blockchain{'\n'}Identity</Text>
                            <Text style={stylesOptions.leftSubtitle}>
                                Register as Buyer or Seller and participate in blockchain-powered vehicle transactions.
                            </Text>
                            <View style={stylesOptions.steps}>
                                {[
                                    { num: '01', title: 'Register', sub: 'Fill in your details below' },
                                    { num: '02', title: 'Admin Review', sub: 'Admin verifies your account' },
                                    { num: '03', title: 'Start Trading', sub: 'Buy or sell vehicles securely' },
                                ].map((s, i) => (
                                    <View key={i} style={stylesOptions.step}>
                                        <View style={stylesOptions.stepNum}>
                                            <Text style={stylesOptions.stepNumText}>{s.num}</Text>
                                        </View>
                                        <View>
                                            <Text style={stylesOptions.stepTitle}>{s.title}</Text>
                                            <Text style={stylesOptions.stepSub}>{s.sub}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Register Card */}
                    <View style={stylesOptions.card}>
                        <LinearGradient
                            colors={['rgba(240,185,11,0.12)', 'rgba(234,179,8,0.08)']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <Text style={stylesOptions.cardTitle}>Create Account</Text>
                        <Text style={stylesOptions.cardSubtitle}>Register to trade vehicles on blockchain</Text>

                        {/* Role Selector */}
                        <View style={stylesOptions.roleRow}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r.key}
                                    style={[stylesOptions.roleBtn, role === r.key && { backgroundColor: r.bg, borderColor: r.border, borderWidth: 1.5 }]}
                                    onPress={() => setRole(r.key)}
                                >
                                    <Text style={[stylesOptions.roleBtnText, role === r.key && { color: r.color }]}>{r.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Form Fields */}
                        <View style={isLargeWeb ? stylesOptions.fieldsGrid : stylesOptions.fieldsList}>
                            {fields.map((f) => (
                                <View key={f.key} style={[stylesOptions.fieldGroup, isLargeWeb && stylesOptions.fieldGroupWeb]}>
                                    <Text style={stylesOptions.fieldLabel}>{f.label}</Text>
                                    <View style={[
                                        stylesOptions.inputWrapper,
                                        focusedField === f.key && stylesOptions.inputFocused,
                                        fieldErrors[f.key] && stylesOptions.inputError,
                                    ]}>
                                        {f.icon}
                                        <TextInput
                                            style={stylesOptions.input}
                                            placeholder={f.placeholder}
                                            placeholderTextColor="#8b949e"
                                            value={form[f.key]}
                                            onChangeText={(v) => update(f.key, v)}
                                            secureTextEntry={f.secure}
                                            keyboardType={f.keyboard}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    {fieldErrors[f.key] && (
                                        <Text style={stylesOptions.errorText}>⚠ {fieldErrors[f.key]}</Text>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Info Box */}
                        <View style={stylesOptions.infoBox}>
                            <Text style={stylesOptions.infoText}>
                                ℹ️ After registration, admin will review and activate your account.
                            </Text>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity style={stylesOptions.regBtn} onPress={handleRegister} disabled={loading}>
                            <LinearGradient 
                                colors={['#f0b90b', '#eab308', '#ca8a04']} 
                                style={stylesOptions.regBtnGrad} 
                                start={{ x: 0, y: 0 }} 
                                end={{ x: 1, y: 1 }}
                            >
                                {loading
                                    ? <ActivityIndicator color="#1f2937" />
                                    : (
                                        <>
                                            <Text style={stylesOptions.regBtnText}>Create Account</Text>
                                            <ChevronRight color="#1f2937" size={20} />
                                        </>
                                    )
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={stylesOptions.loginLink} onPress={() => navigation.navigate('Login')}>
                            <Text style={stylesOptions.loginLinkText}>Already have an account? Sign In →</Text>
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
    navLink: { 
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

    // LEFT PANEL
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
    steps: { 
        gap: 20 
    },
    step: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        gap: 16 
    },
    stepNum: {
        width: 48, 
        height: 48, 
        borderRadius: 16,
        backgroundColor: 'rgba(240,185,11,0.18)', 
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    stepNumText: { 
        color: '#f0b90b', 
        fontWeight: '900', 
        fontSize: 15 
    },
    stepTitle: { 
        color: '#f0f6fc', 
        fontWeight: '800', 
        fontSize: 16, 
        marginBottom: 4 
    },
    stepSub: { 
        color: '#c9d1d9', 
        fontSize: 14 
    },

    // REGISTER CARD
    card: {
        width: isLargeWeb ? 480 : '100%', 
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

    // Role selector
    roleRow: {
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 28,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, 
        padding: 6,
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

    // Form fields
    fieldsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 16, 
        marginBottom: 20 
    },
    fieldsList: { 
        gap: 16, 
        marginBottom: 20 
    },
    fieldGroup: { 
        width: '100%' 
    },
    fieldGroupWeb: { 
        width: '48%' 
    },
    fieldLabel: { 
        color: '#c9d1d9', 
        fontSize: 14, 
        fontWeight: '600', 
        marginBottom: 8 
    },
    inputWrapper: {
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', 
        borderRadius: 16,
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 20, 
        height: isLargeWeb ? 60 : 56, 
        gap: 14,
    },
    inputFocused: { 
        borderColor: '#f0b90b', 
        backgroundColor: 'rgba(240,185,11,0.12)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    inputError: { 
        borderColor: '#f87171', 
        backgroundColor: 'rgba(248,113,113,0.1)' 
    },
    input: { 
        flex: 1, 
        color: '#f0f6fc', 
        fontSize: isLargeWeb ? 17 : 16, 
        height: '100%',
        fontWeight: '500'
    },
    errorText: { 
        color: '#f87171', 
        fontSize: 13, 
        marginTop: 6,
        fontWeight: '600' 
    },

    // Info box
    infoBox: {
        backgroundColor: 'rgba(240,185,11,0.12)', 
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.3)', 
        borderRadius: 16, 
        padding: 18, 
        marginBottom: 28,
    },
    infoText: { 
        color: '#f0f6fc', 
        fontSize: 14, 
        lineHeight: 22,
        fontWeight: '500' 
    },

    // Register button
    regBtn: { 
        height: isLargeWeb ? 60 : 56, 
        borderRadius: 16, 
        overflow: 'hidden', 
        marginBottom: 24,
        shadowColor: '#ca8a04',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    regBtnGrad: { 
        flex: 1, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 10 
    },
    regBtnText: { 
        color: '#1f2937', 
        fontWeight: '900', 
        fontSize: isLargeWeb ? 18 : 17,
        letterSpacing: 0.5 
    },

    loginLink: { 
        alignItems: 'center' 
    },
    loginLinkText: { 
        color: '#f0b90b', 
        fontSize: isLargeWeb ? 16 : 15, 
        fontWeight: '700' 
    },
});

export default RegisterScreen;
