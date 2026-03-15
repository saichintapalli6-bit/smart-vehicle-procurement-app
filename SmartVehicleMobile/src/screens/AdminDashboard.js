import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Platform, TextInput, Alert, useWindowDimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, UserCheck, LogOut, RefreshCcw, Shield, Search, CheckCircle, XCircle } from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS } from '../config/api';

const AdminDashboard = ({ route, navigation }) => {
    const user = route?.params?.user || { name: 'System Administrator' };
    const [activeTab, setActiveTab] = useState('buyers');
    const [buyers, setBuyers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { width: screenWidth } = useWindowDimensions();
    const isMobile = screenWidth < 768;

    // 🎬 ENTRANCE ANIMATIONS
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start();
    }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBuyers = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_BUYERS);
            setBuyers(res.data);
        } catch (e) {
            showToast('error', 'Failed to load buyers');
        }
    }, []);

    const fetchSellers = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_SELLERS);
            setSellers(res.data);
        } catch (e) {
            showToast('error', 'Failed to load sellers');
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_TRANSACTIONS);
            setTransactions(res.data);
        } catch (e) {
            showToast('error', 'Failed to load transactions');
        }
    }, []);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.BROWSE_VEHICLES);
            setVehicles(res.data);
        } catch (e) {
            showToast('error', 'Failed to load vehicles');
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchBuyers(), fetchSellers(), fetchTransactions(), fetchVehicles()]);
        setLoading(false);
    }, [fetchBuyers, fetchSellers, fetchTransactions, fetchVehicles]);

    useEffect(() => { fetchAll(); }, []);

    // Transaction Verification Modal
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState(null);

    const openVerifyModal = (txn) => {
        setSelectedTxn(txn);
        setVerifyModalVisible(true);
    };

    const handleApproveTransaction = async () => {
        if (!selectedTxn) return;
        setVerifyModalVisible(false);
        try {
            const res = await axios.post(ENDPOINTS.ADMIN_APPROVE_TRANSACTION, { hash_code: selectedTxn.hash_code });
            showToast('success', res.data.message);
            fetchAll();
        } catch (e) {
            const msg = e.response?.data?.error || 'Failed to approve transaction';
            showToast('error', msg);
            fetchAll();
        }
    };

    const handleDeleteUser = async (id, role) => {
        const confirmDelete = Platform.OS === 'web'
            ? window.confirm(`Are you sure you want to delete this ${role}?`)
            : await new Promise((resolve) => {
                Alert.alert(
                    'Confirm Delete',
                    `Are you sure you want to delete this ${role}?`,
                    [
                        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
                    ]
                );
            });

        if (!confirmDelete) return;

        try {
            const res = await axios.post(ENDPOINTS.ADMIN_DELETE_USER, { user_id: id, role });
            showToast('success', res.data.message || `${role} deleted successfully`);
            if (role === 'buyer') {
                setBuyers(prev => prev.filter(u => u.id !== id));
            } else {
                setSellers(prev => prev.filter(u => u.id !== id));
            }
        } catch (e) {
            showToast('error', `Failed to delete ${role}`);
        }
    };

    const handleToggle = async (id, currentStatus, type) => {
        if (type === 'transaction') {
            try {
                const res = await axios.post(ENDPOINTS.ADMIN_APPROVE_TRANSACTION, { hash_code: id });
                showToast('success', res.data.message);
                setTransactions(prev => prev.map(t => t.hash_code === id ? { ...t, status: 'approved' } : t));
            } catch (e) {
                showToast('error', 'Failed to approve transaction');
            }
            return;
        }

        const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
        const endpoint = type === 'buyer' ? ENDPOINTS.ADMIN_ACTIVATE_BUYER : ENDPOINTS.ADMIN_ACTIVATE_SELLER;
        try {
            const res = await axios.post(endpoint, { id, action });
            showToast('success', res.data.message);
            if (type === 'buyer') {
                setBuyers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
            } else {
                setSellers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
            }
        } catch (e) {
            showToast('error', 'Failed to update user status');
        }
    };

    const currentList = activeTab === 'buyers' ? buyers : activeTab === 'sellers' ? sellers : activeTab === 'transactions' ? transactions : vehicles;
    const filtered = currentList.filter(item => {
        const term = searchText.toLowerCase();
        if (activeTab === 'transactions') {
            return item.vehicle_number?.toLowerCase().includes(term) || item.buyer_name?.toLowerCase().includes(term) || item.hash_code?.toLowerCase().includes(term);
        }
        if (activeTab === 'vehicles') {
            return item.vehicle_number?.toLowerCase().includes(term);
        }
        return item.name?.toLowerCase().includes(term) || item.loginid?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term);
    });

    const stats = [
        { label: 'Total Buyers', value: buyers.length, color: '#ffffff', bg: '#4f46e5', border: '#818cf8' },
        { label: 'Active Buyers', value: buyers.filter(u => u.status === 'Active').length, color: '#ffffff', bg: '#059669', border: '#34d399' },
        { label: 'Total Sellers', value: sellers.length, color: '#ffffff', bg: '#d97706', border: '#fbbf24' },
        { label: 'Pending Users', value: [...buyers, ...sellers].filter(u => u.status === 'waiting').length, color: '#ffffff', bg: '#dc2626', border: '#f87171' },
    ];

    return (
        <View style={styles.root}>
            <AnimatedBackground 
                colors={['#0a0a1f', '#1a1a3c', '#11112b', '#0a0a1f']} 
                particleColor="#6366f1"
            />

            {/* Toast */}
            {toast && (
                <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                    {toast.type === 'success' ? <CheckCircle color="#10b981" size={20} /> : <XCircle color="#ef4444" size={20} />}
                    <Text style={styles.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* NAVBAR */}
            <View style={styles.navbar}>
                <View style={styles.navLeft}>
                    <View style={styles.shieldIcon}>
                        <Shield color="#f0b90b" size={isMobile ? 20 : 24} />
                    </View>
                    <Text style={[styles.navTitle, isMobile && { fontSize: 18 }]} numberOfLines={1}>Admin Command Center</Text>
                    {!isMobile && (
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>PLATINUM</Text>
                        </View>
                    )}
                </View>
                <View style={styles.navRight}>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchAll}>
                        <RefreshCcw color="#94a3b8" size={isMobile ? 14 : 16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Home')}>
                        <LogOut color="#f87171" size={isMobile ? 14 : 16} />
                        {!isMobile && <Text style={styles.logoutBtnText}>Logout</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.ScrollView 
                style={[styles.scroll, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]} 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >

                {/* WELCOME */}
                <View style={styles.welcomeRow}>
                    <View>
                        <Text style={styles.welcomeHello}>Welcome back,</Text>
                        <Text style={styles.welcomeName}>{user.name}</Text>
                        <Text style={styles.welcomeSub}>Manage your platform records</Text>
                    </View>
                    {loading && <ActivityIndicator color="#8b5cf6" size="large" />}
                </View>

                {/* STATS CARDS */}
                <View style={styles.statsGrid}>
                    {stats.map((s, i) => (
                        <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                            <View style={styles.statGlow} />
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* USER MANAGEMENT TABLE */}
                <View style={styles.tableSection}>
                    {/* Title Row */}
                    <View style={styles.tableHeader}>
                        <Users color="#f0b90b" size={24} />
                        <Text style={styles.tableTitle}>Global Fleet Control</Text>
                        {loading && <ActivityIndicator color="#f0b90b" size="small" style={{ marginLeft: 12 }} />}
                    </View>

                    {/* Tabs Row */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollRow}>
                        <View style={styles.tabsRow}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'buyers' && styles.tabActive]}
                                onPress={() => { setActiveTab('buyers'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'buyers' && styles.tabTextActive]}>🛒 Buyers ({buyers.length})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'sellers' && styles.tabActiveSeller]}
                                onPress={() => { setActiveTab('sellers'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'sellers' && styles.tabTextActiveSeller]}>🚗 Sellers ({sellers.length})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'transactions' && styles.tabActiveTransactions]}
                                onPress={() => { setActiveTab('transactions'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActiveTransactions]}>💳 Transactions ({transactions.length})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'vehicles' && styles.tabActiveVehicles]}
                                onPress={() => { setActiveTab('vehicles'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'vehicles' && styles.tabTextActiveVehicles]}>🚙 Vehicles ({vehicles.length})</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Search */}
                    <View style={styles.searchBox}>
                        <Search color="#94a3b8" size={20} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${activeTab}...`}
                            placeholderTextColor="#64748b"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    {/* Scrollable Table Content */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={{ minWidth: 1100 }}>
                            {/* Column Headers */}
                            <View style={styles.colHeader}>
                                {(activeTab === 'transactions' ? [
                                    { label: '#', w: 50 },
                                    { label: 'Vehicle', w: 150 },
                                    { label: 'Buyer', w: 150 },
                                    { label: 'Price', w: 120 },
                                    { label: 'Status', w: 120 },
                                    { label: 'Hash Code', w: 280 },
                                    { label: 'Action', w: 130 }
                                ] : activeTab === 'vehicles' ? [
                                    { label: '#', w: 50 },
                                    { label: 'Vehicle Number', w: 180 },
                                    { label: 'Price', w: 130 },
                                    { label: 'Accidents', w: 180 },
                                    { label: 'Action', w: 130 }
                                ] : [
                                    { label: '#', w: 50 },
                                    { label: 'Login ID', w: 130 },
                                    { label: 'Name', w: 220 },
                                    { label: 'Email', w: 280 },
                                    { label: 'Mobile', w: 140 },
                                    { label: 'Status', w: 120 },
                                    { label: 'Action', w: 200 }
                                ]).map((col, i) => (
                                    <Text key={i} style={[styles.colHeaderText, { width: col.w }]}>{col.label}</Text>
                                ))}
                            </View>

                            {/* Rows */}
                            {loading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator color="#8b5cf6" size="large" />
                                    <Text style={styles.loadingText}>Loading dashboard data...</Text>
                                </View>
                            ) : filtered.length === 0 ? (
                                <View style={styles.emptyRow}>
                                    <Text style={styles.emptyText}>No {activeTab} found matching your search</Text>
                                </View>
                            ) : activeTab === 'transactions' ? (
                                filtered.map((t, idx) => (
                                    <View key={t.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 50, color: '#94a3b8', fontSize: 14 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellVehicle, { width: 150 }]}>{t.vehicle_number}</Text>
                                        <Text style={[styles.cell, styles.cellName, { width: 150 }]}>{t.buyer_name}</Text>
                                        <Text style={[styles.cell, { width: 120, color: '#10b981', fontWeight: '700' }]}>₹{t.price}</Text>
                                        <View style={[styles.cell, { width: 120 }]}>
                                            <View style={[styles.statusBadge, t.status === 'approved' ? styles.statusActive : styles.statusWaiting]}>
                                                <Text style={[styles.statusText, t.status === 'approved' ? { color: '#10b981' } : { color: '#f59e0b' }]}>
                                                    {t.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.cell, { width: 280, fontSize: 12, color: '#60a5fa', fontFamily: 'monospace' }]} numberOfLines={1}>{t.hash_code}</Text>
                                        <View style={[styles.cell, { width: 130, alignItems: 'center' }]}>
                                            {t.status === 'pending' && (
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, styles.activateBtn]}
                                                    onPress={() => openVerifyModal(t)}
                                                >
                                                    <Text style={styles.actionBtnText}>🔍 Verify</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ))
                            ) : activeTab === 'vehicles' ? (
                                filtered.map((v, idx) => (
                                    <View key={v.vehicle_number} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 50, color: '#94a3b8', fontSize: 14 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellVehicle, { width: 180 }]}>{v.vehicle_number}</Text>
                                        <Text style={[styles.cell, { width: 130, color: '#10b981', fontWeight: '700' }]}>₹{v.price}</Text>
                                        <Text style={[styles.cell, { width: 180, color: '#f59e0b' }]}>{v.accidents_history || 'None reported'}</Text>
                                        <View style={[styles.cell, { width: 130, alignItems: 'center' }]}>
                                            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500' }}>View Only</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                filtered.map((u, idx) => (
                                    <View key={u.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 50, color: '#94a3b8', fontSize: 14 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellLoginId, { width: 130 }]}>{u.loginid}</Text>
                                        <Text style={[styles.cell, styles.cellName, { width: 220 }]}>{u.name}</Text>
                                        <Text style={[styles.cell, styles.cellEmail, { width: 280 }]}>{u.email}</Text>
                                        <Text style={[styles.cell, styles.cellMobile, { width: 140 }]}>{u.mobile || '—'}</Text>
                                        <View style={[styles.cell, { width: 120 }]}>
                                            <View style={[
                                                styles.statusBadge,
                                                u.status === 'Active' ? styles.statusActive :
                                                    u.status === 'Inactive' ? styles.statusInactive :
                                                        styles.statusWaiting
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    u.status === 'Active' ? { color: '#10b981' } :
                                                        u.status === 'Inactive' ? { color: '#ef4444' } :
                                                            { color: '#f59e0b' }
                                                ]}>
                                                    {u.status === 'waiting' ? 'Pending' : u.status}
                                                </Text>
                                            </View>
                                                                  <View style={[styles.cell, { width: 200, flexDirection: 'row', gap: 8, justifyContent: 'center' }]}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, u.status === 'Active' ? styles.deactivateBtn : styles.activateBtn]}
                                                onPress={() => handleToggle(u.id, u.status, activeTab === 'buyers' ? 'buyer' : 'seller')}
                                            >
                                                <Text style={styles.actionBtnText}>
                                                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => handleDeleteUser(u.id, activeTab === 'buyers' ? 'buyer' : 'seller')}
                                            >
                                                <Text style={styles.actionBtnText}>🗑️ Delete</Text>
                                            </TouchableOpacity>
                                        </View>                         </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    {/* Table Footer */}
                    <View style={styles.tableFooter}>
                        <Text style={styles.footerText}>
                            Showing <Text style={{ color: '#8b5cf6', fontWeight: '700' }}>{filtered.length}</Text> of <Text style={{ color: '#8b5cf6', fontWeight: '700' }}>{currentList.length}</Text> {activeTab}
                        </Text>
                    </View>
                </View>

            </Animated.ScrollView>

            {/* Verification Modal */}
            {verifyModalVisible && selectedTxn && (() => {
                const buyerTxn = selectedTxn.buyer_transaction_id;
                const sellerTxn = selectedTxn.seller_transaction_id;
                const bothProvided = buyerTxn && sellerTxn;
                const idsMatch = bothProvided && (buyerTxn === sellerTxn);
                const idsMismatch = bothProvided && (buyerTxn !== sellerTxn);

                return (
                    <View style={styles.modalBg}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>🔍 Transaction Verification</Text>
                            <View style={styles.verifyVehicleRow}>
                                <Text style={styles.verifyVehicleLabel}>Vehicle:</Text>
                                <Text style={styles.verifyVehicle}>{selectedTxn.vehicle_number}</Text>
                                <Text style={styles.verifyPrice}>₹{selectedTxn.price}</Text>
                            </View>

                            {/* Buyer TXN */}
                            <View style={[styles.verifyRow, { borderColor: buyerTxn ? '#3b82f6' : '#ef4444' }]}>
                                <View style={styles.verifyStepIcon}>
                                    <Text style={styles.verifyStepNumber}>1</Text>
                                </View>
                                <View style={styles.verifyContent}>
                                    <Text style={styles.verifyStepLabel}>Buyer's Payment TXN ID</Text>
                                    <Text style={[styles.verifyValue, { color: buyerTxn ? '#3b82f6' : '#ef4444' }]}>
                                        {buyerTxn || '❌ Buyer did not provide Transaction ID'}
                                    </Text>
                                    <Text style={styles.verifyHint}>Auto-generated when buyer clicked "Buy with Blockchain"</Text>
                                </View>
                            </View>

                            {/* Seller TXN */}
                            <View style={[styles.verifyRow, { borderColor: sellerTxn ? '#10b981' : '#f59e0b' }]}>
                                <View style={styles.verifyStepIcon}>
                                    <Text style={styles.verifyStepNumber}>2</Text>
                                </View>
                                <View style={styles.verifyContent}>
                                    <Text style={styles.verifyStepLabel}>Seller's Payment TXN ID</Text>
                                    <Text style={[styles.verifyValue, { color: sellerTxn ? '#10b981' : '#f59e0b' }]}>
                                        {sellerTxn || '⏳ Seller has not entered TXN ID yet'}
                                    </Text>
                                    <Text style={styles.verifyHint}>Seller enters this from their bank/UPI statement</Text>
                                </View>
                            </View>

                            {/* Result */}
                            <View style={[
                                styles.verifyResultBox,
                                idsMatch ? styles.verifyResultMatch :
                                    idsMismatch ? styles.verifyResultMismatch :
                                        styles.verifyResultPending
                            ]}>
                                <Text style={styles.verifyResultText}>
                                    {!bothProvided
                                        ? '⏳ Waiting for both parties to provide their TXN IDs'
                                        : idsMatch
                                            ? '✅ Transaction IDs MATCH! Safe to process payment'
                                            : '₹š ï¸ Transaction IDs DO NOT MATCH ₹€” Do NOT approve!'}
                                </Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setVerifyModalVisible(false)}>
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnConfirm, !idsMatch && styles.modalBtnDisabled]}
                                    onPress={handleApproveTransaction}
                                    disabled={!idsMatch}
                                >
                                    <Text style={styles.modalBtnConfirmText}>
                                        {idsMatch ? '✅ Process Payment' : '🔒 Cannot Approve'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            })()}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { 
        flex: 1, 
        backgroundColor: '#050510',
    },

    // TOAST - Enhanced
    toast: {
        position: 'absolute', top: 90, left: (Platform.OS === 'web') ? '50%' : 20, 
        transform: [{ translateX: (Platform.OS === 'web') ? -210 : 0 }],
        width: (Platform.OS === 'web') ? 420 : '90%',
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 16,
        borderRadius: 16, zIndex: 999, 
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        elevation: 10,
    },
    toastSuccess: { 
        backgroundColor: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(34,197,94,0.15))', 
        borderColor: 'rgba(16,185,129,0.5)',
        borderWidth: 1,
    },
    toastError: { 
        backgroundColor: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(248,113,113,0.15))', 
        borderColor: 'rgba(239,68,68,0.5)',
        borderWidth: 1,
    },
    toastText: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },

    // NAVBAR - Premium Glass Effect
    navbar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#0f172a',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    navLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    shieldIcon: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: 'rgba(240, 185, 11, 0.15)', 
        borderWidth: 2, borderColor: '#f0b90b',
        alignItems: 'center', justifyContent: 'center',
    },
    navTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    adminBadge: {
        backgroundColor: 'rgba(240, 185, 11, 0.2)', 
        borderWidth: 1, borderColor: '#f0b90b',
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    },
    adminBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
    navRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    refreshBtn: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(248, 113, 113, 0.15)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)',
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    },
    logoutBtnText: { color: '#f87171', fontSize: 14, fontWeight: '700' },

    scroll: { flex: 1 },
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingVertical: 24, 
        paddingBottom: 80 
    },

    // WELCOME SECTION
    welcomeRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 36,
    },
    welcomeHello: { fontSize: 16, color: '#94a3b8', fontWeight: '700', marginBottom: 4 },
    welcomeName: { fontSize: 32, color: '#ffffff', fontWeight: '900', letterSpacing: -1 },
    welcomeSub: { fontSize: 14, color: '#64748b', fontWeight: '600' },

    // STATS CARDS - Glass morphism
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 40,
    },
    statCard: {
        flex: 1, minWidth: 160, 
        borderRadius: 24, borderWidth: 1,
        padding: 24, paddingVertical: 32,
        position: 'relative', overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20,
        elevation: 10,
    },
    statGlow: {
        position: 'absolute', top: -10, right: -10,
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statValue: { fontSize: 42, fontWeight: '900', marginBottom: 6, letterSpacing: -1 },
    statLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.9 },

    // TABLE SECTION - Premium Design
    tableSection: {
        backgroundColor: '#111827', 
        borderRadius: 32,
        borderWidth: 1, borderColor: '#374151',
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 25 }, shadowOpacity: 0.5, shadowRadius: 45,
        elevation: 20,
    },
    tableHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 24, paddingVertical: 24,
        backgroundColor: '#3730a3',
        borderBottomWidth: 2, borderBottomColor: '#4f46e5',
    },
    tableTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },

    // TABS - Vibrant Colors
    tabsScrollRow: {
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    tabsRow: {
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 24, paddingVertical: 16,
    },
    tab: {
        paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16,
        backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6,
    },
    tabActive: { 
        backgroundColor: '#4f46e5', 
        borderColor: '#818cf8',
        shadowColor: '#6366f1', shadowOpacity: 0.4,
    },
    tabActiveSeller: { 
        backgroundColor: 'rgba(245, 158, 11, 0.2)', 
        borderColor: 'rgba(245, 158, 11, 0.5)',
        shadowColor: '#f59e0b', shadowOpacity: 0.3,
    },
    tabActiveTransactions: { 
        backgroundColor: 'rgba(16, 185, 129, 0.2)', 
        borderColor: 'rgba(16, 185, 129, 0.5)',
        shadowColor: '#10b981', shadowOpacity: 0.3,
    },
    tabActiveVehicles: { 
        backgroundColor: 'rgba(139, 92, 246, 0.2)', 
        borderColor: 'rgba(139, 92, 246, 0.5)',
        shadowColor: '#8b5cf6', shadowOpacity: 0.3,
    },
    tabText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
    tabTextActive: { color: '#f0b90b' },
    tabTextActiveSeller: { color: '#f59e0b' },
    tabTextActiveTransactions: { color: '#10b981' },
    tabTextActiveVehicles: { color: '#8b5cf6' },

    // SEARCH - Modern Glass
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        marginHorizontal: 24, marginVertical: 24,
        backgroundColor: '#1f2937', 
        borderRadius: 16,
        borderWidth: 1, borderColor: '#4b5563',
        paddingHorizontal: 20, height: 56,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    searchInput: { 
        flex: 1, color: '#f8fafc', fontSize: 16, fontWeight: '500',
        outlineStyle: 'none',
    },

    // TABLE - Professional
    colHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 20,
        backgroundColor: '#111827',
        borderTopWidth: 1, borderBottomWidth: 2, borderColor: '#374151',
    },
    colHeaderText: { 
        color: '#f8fafc', fontSize: 13, fontWeight: '900', 
        textTransform: 'uppercase', letterSpacing: 1.5, paddingRight: 12,
    },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 18,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
        minHeight: 54,
    },
    tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
    cell: { color: '#e2e8f0', fontSize: 13, paddingRight: 12 },
    cellLoginId: { color: '#60a5fa', fontWeight: '700' },
    cellVehicle: { color: '#f59e0b', fontWeight: '700' },
    cellName: { color: '#f8fafc', fontWeight: '600' },
    cellEmail: { color: '#cbd5e1', fontSize: 12 },
    cellMobile: { color: '#94a3b8' },

    // STATUS BADGES - Enhanced
    statusBadge: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, alignSelf: 'flex-start',
    },
    statusActive: { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.5)' },
    statusInactive: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.5)' },
    statusWaiting: { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.5)' },
    statusText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

    // ACTION BUTTONS - Modern
    actionBtn: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
        borderWidth: 1, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    activateBtn: {
        backgroundColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.5)',
    },
    deactivateBtn: {
        backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.5)',
    },
    deleteBtn: {
        backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.5)',
    },
    actionBtnText: { color: '#f8fafc', fontSize: 13, fontWeight: '800' },

    // EMPTY/STATES
    loadingRow: { alignItems: 'center', paddingVertical: 80, gap: 16 },
    loadingText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
    emptyRow: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { color: '#64748b', fontSize: 16, fontWeight: '600' },

    tableFooter: {
        paddingHorizontal: 24, paddingVertical: 20,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    footerText: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    // MODAL - Premium Design
    modalBg: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center',
        padding: 24, zIndex: 1000,
    },
    modalCard: {
        backgroundColor: 'rgba(15, 15, 35, 0.98)',
        width: '100%', maxWidth: 480, maxHeight: '90%',
        borderRadius: 24, padding: 32, 
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 30 }, shadowOpacity: 0.4, shadowRadius: 40,
        elevation: 20,
    },
    modalTitle: { color: '#f8fafc', fontSize: 24, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    verifyVehicleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24,
        padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    verifyVehicleLabel: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
    verifyVehicle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
    verifyPrice: { color: '#10b981', fontWeight: '800', fontSize: 18 },
    verifyRow: {
        flexDirection: 'row', gap: 16, borderRadius: 16, padding: 20, marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 2,
    },
    verifyStepIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    verifyStepNumber: { color: '#8b5cf6', fontSize: 18, fontWeight: '800' },
    verifyContent: { flex: 1 },
    verifyStepLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    verifyValue: { fontSize: 16, fontWeight: '800', marginBottom: 6, fontFamily: 'monospace' },
    verifyHint: { color: '#64748b', fontSize: 12, fontWeight: '500' },
    verifyResultBox: {
        borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 2,
    },
    verifyResultMatch: { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981' },
    verifyResultMismatch: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444' },
    verifyResultPending: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: '#f59e0b' },
    verifyResultText: { color: '#f8fafc', fontWeight: '800', fontSize: 16, textAlign: 'center', lineHeight: 24 },

    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8 },
    modalBtnCancel: { 
        paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    modalBtnCancelText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
    modalBtnConfirm: { 
        backgroundColor: '#8b5cf6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12,
        shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    modalBtnDisabled: {
        backgroundColor: 'rgba(71, 85, 105, 0.5)', 
        shadowOpacity: 0,
    },
    modalBtnConfirmText: { color: '#f8fafc', fontWeight: '800', fontSize: 15 },
});

export default AdminDashboard;