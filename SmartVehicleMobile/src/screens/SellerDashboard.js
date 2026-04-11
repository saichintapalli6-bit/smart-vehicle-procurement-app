import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Platform, Image,
    KeyboardAvoidingView, Dimensions, Animated, Easing, useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Car, PlusCircle, History, LogOut, RefreshCcw, CheckCircle, 
    XCircle, Hash, AlertTriangle, FileText, Upload, Shield, 
    Sparkles, ChevronRight, Database, Zap, Camera, File, Trash2
} from 'lucide-react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS } from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(1400, SCREEN_WIDTH);

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SellerDashboard = ({ route, navigation }) => {
    const user = route?.params?.user || { name: 'Saisanthosh', id: 'seller_001' };

    // 🎬 SMOOTH PROFESSIONAL ANIMATIONS
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(100)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' || screenWidth > 1024;
    const isTablet = Platform.OS !== 'web' && screenWidth > 600 && screenWidth <= 1024;
    const isMobile = Platform.OS !== 'web' && screenWidth <= 600;

    const [activeTab, setActiveTab] = useState('add');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [focusField, setFocusField] = useState(null);

    const [form, setForm] = useState({
        vehicle_number: '', price: '', accidents_history: '',
        photo_url: '', documents_url: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [docFile, setDocFile] = useState(null);

    const [txnModalVisible, setTxnModalVisible] = useState(false);
    const [selectedHash, setSelectedHash] = useState('');
    const [sellerTxnIdInput, setSellerTxnIdInput] = useState('');

    // 🗑️ DELETE CONFIRMATION STATE
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ✨ ENTRANCE ANIMATION
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 120,
                friction: 8,
                useNativeDriver: false,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 150,
                friction: 10,
                useNativeDriver: false,
            })
        ]).start();

        // 🌟 Continuous glow effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: false })
            ])
        ).start();
    }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4500);
    };

    const openTxnModal = (hash) => {
        setSelectedHash(hash);
        setSellerTxnIdInput('');
        setTxnModalVisible(true);
    };

    const submitSellerTxnId = async () => {
        if (!sellerTxnIdInput.trim()) {
            showToast('error', 'Please enter your Transaction ID');
            return;
        }
        try {
            const res = await axios.post(ENDPOINTS.SELLER_UPDATE_TRANSACTION, {
                hash_code: selectedHash,
                seller_transaction_id: sellerTxnIdInput
            });
            setTxnModalVisible(false);
            showToast('success', res.data.message || 'Transaction ID submitted successfully!');
            fetchHistory();
        } catch (err) {
            showToast('error', err.response?.data?.error || 'Failed to submit transaction ID');
        }
    };

    // 🗑️ DELETE VEHICLE HANDLER
    const openDeleteModal = (vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteModalVisible(true);
    };

    const handleDeleteVehicle = async () => {
        if (!vehicleToDelete) return;
        setDeleting(true);
        try {
            await axios.delete(ENDPOINTS.SELLER_DELETE_VEHICLE(vehicleToDelete.id), {
                data: { seller_id: user.id }
            });
            setDeleteModalVisible(false);
            setVehicleToDelete(null);
            showToast('success', `Vehicle ${vehicleToDelete.vehicle_number} deleted successfully! 🗑️`);
            fetchHistory();
        } catch (err) {
            showToast('error', err.response?.data?.error || 'Failed to delete vehicle');
        } finally {
            setDeleting(false);
        }
    };

    const fetchHistory = useCallback(async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${ENDPOINTS.SELLER_VEHICLE_HISTORY}?seller_id=${user.id}`);
            setVehicles(res.data);
        } catch {
            showToast('error', 'Failed to load vehicle history');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, fetchHistory]);

    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: null }));
    };

    const validate = () => {
        const e = {};
        const vn = form.vehicle_number.trim().toUpperCase();
        if (!vn) e.vehicle_number = 'Vehicle number is required';
        else if (!/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(vn))
            e.vehicle_number = 'Format: AP34DH5001';
        if (!form.price.trim()) e.price = 'Price is required';
        else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
            e.price = 'Enter a valid price';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    const pickPhotoFile = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    setPhotoFile({ 
                        name: file.name, 
                        base64: evt.target.result.split(',')[1], 
                        preview: evt.target.result, 
                        size: file.size 
                    });
                    update('photo_url', '');
                };
                reader.readAsDataURL(file);
            };
            input.click();
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setPhotoFile({
                    name: asset.fileName || 'vehicle_photo.jpg',
                    base64: asset.base64,
                    preview: asset.uri,
                    size: asset.fileSize
                });
                update('photo_url', '');
                showToast('success', 'Photo selected successfully');
            }
        }
    };

    const pickDocFile = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx,.txt';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    setDocFile({ 
                        name: file.name, 
                        base64: evt.target.result.split(',')[1], 
                        size: file.size 
                    });
                    update('documents_url', '');
                };
                reader.readAsDataURL(file);
            };
            input.click();
        } else {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                try {
                    // 🚀 CRITICAL: Convert Document to Base64 for Backend Storage
                    const base64Content = await FileSystem.readAsStringAsync(asset.uri, {
                        encoding: 'base64',
                    });
                    
                    setDocFile({
                        name: asset.name,
                        base64: base64Content,
                        uri: asset.uri,
                        size: asset.size
                    });
                    update('documents_url', '');
                    showToast('success', 'Document converted and selected');
                } catch (err) {
                    console.error('File reading error:', err);
                    showToast('error', 'Could not process document file');
                }
            }
        }
    };

    const handleAddVehicle = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const vehicleData = {
                vehicle_number: form.vehicle_number,
                price: form.price,
                accidents_history: form.accidents_history,
                photo_url: form.photo_url,
                documents_url: form.documents_url,
                seller_id: user.id,
                photo_base64: photoFile?.base64 || null,
                doc_base64: docFile?.base64 || null
            };
            
            const response = await axios.post(ENDPOINTS.SELLER_ADD_VEHICLE, vehicleData);
            
            // Check for 201 Created (Backend success) or explicit status string
            if (response.status === 201 || response.data.status === 'success') {
                showToast('success', `Vehicle ${form.vehicle_number} listed on blockchain! 🚀`);
                setForm({ vehicle_number: '', price: '', accidents_history: '', photo_url: '', documents_url: '' });
                setPhotoFile(null);
                setDocFile(null);
                fetchHistory(); // ⚡ Refresh list immediately
            } else {
                throw new Error(response.data.message || 'Failed to add vehicle');
            }
        } catch (err) {
            console.error('Add vehicle error:', err);
            showToast('error', err.response?.data?.message || 'Failed to add vehicle connection error.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'available') return { bgColor: '#10B98120', textColor: '#10B981', label: '✓ Available' };
        if (status === 'pending') return { bgColor: '#F59E0B20', textColor: '#F59E0B', label: '⏳ Pending' };
        return { bgColor: '#EF444420', textColor: '#EF4444', label: '● Sold' };
    };

    return (
        <View style={styles.root}>
            {/* 🌌 ANIMATED SAPPHIRE BACKGROUND */}
            <AnimatedBackground colors={['#0A0E1A', '#1A1F35', '#0F172A', '#1E293B']} particleColor="#60A5FA" />
            
            {/* 🔔 PROFESSIONAL TOAST */}
            {toast && (
                <Animated.View style={[
                    styles.toast,
                    toast.type === 'success' ? styles.toastSuccess : styles.toastError,
                    { opacity: fadeAnim }
                ]}>
                    {toast.type === 'success' ? <CheckCircle color="#fff" size={24} /> : <XCircle color="#fff" size={24} />}
                    <Text style={styles.toastText}>{toast.msg}</Text>
                </Animated.View>
            )}

            {/* ⌨️ KEYBOARD AWARE WRAPPER (iOS Only, Android handles natively) */}
            <KeyboardAvoidingView 
                style={styles.contentArea} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled={Platform.OS === 'ios'}
            >
                <ScrollView 
                    horizontal={Platform.OS === 'web' && isDesktop} 
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollWrapper}
                    removeClippedSubviews={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scrollContentContainer,
                        isMobile && { paddingHorizontal: 16 }
                    ]}
                >
                <Animated.View style={[
                    styles.mainContainer,
                    {
                        opacity: fadeAnim,
                        transform: Platform.OS === 'web' ? [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ] : [],
                        width: isDesktop ? Math.min(1400, screenWidth) : SCREEN_WIDTH,
                    }
                ]}>{/* 👑 HERO HEADER */}
                    <View style={styles.heroHeader}>
                        <View style={styles.headerLeft}>
                            <Animated.View style={[styles.sellerIcon, { opacity: glowAnim }]}>
                                <Car color="#f0b90b" size={40} />
                            </Animated.View>
                            <View style={styles.headerText}>
                                <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
                                <Text style={styles.welcomeName}>{user.name}</Text>
                                <Text style={styles.welcomeSub}>Asset Governance & Fleet Management</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutBtnSolid} onPress={() => navigation.navigate('DrawerRoot')}>
                            <LogOut color="#F87171" size={isMobile ? 22 : 28} />
                        </TouchableOpacity>
                    </View>{/* 🎮 TAB NAVIGATION */}
                    <View style={styles.tabNavigation}>
                        {[
                            { key: 'add', icon: PlusCircle, label: 'Add Vehicle', color: '#10B981', active: activeTab === 'add' },
                            { key: 'history', icon: History, label: 'Vehicle History', color: '#f0b90b', active: activeTab === 'history' },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.tabBtn,
                                    tab.active && { backgroundColor: tab.key === 'add' ? '#065f46' : '#92400e', borderColor: tab.color },
                                    isMobile && { paddingVertical: 16, paddingHorizontal: 20 }
                                ]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <tab.icon size={isMobile ? 22 : 28} color={tab.active ? '#ffffff' : '#94A3B8'} />
                                <Text style={[
                                    styles.tabLabel,
                                    tab.active && { color: '#ffffff' },
                                    isMobile && { fontSize: 16 }
                                ]}>{tab.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>{/* 🎮 TAB NAVIGATION END */}

                    {/* 📱 MAIN CONTENT AREA */}
                    <View style={styles.contentArea}>
                        {/* ➕ ADD VEHICLE TAB */}
                        {activeTab === 'add' && (
                                <View style={styles.addVehicleSection}>{/* FORM PANEL */}
                                    <View style={styles.formPanel}>
                                        <View style={styles.formHeader}>
                                            <View style={styles.formBadge}>
                                                <Shield color="#ffffff" size={20} />
                                                <Text style={styles.formBadgeText}>Blockchain Verified</Text>
                                            </View>
                                            <Text style={styles.formMainTitle}>Register New Vehicle</Text>
                                            <Text style={styles.formSubTitle}>Enter asset details for immutable ledger registration</Text>
                                        </View>

                                        {/* ALL FORM FIELDS - SAME LOGIC */}
                                        <View style={styles.formFields}>
                                            {/* Vehicle Number */}
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Vehicle Number <Text style={styles.required}>*</Text></Text>
                                                <View style={[
                                                    styles.inputGroup,
                                                    focusField === 'vn' && styles.inputFocus,
                                                    formErrors.vehicle_number && styles.inputError
                                                ]}>
                                                    <Hash color={focusField === 'vn' ? '#60A5FA' : '#94A3B8'} size={24} />
                                                    <TextInput
                                                        style={styles.inputField}
                                                        placeholder="AP34DH5001"
                                                        value={form.vehicle_number}
                                                        onChangeText={(v) => update('vehicle_number', v.toUpperCase())}
                                                        autoCapitalize="characters"
                                                        onFocus={() => setFocusField('vn')}
                                                        onBlur={() => setFocusField(null)}
                                                        blurOnSubmit={false}
                                                    />
                                                </View>
                                                {formErrors.vehicle_number && <Text style={styles.errorText}>{formErrors.vehicle_number}</Text>}
                                            </View>

                                            {/* Price */}
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Asking Price <Text style={styles.required}>*</Text></Text>
                                                <View style={[
                                                    styles.inputGroup,
                                                    focusField === 'px' && styles.inputFocus,
                                                    formErrors.price && styles.inputError
                                                ]}>
                                                    <Text style={styles.currencyIcon}>₹</Text>
                                                    <TextInput
                                                        style={styles.inputField}
                                                        placeholder="250000"
                                                        value={form.price}
                                                        onChangeText={(v) => update('price', v)}
                                                        keyboardType="numeric"
                                                        onFocus={() => setFocusField('px')}
                                                        onBlur={() => setFocusField(null)}
                                                        blurOnSubmit={false}
                                                    />
                                                </View>
                                            </View>

                                            {/* Accidents History */}
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Accident History</Text>
                                                <View style={[styles.inputGroup, focusField === 'ac' && styles.inputFocus]}>
                                                    <AlertTriangle color={focusField === 'ac' ? '#60A5FA' : '#94A3B8'} size={24} />
                                                    <TextInput
                                                        style={[styles.inputField, styles.textArea]}
                                                        placeholder="No major accidents..."
                                                        value={form.accidents_history}
                                                        onChangeText={(v) => update('accidents_history', v)}
                                                        multiline
                                                        onFocus={() => setFocusField('ac')}
                                                        onBlur={() => setFocusField(null)}
                                                        blurOnSubmit={false}
                                                    />
                                                </View>
                                            </View>

                                            {/* Photo Field */}
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Vehicle Photo (URL or Upload)</Text>
                                                <View style={[styles.inputGroup, focusField === 'photo' && styles.inputFocus]}>
                                                    <Camera color={focusField === 'photo' ? '#10B981' : '#94A3B8'} size={24} />
                                                    <TextInput
                                                        style={styles.inputField}
                                                        placeholder="Paste image URL here..."
                                                        value={form.photo_url}
                                                        onChangeText={(v) => update('photo_url', v)}
                                                        onFocus={() => setFocusField('photo')}
                                                        onBlur={() => setFocusField(null)}
                                                        blurOnSubmit={false}
                                                    />
                                                </View>
                                                <TouchableOpacity style={styles.directUploadBtn} onPress={pickPhotoFile}>
                                                    <Upload color="#ffffff" size={20} />
                                                    <Text style={styles.directUploadText}>
                                                        {photoFile ? `✅ ${photoFile.name}` : 'Select Image File'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Documents Field */}
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Ownership Document (URL or Upload)</Text>
                                                <View style={[styles.inputGroup, focusField === 'doc' && styles.inputFocus]}>
                                                    <FileText color={focusField === 'doc' ? '#10B981' : '#94A3B8'} size={24} />
                                                    <TextInput
                                                        style={styles.inputField}
                                                        placeholder="Paste document URL here..."
                                                        value={form.documents_url}
                                                        onChangeText={(v) => update('documents_url', v)}
                                                        onFocus={() => setFocusField('doc')}
                                                        onBlur={() => setFocusField(null)}
                                                        blurOnSubmit={false}
                                                    />
                                                </View>
                                                <TouchableOpacity style={styles.directUploadBtn} onPress={pickDocFile}>
                                                    <File color="#ffffff" size={20} />
                                                    <Text style={styles.directUploadText}>
                                                        {docFile ? `✅ ${docFile.name}` : 'Select Document File'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* SUBMIT BUTTON */}
                                            <TouchableOpacity
                                                style={[styles.submitButton, submitting && styles.submitDisabled]}
                                                onPress={handleAddVehicle}
                                                disabled={submitting}
                                            >
                                                <LinearGradient
                                                    colors={['#10B981', '#059669', '#065f46']}
                                                    style={styles.submitGradient}
                                                >
                                                    {submitting ? (
                                                        <ActivityIndicator color="#fff" size="large" />
                                                    ) : (
                                                        <>
                                                            <Zap color="#fff" size={28} />
                                                            <Text style={styles.submitText}>🚀 List on Blockchain</Text>
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}{/* 📊 HISTORY TAB */}
                            {activeTab === 'history' && (
                                <View style={styles.historySection}>
                                    <View style={styles.historyHeroHeader}>
                                        <View style={styles.historyLeft}>
                                            <Database color="#f0b90b" size={36} />
                                            <View>
                                                <Text style={styles.historyTitle}>Your Vehicle Fleet</Text>
                                                <Text style={styles.historySubtitle}>{vehicles.length} assets registered</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.refreshBtnSolid} onPress={fetchHistory}>
                                            <RefreshCcw color="#f0b90b" size={24} />
                                        </TouchableOpacity>
                                    </View>

                                    {loading ? (
                                        <View style={styles.loadingCenter}>
                                            <ActivityIndicator color="#f0b90b" size="large" />
                                            <Text style={styles.loadingText}>Loading immutable ledger...</Text>
                                        </View>
                                    ) : vehicles.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Car color="#475569" size={80} />
                                            <Text style={styles.emptyTitle}>No assets found in governance</Text>
                                            <TouchableOpacity style={styles.addFirstButton} onPress={() => setActiveTab('add')}>
                                                <PlusCircle color="#10B981" size={24} />
                                                <Text style={styles.addFirstText}>Add First Vehicle</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.vehiclesGrid}>
                                                {vehicles.map((v, idx) => {
                                                    const status = getStatusColor(v.status);
                                                    return (
                                                        <View key={v.id} style={styles.vehicleCardHistory}>
                                                            <View style={styles.vehicleCardHeader}>
                                                                <View style={styles.vehicleNumberBadge}>
                                                                    <Text style={styles.vehicleNumberText}>#{String(idx + 1).padStart(2, '0')}</Text>
                                                                </View>
                                                                <Text style={styles.vehicleNumber}>{v.vehicle_number}</Text>
                                                            </View>
                                                            <Text style={styles.vehiclePrice}>₹{Number(v.price).toLocaleString()}</Text>
                                                            <View style={[styles.statusBadgeLarge, { backgroundColor: status.bgColor }]}>
                                                                <Text style={{ color: status.textColor, fontWeight: 'bold', fontSize: 16 }}>
                                                                    {status.label}
                                                                </Text>
                                                            </View>
                                                            {v.status === 'pending' && (
                                                                <TouchableOpacity style={styles.txnBtn} onPress={() => openTxnModal(v.block_hash)}>
                                                                    <Text style={styles.txnBtnText}>+ Add Transaction ID</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                            {/* 🗑️ DELETE BUTTON - only for available vehicles */}
                                                            {v.status === 'available' && (
                                                                <TouchableOpacity
                                                                    style={styles.deleteVehicleBtn}
                                                                    onPress={() => openDeleteModal(v)}
                                                                >
                                                                    <Trash2 color="#EF4444" size={18} />
                                                                    <Text style={styles.deleteVehicleBtnText}>Delete Vehicle</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* 🪟 TRANSACTION MODAL */}
            {txnModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Transaction ID</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter TXN ID"
                            value={sellerTxnIdInput}
                            onChangeText={setSellerTxnIdInput}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setTxnModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={submitSellerTxnId}>
                                <Text style={styles.modalConfirmText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* 🗑️ DELETE CONFIRMATION MODAL */}
            {deleteModalVisible && vehicleToDelete && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, styles.deleteModalContainer]}>
                        <View style={styles.deleteModalIcon}>
                            <Trash2 color="#EF4444" size={40} />
                        </View>
                        <Text style={styles.deleteModalTitle}>Delete Vehicle</Text>
                        <Text style={styles.deleteModalSubtitle}>
                            Are you sure you want to delete
                        </Text>
                        <Text style={styles.deleteModalVehicleNum}>
                            {vehicleToDelete.vehicle_number}
                        </Text>
                        <Text style={styles.deleteModalWarning}>
                            ⚠️ This will permanently remove the vehicle from all dashboards.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => { setDeleteModalVisible(false); setVehicleToDelete(null); }}
                                disabled={deleting}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.deleteConfirmBtn, deleting && { opacity: 0.6 }]}
                                onPress={handleDeleteVehicle}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Trash2 color="#fff" size={18} />
                                        <Text style={styles.deleteConfirmBtnText}>Yes, Delete</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    scrollWrapper: { flex: 1 },
    scrollContentContainer: { paddingHorizontal: SCREEN_WIDTH < 600 ? 12 : 40 },
    mainContainer: { 
        minHeight: '100%',
        paddingBottom: 100,
        paddingTop: 20
    },

    // 🌟 SOLID THEME
    solidCard: {
        backgroundColor: '#111827',
        borderWidth: 2,
        borderColor: '#1e293b',
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },

    // HEADER
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SCREEN_WIDTH < 600 ? 16 : 40,
        backgroundColor: '#020617',
        borderRadius: SCREEN_WIDTH < 600 ? 20 : 32,
        borderWidth: 2,
        borderColor: '#f0b90b',
        marginBottom: SCREEN_WIDTH < 600 ? 16 : 40,
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 20,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SCREEN_WIDTH < 600 ? 12 : 28 },
    welcomeTitle: { color: '#f0b90b', fontSize: SCREEN_WIDTH < 600 ? 11 : 18, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
    welcomeName: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 18 : 36, fontWeight: '900', letterSpacing: -1 },
    welcomeSub: { color: '#94a3b8', fontSize: SCREEN_WIDTH < 600 ? 11 : 16, fontWeight: '600', marginTop: 4 },
    sellerIcon: {
        width: SCREEN_WIDTH < 600 ? 44 : 80,
        height: SCREEN_WIDTH < 600 ? 44 : 80,
        borderRadius: SCREEN_WIDTH < 600 ? 14 : 24,
        backgroundColor: 'rgba(240,185,11,0.15)',
        borderWidth: 2,
        borderColor: '#f0b90b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutBtnSolid: {
        width: SCREEN_WIDTH < 600 ? 40 : 64,
        height: SCREEN_WIDTH < 600 ? 40 : 64,
        borderRadius: SCREEN_WIDTH < 600 ? 12 : 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        borderWidth: 1, borderColor: '#334155',
    },

    // TABS
    tabNavigation: {
        flexDirection: 'row',
        padding: SCREEN_WIDTH < 600 ? 8 : 16,
        gap: SCREEN_WIDTH < 600 ? 8 : 16,
        marginBottom: SCREEN_WIDTH < 600 ? 16 : 48,
        backgroundColor: '#1e293b',
        borderRadius: SCREEN_WIDTH < 600 ? 16 : 32,
        borderWidth: 2,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SCREEN_WIDTH < 600 ? 8 : 16,
        paddingVertical: SCREEN_WIDTH < 600 ? 12 : 24,
        paddingHorizontal: SCREEN_WIDTH < 600 ? 12 : 32,
        borderRadius: SCREEN_WIDTH < 600 ? 12 : 24,
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    tabLabel: { color: '#94A3B8', fontSize: SCREEN_WIDTH < 600 ? 13 : 18, fontWeight: '700' },

    // 🎮 CONTENT AREA
    contentArea: { flex: 1, width: '100%' },
    addVehicleSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 80,
    },
    formPanel: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: '#0f172a',
        borderRadius: SCREEN_WIDTH < 600 ? 20 : 32,
        padding: SCREEN_WIDTH < 600 ? 16 : 56,
        borderWidth: 2,
        borderColor: '#1e3a8a',
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 20,
    },
    formFields: { gap: SCREEN_WIDTH < 600 ? 16 : 28 },
    fieldGroup: { gap: SCREEN_WIDTH < 600 ? 8 : 12 },

    // FORM ELEMENTS
    formHeader: { marginBottom: SCREEN_WIDTH < 600 ? 20 : 40, alignItems: 'center' },
    formBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: SCREEN_WIDTH < 600 ? 14 : 24,
        paddingVertical: SCREEN_WIDTH < 600 ? 8 : 12,
        borderRadius: 30,
        backgroundColor: '#10b981',
        marginBottom: SCREEN_WIDTH < 600 ? 12 : 20,
        borderWidth: 1, borderColor: '#34d399',
    },
    formBadgeText: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 11 : 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    formMainTitle: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 22 : 32, fontWeight: '900', textAlign: 'center' },
    formSubTitle: { color: '#94a3b8', fontSize: SCREEN_WIDTH < 600 ? 13 : 16, textAlign: 'center', marginTop: 8 },

    fieldLabel: { color: '#f8fafc', fontSize: SCREEN_WIDTH < 600 ? 13 : 16, fontWeight: '800', marginBottom: SCREEN_WIDTH < 600 ? 6 : 12, letterSpacing: 0.5 },
    required: { color: '#ef4444' },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SCREEN_WIDTH < 600 ? 12 : 20,
        backgroundColor: '#1e293b',
        borderWidth: 2,
        borderColor: '#334155',
        borderRadius: SCREEN_WIDTH < 600 ? 14 : 24,
        paddingHorizontal: SCREEN_WIDTH < 600 ? 16 : 28,
        height: SCREEN_WIDTH < 600 ? 52 : 76,
    },
    inputFocus: {
        borderColor: '#f0b90b',
    },
    inputField: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: SCREEN_WIDTH < 600 ? 15 : 20,
        paddingVertical: 4,
    },
    textArea: {
        height: SCREEN_WIDTH < 600 ? 80 : 120,
        textAlignVertical: 'top',
        paddingTop: SCREEN_WIDTH < 600 ? 8 : 16,
    },
    currencyIcon: { color: '#f0b90b', fontSize: SCREEN_WIDTH < 600 ? 18 : 24, fontWeight: '900' },
    errorText: { color: '#EF4444', fontSize: 14, marginTop: 8 },

    directUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4f46e5',
        paddingVertical: SCREEN_WIDTH < 600 ? 10 : 14,
        paddingHorizontal: SCREEN_WIDTH < 600 ? 14 : 20,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#818cf8',
    },
    directUploadText: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 13 : 15, fontWeight: '700' },

    submitButton: {
        height: SCREEN_WIDTH < 600 ? 56 : 80,
        borderRadius: SCREEN_WIDTH < 600 ? 18 : 28,
        overflow: 'hidden',
        marginTop: SCREEN_WIDTH < 600 ? 20 : 32,
    },
    submitGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitText: { color: '#fff', fontSize: SCREEN_WIDTH < 600 ? 16 : 20, fontWeight: '900' },

    // HISTORY SECTION
    historySection: { width: '100%' },
    historyHeroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SCREEN_WIDTH < 600 ? 16 : 40,
        backgroundColor: '#312e81',
        borderRadius: SCREEN_WIDTH < 600 ? 16 : 32,
        marginBottom: SCREEN_WIDTH < 600 ? 16 : 40,
        borderWidth: 2,
        borderColor: '#4338ca',
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
    },
    historyLeft: { flexDirection: 'row', alignItems: 'center', gap: SCREEN_WIDTH < 600 ? 10 : 20 },
    historyTitle: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 18 : 32, fontWeight: '900' },
    historySubtitle: { color: '#94a3b8', fontSize: SCREEN_WIDTH < 600 ? 13 : 18 },
    refreshBtnSolid: {
        width: SCREEN_WIDTH < 600 ? 40 : 60,
        height: SCREEN_WIDTH < 600 ? 40 : 60,
        borderRadius: SCREEN_WIDTH < 600 ? 12 : 20,
        backgroundColor: '#4338ca', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#6366f1',
    },
    vehiclesGrid: {
        flexDirection: 'row',
        gap: 32,
        paddingVertical: 24,
    },
    vehicleCardHistory: {
        width: SCREEN_WIDTH < 600 ? SCREEN_WIDTH - 48 : 420,
        padding: SCREEN_WIDTH < 600 ? 20 : 48,
        gap: SCREEN_WIDTH < 600 ? 14 : 24,
        backgroundColor: '#111827',
        borderRadius: SCREEN_WIDTH < 600 ? 20 : 32,
        borderWidth: 2,
        borderColor: '#f0b90b',
        shadowColor: '#f0b90b', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 25,
        elevation: 12,
    },
    vehicleCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SCREEN_WIDTH < 600 ? 10 : 20 },
    vehicleNumberBadge: {
        paddingHorizontal: SCREEN_WIDTH < 600 ? 10 : 16,
        paddingVertical: SCREEN_WIDTH < 600 ? 6 : 12,
        borderRadius: 16,
        backgroundColor: 'rgba(240, 185, 11, 0.15)',
    },
    vehicleNumberText: { color: '#f0b90b', fontSize: SCREEN_WIDTH < 600 ? 13 : 16, fontWeight: '900' },
    vehicleNumber: { color: '#ffffff', fontSize: SCREEN_WIDTH < 600 ? 18 : 30, fontWeight: '900' },
    vehiclePrice: { color: '#10B981', fontSize: SCREEN_WIDTH < 600 ? 22 : 36, fontWeight: '900' },
    statusBadgeLarge: {
        paddingHorizontal: SCREEN_WIDTH < 600 ? 14 : 24,
        paddingVertical: SCREEN_WIDTH < 600 ? 8 : 12,
        borderRadius: SCREEN_WIDTH < 600 ? 14 : 24,
        alignSelf: 'flex-start',
    },
    txnBtn: {
        paddingHorizontal: SCREEN_WIDTH < 600 ? 16 : 24,
        paddingVertical: SCREEN_WIDTH < 600 ? 10 : 16,
        borderRadius: 16,
        alignSelf: 'flex-start',
        borderWidth: 1, borderColor: '#60A5FA30'
    },
    txnBtnText: { color: '#60A5FA', fontSize: SCREEN_WIDTH < 600 ? 13 : 16, fontWeight: '700' },

    // UTILITY
    loadingCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120, gap: 24 },
    loadingText: { color: '#94A3B8', fontSize: 18 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120, gap: 32 },
    emptyTitle: { color: '#94A3B8', fontSize: 24, fontWeight: '700' },
    addFirstButton: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 32, paddingVertical: 20, borderRadius: 24,
        backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 2, borderColor: '#10B981',
    },
    addFirstText: { color: '#10B981', fontSize: 18, fontWeight: '800' },

    // TOAST
    toast: {
        position: 'absolute', top: 120, left: 60, right: 60, zIndex: 1000,
        flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 24,
    },
    toastSuccess: { backgroundColor: '#10B981' },
    toastError: { backgroundColor: '#EF4444' },
    toastText: { color: '#fff', fontSize: 18, flex: 1, marginLeft: 16, fontWeight: '700' },

    // MODAL
    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 40, zIndex: 10000,
    },
    modalContainer: {
        width: '100%', maxWidth: 480, padding: 48,
        backgroundColor: '#111827', borderRadius: 32, borderWidth: 2, borderColor: '#f0b90b',
        shadowColor: '#f0b90b', shadowOffset: { width: 0, height: 30 }, shadowOpacity: 0.5, shadowRadius: 50, elevation: 25,
    },
    modalTitle: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
    modalInput: {
        backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#334155', borderRadius: 20,
        color: '#ffffff', padding: 20, fontSize: 18, marginBottom: 32,
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    modalCancel: { paddingHorizontal: 32, paddingVertical: 16 },
    modalCancelText: { color: '#94A3B8', fontSize: 18, fontWeight: '700' },
    modalConfirm: {
        paddingHorizontal: 40, paddingVertical: 16, borderRadius: 24,
        backgroundColor: '#f0b90b',
    },
    modalConfirmText: { color: '#000000', fontSize: 18, fontWeight: '800' },

    // 🗑️ DELETE VEHICLE BUTTON
    deleteVehicleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    deleteVehicleBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },

    // 🗑️ DELETE MODAL
    deleteModalContainer: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        alignItems: 'center',
    },
    deleteModalIcon: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239,68,68,0.15)',
        borderWidth: 2, borderColor: '#EF4444',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    deleteModalTitle: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
    deleteModalSubtitle: { color: '#94A3B8', fontSize: 16, textAlign: 'center' },
    deleteModalVehicleNum: { color: '#f0b90b', fontSize: 26, fontWeight: '900', textAlign: 'center', marginVertical: 8 },
    deleteModalWarning: { color: '#F59E0B', fontSize: 14, textAlign: 'center', marginBottom: 32, paddingHorizontal: 12 },
    deleteConfirmBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 36, paddingVertical: 16, borderRadius: 24,
        backgroundColor: '#EF4444',
    },
    deleteConfirmBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
});

export default SellerDashboard;
