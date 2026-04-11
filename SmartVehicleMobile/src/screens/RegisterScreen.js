import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, User, Mail, Phone, Lock, ChevronRight, CheckCircle, XCircle, CreditCard, Library, Menu } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const RegisterScreen = ({ navigation }) => {
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
            e.password = 'Must be 8+ chars with upper, lower, digit & special char';
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
            showToast('success', response.data.message || 'Account created! Redirecting...');
        } catch (error) {
            let msg = 'Registration failed. Please try again.';
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

            {/* Form Only */}
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

                    {/* Card Icon */}
                    <View style={S.cardIcon}>
                        <Car color="#f0b90b" size={30} />
                    </View>

                    <Text style={S.cardTitle}>Create Account</Text>
                    <Text style={S.cardSubtitle}>Register to trade vehicles on blockchain</Text>

                    {/* Role Selector */}
                    <View style={S.roleRow}>
                        {roles.map((r) => (
                            <TouchableOpacity
                                key={r.key}
                                style={[S.roleBtn, role === r.key && { backgroundColor: r.bg, borderColor: r.border, borderWidth: 1.5 }]}
                                onPress={() => setRole(r.key)}
                            >
                                <Text style={[S.roleBtnText, role === r.key && { color: r.color }]}>{r.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form Fields */}
                    <View style={isLargeWeb ? S.fieldsGrid : S.fieldsList}>
                        {fields.map((f) => (
                            <View key={f.key} style={[S.fieldGroup, isLargeWeb && S.fieldGroupWeb]}>
                                <Text style={S.fieldLabel}>{f.label}</Text>
                                <View style={[
                                    S.inputWrapper,
                                    focusedField === f.key && S.inputFocused,
                                    fieldErrors[f.key] && S.inputError,
                                ]}>
                                    {f.icon}
                                    <TextInput
                                        style={S.input}
                                        placeholder={f.placeholder}
                                        placeholderTextColor="#8b949e"
                                        value={form[f.key]}
                                        onChangeText={(v) => update(f.key, v)}
                                        onFocus={() => setFocusedField(f.key)}
                                        onBlur={() => setFocusedField(null)}
                                        secureTextEntry={f.secure}
                                        keyboardType={f.keyboard}
                                        autoCapitalize="none"
                                    />
                                </View>
                                {fieldErrors[f.key] && (
                                    <Text style={S.errorText}>⚠ {fieldErrors[f.key]}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Info Box */}
                    <View style={S.infoBox}>
                        <Text style={S.infoText}>
                            ℹ️ After registration, admin will review and activate your account.
                        </Text>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity style={S.regBtn} onPress={handleRegister} disabled={loading}>
                        <LinearGradient
                            colors={['#f0b90b', '#eab308', '#ca8a04']}
                            style={S.regBtnGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading
                                ? <ActivityIndicator color="#1f2937" />
                                : (
                                    <>
                                        <Text style={S.regBtnText}>Create Account</Text>
                                        <ChevronRight color="#1f2937" size={20} />
                                    </>
                                )
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={S.loginLink} onPress={() => navigation.navigate('Login')}>
                        <Text style={S.loginLinkText}>Already have an account? Sign In →</Text>
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
        width: isLargeWeb ? 560 : '100%',
        maxWidth: 560,
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
    roleRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 5,
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

    // FORM FIELDS
    fieldsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20,
    },
    fieldsList: {
        gap: 14,
        marginBottom: 20,
    },
    fieldGroup: {
        width: '100%',
    },
    fieldGroupWeb: {
        width: '48%',
    },
    fieldLabel: {
        color: '#c9d1d9',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 7,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        height: isLargeWeb ? 56 : 52,
        gap: 12,
    },
    inputFocused: {
        borderColor: '#f0b90b',
        backgroundColor: 'rgba(240,185,11,0.1)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    inputError: {
        borderColor: '#f87171',
        backgroundColor: 'rgba(248,113,113,0.08)',
    },
    input: {
        flex: 1,
        color: '#f0f6fc',
        fontSize: isLargeWeb ? 15 : 14,
        height: '100%',
        fontWeight: '500',
    },
    errorText: {
        color: '#f87171',
        fontSize: 12,
        marginTop: 5,
        fontWeight: '600',
    },

    // INFO BOX
    infoBox: {
        backgroundColor: 'rgba(240,185,11,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(240,185,11,0.28)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        color: '#f0f6fc',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
    },

    // REGISTER BUTTON
    regBtn: {
        height: isLargeWeb ? 58 : 54,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#ca8a04',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
        elevation: 10,
    },
    regBtnGrad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    regBtnText: {
        color: '#1f2937',
        fontWeight: '900',
        fontSize: isLargeWeb ? 17 : 16,
        letterSpacing: 0.5,
    },

    loginLink: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    loginLinkText: {
        color: '#f0b90b',
        fontSize: isLargeWeb ? 15 : 14,
        fontWeight: '700',
    },
});

export default RegisterScreen;
