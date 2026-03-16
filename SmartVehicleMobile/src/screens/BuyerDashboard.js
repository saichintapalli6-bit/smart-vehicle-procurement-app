import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform, 
  Linking, 
  Modal,
  Animated,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, RefreshCcw, FileText, List, Car, Shield, Zap, Crown } from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS, API_BASE } from '../config/api';

const BuyerDashboard = ({ route, navigation }) => {
    const { user } = route.params;
    const [activeTab, setActiveTab] = useState('browse');
    const [vehicles, setVehicles] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { width: screenWidth } = useWindowDimensions();
    const isLargeScreen = Platform.OS === 'web' || screenWidth > 768;
    const isTablet = screenWidth > 480 && screenWidth <= 768;

    // Purchase Modal States
    const [buyModalVisible, setBuyModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [generatedTxnId, setGeneratedTxnId] = useState('');
    const [purchasing, setPurchasing] = useState(false);

    // 🎨 PROFESSIONAL ANIMATIONS
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];
    const scaleAnim = useState(new Animated.Value(1))[0];

    const generateTxnId = useCallback(() => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN${timestamp}${random}`;
    }, []);

    const API_GET_VEHICLES = ENDPOINTS.BROWSE_VEHICLES;
    const API_PURCHASE = ENDPOINTS.PURCHASE;
    const API_TRANSACTIONS = ENDPOINTS.BUYER_TRANSACTIONS;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'browse') {
                const response = await axios.get(API_GET_VEHICLES);
                setVehicles(response.data);
            } else {
                console.log(`Fetching transactions for buyer_id=${user.id}`);
                const url = `${API_TRANSACTIONS}?buyer_id=${user.id}`;
                console.log('URL:', url);
                const response = await axios.get(url);
                console.log('Transactions response:', response.data);
                setTransactions(response.data);
            }
        } catch (error) {
            console.error('fetchData error:', error.response?.data || error.message);
            if (Platform.OS === 'web') {
                window.alert(`Error loading data: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, user.id]);

    // ✨ ENTRANCE ANIMATION
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeTab, fetchData]);

    const handlePurchaseClick = useCallback((vehicle) => {
        setSelectedVehicle(vehicle);
        setGeneratedTxnId(generateTxnId());
        setBuyModalVisible(true);
    }, [generateTxnId]);

    const confirmPurchase = useCallback(async () => {
        setBuyModalVisible(false);
        setPurchasing(true);
        try {
            const res = await axios.post(API_PURCHASE, {
                vehicle_number: selectedVehicle.vehicle_number,
                buyer_id: user.id,
                buyer_name: user.name,
                buyer_transaction_id: generatedTxnId
            });

            if (res.data.status === 'success') {
                const msg = `Purchase successful!\\n\\nYour Transaction ID:\\n${generatedTxnId}\\n\\nBlockchain Hash:\\n${res.data.transaction_id?.substring(0, 30)}...`;
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('✅ Purchase Successful', msg);
                }
                fetchData();
            }
        } catch (error) {
            const errMsg = error.response?.data?.error || 'Transaction failed. Please try again.';
            if (Platform.OS === 'web') {
                window.alert(errMsg);
            } else {
                Alert.alert('❌ Error', errMsg);
            }
        } finally {
            setPurchasing(false);
        }
    }, [selectedVehicle, user.id, generatedTxnId, fetchData]);

    const openDocument = useCallback((docPath) => {
        if (!docPath) {
            Alert.alert("Notice", "No document available for this vehicle.");
            return;
        }
        
        if (docPath.startsWith('data:')) {
            if (Platform.OS === 'web') {
                const win = window.open();
                win.document.write('<iframe src="' + docPath + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
            } else {
                Alert.alert("Blockchain Document", "This document is stored on the blockchain as a data string. For technical reasons, please view it on the web version for full resolution.");
            }
            return;
        }

        const url = docPath.startsWith('http') ? docPath : `${API_BASE}${docPath}`;
        console.log('Opening document URL:', url);
        Linking.openURL(url).catch(err => {
            console.error("Couldn't load page", err);
            if (Platform.OS === 'web') {
                window.open(url, '_blank');
            } else {
                Alert.alert("Wait", "Could not open the document directly. Trying to open in browser...");
                Linking.openURL(url);
            }
        });
    }, []);

    const renderVehicle = useCallback(({ item }) => (
        <Animated.View style={[
            styles.card,
            {
                opacity: fadeAnim,
                transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                ],
                width: isLargeScreen ? '48%' : '100%',
                marginRight: isLargeScreen ? 12 : 0,
            }
        ]}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.photo_url ? (item.photo_url.startsWith('http') || item.photo_url.startsWith('data:') ? item.photo_url : `${API_BASE}${item.photo_url}`) : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.cardImage}
                    resizeMode="contain" // Contain ensures the FULL image is visible
                />
            </View>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.cardOverlay}
            />
            <View style={styles.cardContent}>
                {/* ✨ VERIFIED BADGE */}
                <View style={styles.verifiedBadge}>
                    <Shield color="#6366f1" size={16} />
                    <Text style={styles.verifiedText}>Blockchain Verified</Text>
                </View>
                
                <Text style={styles.vehicleNum}>{item.vehicle_number}</Text>
                <Text style={styles.price}>₹{Number(item.price).toLocaleString('en-IN')}</Text>
                <Text style={styles.accidents}>Accidents: {item.accidents_history || 'None'}</Text>

                {item.documents_url ? (
                    <TouchableOpacity 
                        style={styles.docButton} 
                        onPress={() => {
                            const fullUrl = item.documents_url.startsWith('http') || item.documents_url.startsWith('data:') 
                                ? item.documents_url 
                                : `${API_BASE}${item.documents_url}`;
                            openDocument(fullUrl);
                        }}
                    >
                        <FileText color="#f59e0b" size={18} />
                        <Text style={styles.docButtonText}>View Ownership Document</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.docButton, { opacity: 0.6, borderColor: '#334155' }]}>
                        <FileText color="#94a3b8" size={18} />
                        <Text style={[styles.docButtonText, { color: '#94a3b8' }]}>Document Pending</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.buyButton} onPress={() => handlePurchaseClick(item)}>
                    <Zap color="#ffffff" size={20} />
                    <Text style={styles.buyButtonText}>Buy with Blockchain</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    ), [openDocument, handlePurchaseClick, fadeAnim, slideAnim, scaleAnim]);

    const renderTransaction = useCallback(({ item }) => {
        const statusColor = item.status === 'approved' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#94a3b8';
        const statusIcon = item.status === 'approved' ? '✅' : item.status === 'pending' ? '⏳' : '❓';
        return (
            <View style={styles.txnCard}>
                <LinearGradient
                    colors={[`${statusColor}22`, `${statusColor}11`]}
                    style={styles.txnGradient}
                >
                    <View style={styles.txnHeader}>
                        <Text style={styles.txnVehicle}>🚗 {item.vehicle_number}</Text>
                        <View style={[styles.txnStatusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}33` }]}>
                            <Text style={[styles.txnStatusText, { color: statusColor }]}>{statusIcon} {item.status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <Text style={styles.txnPrice}>₹{Number(item.price).toLocaleString('en-IN')}</Text>

                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Your TXN ID</Text>
                    <Text style={styles.txnDetailValue}>{item.buyer_transaction_id || '—'}</Text>
                </View>
                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Seller TXN ID</Text>
                    <Text style={[styles.txnDetailValue, { color: item.seller_transaction_id ? '#10b981' : '#f87171' }]}>
                        {item.seller_transaction_id || 'Awaiting seller...'}
                    </Text>
                </View>
                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Date</Text>
                    <Text style={styles.txnDetailValue}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>

                {item.documents_url ? (
                    <TouchableOpacity 
                        style={[styles.docButton, { marginTop: 10, width: '100%' }]} 
                        onPress={() => {
                            const fullUrl = item.documents_url.startsWith('http') || item.documents_url.startsWith('data:') 
                                ? item.documents_url 
                                : `${API_BASE}${item.documents_url}`;
                            openDocument(fullUrl);
                        }}
                    >
                        <FileText color="#f59e0b" size={18} />
                        <Text style={styles.docButtonText}>Ownership Document (Transfer Proof)</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.docButton, { marginTop: 10, width: '100%', opacity: 0.6, borderColor: '#334155' }]}>
                        <FileText color="#94a3b8" size={18} />
                        <Text style={[styles.docButtonText, { color: '#94a3b8' }]}>Transfer Proof Pending</Text>
                    </View>
                )}

                {item.hash_code && (
                    <View style={styles.hashContainer}>
                        <Text style={styles.txnHash}>🔗 Hash: {item.hash_code}</Text>
                    </View>
                )}
            </View>
        );
    }, [openDocument]);

    return (
        <View style={styles.container}>
            <AnimatedBackground
                colors={['#0f0f23', '#1a1a2e', '#16213e', '#0f0f23']}
                particleColor="#6366f1"
            />
            
            {/* ✨ ANIMATED HEADER */}
            <Animated.View style={[
                styles.headerContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.welcome}>Welcome back</Text>
                            <Text style={styles.userName}>{user.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutBtnSm} onPress={() => navigation.navigate('Home')}>
                            <LogOut color="#f87171" size={18} />
                            <Text style={styles.logoutTextSm}>Exit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {/* ✨ ANIMATED TABS */}
            <Animated.View style={[
                styles.tabsContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
                    onPress={() => setActiveTab('browse')}
                >
                    <Car color={activeTab === 'browse' ? '#6366f1' : '#94a3b8'} size={22} />
                    <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse Vehicles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <List color={activeTab === 'transactions' ? '#6366f1' : '#94a3b8'} size={22} />
                    <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>Transactions</Text>
                </TouchableOpacity>
            </Animated.View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{activeTab === 'browse' ? 'Available Vehicles' : 'My Transactions'}</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <RefreshCcw color="#6366f1" size={22} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : activeTab === 'browse' ? (
                <FlatList
                    key={isLargeScreen ? 'browse-large' : 'browse-small'}
                    data={vehicles}
                    renderItem={renderVehicle}
                    keyExtractor={(item) => item.vehicle_number || String(item.id)}
                    numColumns={isLargeScreen ? 2 : 1}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1499786483962-2e27173aa5b1?auto=format&fit=crop&w=400&q=80' }}
                                style={styles.emptyImage}
                            />
                            <Text style={styles.emptyText}>No vehicles available</Text>
                            <Text style={styles.emptySubtext}>Check back later for new listings!</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    key="transactions"
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={1}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80' }}
                                style={styles.emptyImage}
                            />
                            <Text style={styles.emptyText}>No transactions found</Text>
                            <Text style={styles.emptySubtext}>Your purchases will appear here!</Text>
                        </View>
                    }
                />
            )}

            {/* ✨ PROFESSIONAL MODAL */}
            <Modal visible={buyModalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <Animated.View style={[
                        styles.modalCard,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}>
                        <LinearGradient
                            colors={['#1e1b4b', '#2d1b69', '#411e96']}
                            style={styles.modalGradient}
                        >
                            <Text style={styles.modalTitle}>Confirm Purchase</Text>
                            <Text style={styles.modalSub}>Vehicle: {selectedVehicle?.vehicle_number}</Text>
                            <Text style={styles.modalSub}>Price: ₹{selectedVehicle?.price}</Text>

                            <View style={styles.txnIdBox}>
                                <Text style={styles.txnIdLabel}>🔏 Auto-Generated Transaction ID</Text>
                                <Text style={styles.txnIdValue}>{generatedTxnId}</Text>
                                <Text style={styles.txnIdHint}>Share this ID with seller after payment</Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setBuyModalVisible(false)}>
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtnConfirm, purchasing && { opacity: 0.6 }]} 
                                    onPress={confirmPurchase} 
                                    disabled={purchasing}
                                >
                                    <Text style={styles.modalBtnConfirmText}>
                                        {purchasing ? 'Processing...' : 'Confirm & Pay'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    headerContainer: {
        paddingBottom: 10,
    },
    header: {
        paddingTop: Platform.OS === 'web' ? 40 : 50,
        paddingBottom: 25,
        paddingHorizontal: 24,
        backgroundColor: '#020617', // Solid Deep Navy
        borderBottomWidth: 3,
        borderBottomColor: '#f0b90b', // Gold Border
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcome: {
        color: '#cbd5e1',
        fontSize: 16,
        fontWeight: '500',
    },
    userName: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '900',
        marginTop: 4,
        letterSpacing: -0.5,
    },
    logoutBtnSm: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(248,113,113,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.3)',
    },
    logoutTextSm: { 
        color: '#f87171', 
        fontSize: 14, 
        fontWeight: '600' 
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    sectionTitle: {
        color: '#f8fafc',
        fontSize: 24,
        fontWeight: 'bold',
    },
    refreshBtn: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    list: {
        padding: 24,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#0f172a', // Solid Blue-Grey
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 32,
        borderWidth: 2,
        borderColor: '#1e3a8a',
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
        elevation: 12,
    },
    imageContainer: {
        width: '100%',
        height: 480, // Taller box for a more square/upright look
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    cardContent: {
        padding: 20,
        position: 'relative',
        zIndex: 1,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1e3a8a', // Solid Dark Blue
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        alignSelf: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    verifiedText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    vehicleNum: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    price: {
        color: '#10b981',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 12,
    },
    accidents: {
        color: '#94a3b8',
        fontSize: 16,
        marginBottom: 24,
        fontWeight: '600',
    },
    docButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b', // Solid Slate
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 24,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#f59e0b', // Amber Border
    },
    docButtonText: {
        color: '#f59e0b',
        fontWeight: '800',
        marginLeft: 12,
        fontSize: 16,
    },
    buyButton: {
        height: 64,
        borderRadius: 24,
        backgroundColor: '#4f46e5', // Solid Indigo
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#818cf8',
        shadowColor: '#4f46e5',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buyButtonGradient: {
        display: 'none', // Removed gradient in favor of solid
    },
    buyButtonText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginBottom: 32,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 12,
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 16,
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 32,
        gap: 16,
        paddingBottom: 32,
        backgroundColor: '#1e293b', // Slate for Nav
        marginHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 20,
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    activeTab: {
        backgroundColor: '#6366f1',
        borderColor: '#818cf8',
        shadowColor: '#6366f1',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    tabText: {
        color: '#94a3b8',
        fontWeight: '800',
        fontSize: 16,
    },
    activeTabText: {
        color: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    loadingText: {
        color: '#6366f1',
        fontSize: 18,
        marginTop: 16,
        fontWeight: '500',
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    modalGradient: {
        width: '100%',
        maxWidth: 440,
        borderRadius: 28,
        padding: 36,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    modalCard: {
        maxHeight: '85%',
    },
    modalTitle: {
        color: '#f8fafc',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalSub: {
        color: '#cbd5e1',
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    txnIdBox: {
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.4)',
        borderRadius: 20,
        padding: 24,
        marginTop: 28,
        marginBottom: 32,
    },
    txnIdLabel: { 
        color: '#94a3b8', 
        fontSize: 14, 
        fontWeight: '600', 
        marginBottom: 12,
        textAlign: 'center',
    },
    txnIdValue: { 
        color: '#6366f1', 
        fontSize: 18, 
        fontWeight: 'bold', 
        fontFamily: 'monospace', 
        marginBottom: 12,
        textAlign: 'center',
    },
    txnIdHint: { 
        color: '#64748b', 
        fontSize: 14, 
        textAlign: 'center',
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    modalBtnCancel: {
        flex: 1,
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.4)',
        alignItems: 'center',
    },
    modalBtnCancelText: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: 17,
    },
    modalBtnConfirm: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalBtnConfirmText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 17,
    },
    txnCard: {
        backgroundColor: '#111827', // Solid Black/Charcoal
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#1e3a8a',
        padding: 0,
        marginBottom: 24,
        marginHorizontal: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    txnGradient: {
        padding: 24,
    },
    txnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    txnVehicle: { 
        color: '#f8fafc', 
        fontSize: 22, 
        fontWeight: 'bold' 
    },
    txnStatusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
    },
    txnStatusText: { 
        fontSize: 14, 
        fontWeight: '700' 
    },
    txnPrice: { 
        color: '#10b981', 
        fontSize: 28, 
        fontWeight: 'bold', 
        textAlign: 'center',
        marginVertical: 20,
    },
    txnDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    txnDetailLabel: { 
        color: '#94a3b8', 
        fontSize: 15, 
        flex: 1,
        fontWeight: '500',
    },
    txnDetailValue: { 
        color: '#f1f5f9', 
        fontSize: 15, 
        flex: 2, 
        textAlign: 'right',
        fontWeight: '600',
    },
    hashContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(99,102,241,0.15)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
    },
    txnHash: {
        color: '#6366f1',
        fontSize: 13,
        fontFamily: 'monospace',
    },
});

export default BuyerDashboard;
