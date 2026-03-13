import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Platform, Image, Linking,
    KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Car, PlusCircle, History, LogOut, RefreshCcw,
    CheckCircle, XCircle, Hash, AlertTriangle,
    FileText, ExternalLink, Upload, ImageIcon, ChevronRight,
} from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS } from '../config/api';

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SellerDashboard = ({ route, navigation }) => {
    const user = route?.params?.user || { name: 'Seller', id: '' };

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

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
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
        setTxnModalVisible(false);
        try {
            const res = await axios.post(ENDPOINTS.SELLER_UPDATE_TRANSACTION, {
                hash_code: selectedHash,
                seller_transaction_id: sellerTxnIdInput.trim(),
            });
            showToast('success', res.data.message || 'Transaction ID submitted');
        } catch {
            showToast('error', 'Failed to update transaction ID');
        }
    };

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ENDPOINTS.SELLER_VEHICLE_HISTORY}?seller_id=${user.id}`);
            setVehicles(res.data);
        } catch {
            showToast('error', 'Failed to load vehicle history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
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

    const pickPhotoFile = () => {
        if (Platform.OS !== 'web') return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                setPhotoFile({ name: file.name, base64: dataUrl.split(',')[1], preview: dataUrl, size: file.size });
                update('photo_url', '');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const pickDocFile = () => {
        if (Platform.OS !== 'web') return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                setDocFile({ name: file.name, base64: evt.target.result.split(',')[1], size: file.size });
                update('documents_url', '');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const handleAddVehicle = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                vehicle_number: form.vehicle_number.trim().toUpperCase(),
                price: form.price.trim(),
                accidents_history: form.accidents_history.trim(),
                seller_id: user.id,
                photo_url: photoFile ? '' : form.photo_url.trim(),
                documents_url: docFile ? '' : form.documents_url.trim(),
                ...(photoFile ? { photo_base64: photoFile.base64, photo_filename: photoFile.name } : {}),
                ...(docFile ? { doc_base64: docFile.base64, doc_filename: docFile.name } : {}),
            };
            const res = await axios.post(ENDPOINTS.SELLER_ADD_VEHICLE, payload);
            showToast('success', res.data.message || 'Vehicle added!');
            setForm({ vehicle_number: '', price: '', accidents_history: '', photo_url: '', documents_url: '' });
            setPhotoFile(null);
            setDocFile(null);
        } catch (err) {
            showToast('error', err.response?.data?.error || 'Failed to add vehicle.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'available') return { bg: '#dcfce7', text: '#16a34a', label: '✓ Available' };
        if (status === 'pending') return { bg: '#fef9c3', text: '#ca8a04', label: '⏳ Pending' };
        return { bg: '#fee2e2', text: '#dc2626', label: '● Sold' };
    };

    return (
        <View style={styles.root}>
            <AnimatedBackground colors={['#060714', '#0a1528', '#040f1c']} particleColor="#60a5fa" />

            {/* Toast */}
            {toast && (
                <View style={[styles.toast, toast.type === 'success' ? styles.toastGreen : styles.toastRed]}>
                    {toast.type === 'success'
                        ? <CheckCircle color="#16a34a" size={18} />
                        : <XCircle color="#dc2626" size={18} />}
                    <Text style={[styles.toastText, { color: toast.type === 'success' ? '#16a34a' : '#dc2626' }]}>
                        {toast.msg}
                    </Text>
                </View>
            )}

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                <View style={{ width: 1200, flex: 1 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <View style={styles.headerIcon}>
                                    <Car color="#60a5fa" size={20} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.headerTitle} numberOfLines={1}>Seller Portal</Text>
                                    <Text style={styles.headerSub} numberOfLines={1}>Welcome, {user.name}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Home')}>
                                <LogOut color="#ef4444" size={16} />
                            </TouchableOpacity>
                        </View>

                        {/* Tab Bar */}
                        <View style={styles.tabBar}>
                            {[
                                { key: 'add', icon: <PlusCircle size={16} color={activeTab === 'add' ? '#10b981' : '#64748b'} />, label: 'Add Vehicle' },
                                { key: 'history', icon: <History size={16} color={activeTab === 'history' ? '#60a5fa' : '#64748b'} />, label: 'My Vehicles' },
                            ].map((t) => (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[styles.tabBtn, activeTab === t.key && (t.key === 'add' ? styles.tabActiveGreen : styles.tabActiveBlue)]}
                                    onPress={() => setActiveTab(t.key)}
                                >
                                    {t.icon}
                                    <Text style={[styles.tabLabel, activeTab === t.key && { color: '#fff' }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Content */}
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={true}
                        >

                            {/* ── ADD VEHICLE TAB ── */}
                            {activeTab === 'add' && (
                                <View style={styles.addTabContainer}>
                                    {/* Info panel */}
                                    <View style={styles.infoPanel}>
                                        <View style={styles.infoBadge}>
                                            <Text style={styles.infoBadgeText}>🚗 List Your Vehicle</Text>
                                        </View>
                                        <Text style={styles.infoTitle}>Add Your Vehicle{'\n'}to Blockchain</Text>
                                        <Text style={styles.infoSub}>
                                            Register your vehicle on the blockchain network for secure and transparent trading.
                                        </Text>
                                        <View style={styles.infoSteps}>
                                            {[
                                                { icon: '🔢', title: 'Vehicle Number', desc: 'Format: AP34DH5001' },
                                                { icon: '💰', title: 'Set Price', desc: 'Enter asking price in INR' },
                                                { icon: '📷', title: 'Upload Photo', desc: 'JPG/PNG or image URL' },
                                                { icon: '📄', title: 'Upload Documents', desc: 'PDF ownership certificate' },
                                                { icon: '⛓️', title: 'Blockchain Secured', desc: 'Immutable record created' },
                                            ].map((s, i) => (
                                                <View key={i} style={styles.infoStep}>
                                                    <Text style={styles.infoStepIcon}>{s.icon}</Text>
                                                    <View>
                                                        <Text style={styles.infoStepTitle}>{s.title}</Text>
                                                        <Text style={styles.infoStepDesc}>{s.desc}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.formCard}>
                                        <LinearGradient
                                            colors={['rgba(96,165,250,0.08)', 'transparent']}
                                            style={StyleSheet.absoluteFillObject}
                                        />

                                        {/* Form Header */}
                                        <View style={styles.formHeader}>
                                            <View style={styles.formHeaderBadge}>
                                                <Text style={styles.formHeaderBadgeText}>⛓️ Blockchain</Text>
                                            </View>
                                            <Text style={styles.formTitle}>Register Vehicle</Text>
                                            <Text style={styles.formSubtitle}>Fill in the details to list your vehicle on the blockchain marketplace</Text>
                                        </View>

                                        {/* Vehicle Number */}
                                        <View style={styles.fGroup}>
                                            <Text style={styles.fLabel}>Vehicle Number *</Text>
                                            <View style={[styles.fRow, focusField === 'vn' && styles.fRowFocus, formErrors.vehicle_number && styles.fRowError]}>
                                                <Hash color={focusField === 'vn' ? '#60a5fa' : '#475569'} size={18} />
                                                <TextInput
                                                    style={styles.fInput}
                                                    placeholder="AP34DH5001"
                                                    placeholderTextColor="#334155"
                                                    value={form.vehicle_number}
                                                    onChangeText={(v) => update('vehicle_number', v.toUpperCase())}
                                                    autoCapitalize="characters"
                                                    maxLength={10}
                                                    onFocus={() => setFocusField('vn')}
                                                    onBlur={() => setFocusField(null)}
                                                />
                                            </View>
                                            {formErrors.vehicle_number
                                                ? <Text style={styles.fError}><AlertTriangle size={12} color="#ef4444" /> {formErrors.vehicle_number}</Text>
                                                : <Text style={styles.fHint}>Format: 2 letters + 2 digits + 2 letters + 4 digits</Text>
                                            }
                                        </View>

                                        {/* Price */}
                                        <View style={styles.fGroup}>
                                            <Text style={styles.fLabel}>Asking Price (₹) *</Text>
                                            <View style={[styles.fRow, focusField === 'px' && styles.fRowFocus, formErrors.price && styles.fRowError]}>
                                                <Text style={styles.fCurrencySymbol}>₹</Text>
                                                <TextInput
                                                    style={styles.fInput}
                                                    placeholder="e.g. 250000"
                                                    placeholderTextColor="#334155"
                                                    value={form.price}
                                                    onChangeText={(v) => update('price', v)}
                                                    keyboardType="numeric"
                                                    onFocus={() => setFocusField('px')}
                                                    onBlur={() => setFocusField(null)}
                                                />
                                            </View>
                                            {formErrors.price && <Text style={styles.fError}>{formErrors.price}</Text>}
                                        </View>

                                        {/* Accidents */}
                                        <View style={styles.fGroup}>
                                            <Text style={styles.fLabel}>Accident History <Text style={styles.fOptional}>(Optional)</Text></Text>
                                            <View style={[styles.fRow, styles.fRowMulti, focusField === 'ac' && styles.fRowFocus]}>
                                                <AlertTriangle color={focusField === 'ac' ? '#60a5fa' : '#475569'} size={18} style={{ marginTop: 2 }} />
                                                <TextInput
                                                    style={[styles.fInput, { height: 80, textAlignVertical: 'top' }]}
                                                    placeholder="e.g. No accidents / Minor scratch in 2021"
                                                    placeholderTextColor="#334155"
                                                    value={form.accidents_history}
                                                    onChangeText={(v) => update('accidents_history', v)}
                                                    multiline
                                                    onFocus={() => setFocusField('ac')}
                                                    onBlur={() => setFocusField(null)}
                                                />
                                            </View>
                                        </View>

                                        {/* Divider */}
                                        <View style={styles.divider}>
                                            <View style={styles.dividerLine} />
                                            <Text style={styles.dividerLabel}>📎 Media & Documents</Text>
                                            <View style={styles.dividerLine} />
                                        </View>

                                        {/* Vehicle Photo */}
                                        <View style={styles.fGroup}>
                                            <Text style={styles.fLabel}>Vehicle Photo <Text style={styles.fOptional}>(Optional)</Text></Text>
                                            {Platform.OS === 'web' && (
                                                <TouchableOpacity style={styles.uploadBtn} onPress={pickPhotoFile}>
                                                    <Upload color="#60a5fa" size={18} />
                                                    <Text style={styles.uploadBtnText}>
                                                        {photoFile ? `📷 ${photoFile.name}` : 'Browse Image File'}
                                                    </Text>
                                                    {photoFile && <Text style={styles.uploadSize}>{formatSize(photoFile.size)}</Text>}
                                                </TouchableOpacity>
                                            )}
                                            <View style={styles.orRow}>
                                                <View style={styles.orLine} />
                                                <Text style={styles.orText}>OR URL</Text>
                                                <View style={styles.orLine} />
                                            </View>
                                            <View style={[styles.fRow, focusField === 'pu' && styles.fRowFocus, { opacity: photoFile ? 0.5 : 1 }]}>
                                                <ImageIcon color="#475569" size={18} />
                                                <TextInput
                                                    style={styles.fInput}
                                                    placeholder="https://example.com/photo.jpg"
                                                    placeholderTextColor="#334155"
                                                    value={form.photo_url}
                                                    onChangeText={(v) => { update('photo_url', v); if (v) setPhotoFile(null); }}
                                                    keyboardType="url"
                                                    autoCapitalize="none"
                                                    editable={!photoFile}
                                                    onFocus={() => setFocusField('pu')}
                                                    onBlur={() => setFocusField(null)}
                                                />
                                            </View>
                                            {(photoFile?.preview || form.photo_url.length > 5) && (
                                                <View style={styles.previewBox}>
                                                    <Image
                                                        source={{ uri: photoFile?.preview || form.photo_url }}
                                                        style={styles.previewImg}
                                                        resizeMode="cover"
                                                    />
                                                    <View style={styles.previewFooter}>
                                                        <Text style={styles.previewLabel}>📷 {photoFile ? photoFile.name : 'URL Preview'}</Text>
                                                        {photoFile && (
                                                            <TouchableOpacity onPress={() => setPhotoFile(null)}>
                                                                <XCircle color="#ef4444" size={16} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            )}
                                        </View>

                                        {/* Documents */}
                                        <View style={styles.fGroup}>
                                            <Text style={styles.fLabel}>Ownership Documents <Text style={styles.fOptional}>(Optional)</Text></Text>
                                            {Platform.OS === 'web' && (
                                                <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnDoc]} onPress={pickDocFile}>
                                                    <Upload color="#f59e0b" size={18} />
                                                    <Text style={[styles.uploadBtnText, { color: '#f59e0b' }]}>
                                                        {docFile ? `📄 ${docFile.name}` : 'Browse PDF / DOC File'}
                                                    </Text>
                                                    {docFile && <Text style={[styles.uploadSize, { color: '#78350f' }]}>{formatSize(docFile.size)}</Text>}
                                                </TouchableOpacity>
                                            )}
                                            <Text style={styles.fHint}>Accepted: PDF, DOC, DOCX, TXT</Text>
                                            <View style={styles.orRow}>
                                                <View style={styles.orLine} />
                                                <Text style={styles.orText}>OR LINK</Text>
                                                <View style={styles.orLine} />
                                            </View>
                                            <View style={[styles.fRow, focusField === 'du' && styles.fRowFocus, { opacity: docFile ? 0.5 : 1 }]}>
                                                <FileText color="#475569" size={18} />
                                                <TextInput
                                                    style={styles.fInput}
                                                    placeholder="https://drive.google.com/..."
                                                    placeholderTextColor="#334155"
                                                    value={form.documents_url}
                                                    onChangeText={(v) => { update('documents_url', v); if (v) setDocFile(null); }}
                                                    keyboardType="url"
                                                    autoCapitalize="none"
                                                    editable={!docFile}
                                                    onFocus={() => setFocusField('du')}
                                                    onBlur={() => setFocusField(null)}
                                                />
                                            </View>
                                            {docFile && (
                                                <View style={styles.docPreview}>
                                                    <FileText color="#f59e0b" size={20} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.docPreviewName}>{docFile.name}</Text>
                                                        <Text style={styles.docPreviewSize}>{formatSize(docFile.size)}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => setDocFile(null)}>
                                                        <XCircle color="#ef4444" size={18} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {!docFile && form.documents_url.length > 5 && (
                                                <TouchableOpacity
                                                    style={styles.docPreview}
                                                    onPress={() => Linking.openURL(form.documents_url).catch(() => { })}
                                                >
                                                    <FileText color="#f59e0b" size={20} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.docPreviewName}>🔗 Document Linked</Text>
                                                        <Text style={styles.docPreviewSize} numberOfLines={1}>{form.documents_url}</Text>
                                                    </View>
                                                    <ExternalLink color="#f59e0b" size={16} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {/* Submit */}
                                        <TouchableOpacity
                                            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                            onPress={handleAddVehicle}
                                            disabled={submitting}
                                            activeOpacity={0.85}
                                        >
                                            <LinearGradient
                                                colors={['#10b981', '#059669']}
                                                style={styles.submitGrad}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                {submitting
                                                    ? <ActivityIndicator color="#fff" size="small" />
                                                    : <>
                                                        <PlusCircle color="#fff" size={20} />
                                                        <Text style={styles.submitText}>Add to Blockchain</Text>
                                                    </>
                                                }
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.switchTabBtn} onPress={() => setActiveTab('history')}>
                                            <Text style={styles.switchTabText}>View Vehicle History</Text>
                                            <ChevronRight color="#60a5fa" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* ── HISTORY TAB ── */}
                            {activeTab === 'history' && (
                                <View style={styles.historyCard}>
                                    <View style={styles.historyHeader}>
                                        <View style={styles.historyHeaderLeft}>
                                            <History color="#60a5fa" size={20} />
                                            <Text style={styles.historyTitle}>Your Vehicles</Text>
                                        </View>
                                        <TouchableOpacity style={styles.refreshBtn} onPress={fetchHistory}>
                                            <RefreshCcw color="#94a3b8" size={15} />
                                            <Text style={styles.refreshText}>Refresh</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {loading ? (
                                        <View style={styles.centerMsg}>
                                            <ActivityIndicator color="#60a5fa" size="large" />
                                            <Text style={styles.centerMsgText}>Loading vehicles...</Text>
                                        </View>
                                    ) : vehicles.length === 0 ? (
                                        <View style={styles.centerMsg}>
                                            <Car color="#1e293b" size={56} />
                                            <Text style={styles.centerMsgText}>No vehicles added yet</Text>
                                            <TouchableOpacity style={styles.addFirstBtn} onPress={() => setActiveTab('add')}>
                                                <PlusCircle color="#10b981" size={16} />
                                                <Text style={styles.addFirstText}>Add Your First Vehicle</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.historyGrid}>
                                            {vehicles.map((v, idx) => {
                                                const s = getStatusColor(v.status);
                                                return (
                                                    <View key={v.id} style={[styles.vehicleCard, idx > 0 && styles.vehicleCardBorder]}>
                                                        <View style={styles.vcRow}>
                                                            <View style={styles.vcNumBadge}>
                                                                <Text style={styles.vcNumText}>{String(idx + 1).padStart(2, '0')}</Text>
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={styles.vcNumber}>{v.vehicle_number}</Text>
                                                                <Text style={styles.vcPrice}>₹{Number(v.price).toLocaleString('en-IN')}</Text>
                                                            </View>
                                                            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                                                                <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
                                                            </View>
                                                        </View>

                                                        {v.accidents_history ? (
                                                            <Text style={styles.vcAccident}>⚠️ {v.accidents_history}</Text>
                                                        ) : null}

                                                        {v.block_hash ? (
                                                            <View style={styles.vcHashRow}>
                                                                <Text style={styles.vcHashLabel}>Block Hash:</Text>
                                                                <Text style={styles.vcHash} numberOfLines={1}>{v.block_hash}</Text>
                                                            </View>
                                                        ) : null}

                                                        {v.status === 'pending' && (
                                                            <TouchableOpacity style={styles.txnBtn} onPress={() => openTxnModal(v.block_hash)}>
                                                                <Text style={styles.txnBtnText}>+ Provide Transaction ID</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}

                                    {vehicles.length > 0 && (
                                        <View style={styles.historyFooter}>
                                            <Text style={styles.historyFooterText}>{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} total</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </ScrollView>

            {/* Transaction ID Modal */}
            {txnModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Provide Transaction ID</Text>
                        <Text style={styles.modalSub}>Enter the Transaction ID received in your bank account for this purchase.</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. TXN123456789"
                            placeholderTextColor="#64748b"
                            value={sellerTxnIdInput}
                            onChangeText={setSellerTxnIdInput}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setTxnModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={submitSellerTxnId}>
                                <Text style={styles.modalConfirmText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#060714', flexDirection: 'column', width: '100%', overflow: 'hidden' },

    // Toast
    toast: {
        position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40,
        alignSelf: 'center', width: '90%', maxWidth: 480,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 14, zIndex: 9999, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 10, elevation: 10,
    },
    toastGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    toastRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    toastText: { fontSize: 14, fontWeight: '600', flex: 1 },

    // Header
    header: {
        flexDirection: 'column', width: '100%',
        backgroundColor: 'rgba(6,7,20,0.97)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
        paddingTop: Platform.OS === 'android' ? 44 : Platform.OS === 'ios' ? 50 : 14,
    },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, width: '100%',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 10 },
    headerIcon: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(96,165,250,0.1)',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    headerSub: { color: '#475569', fontSize: 12, marginTop: 1 },
    logoutBtn: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12,
        paddingTop: 4, gap: 10, width: '100%',
    },
    tabBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    tabActiveGreen: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderColor: 'rgba(16,185,129,0.35)',
    },
    tabActiveBlue: {
        backgroundColor: 'rgba(96,165,250,0.1)',
        borderColor: 'rgba(96,165,250,0.35)',
    },
    tabLabel: { color: '#64748b', fontWeight: '600', fontSize: 13 },

    // Scroll
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },

    // Form Card
    addTabContainer: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 1100,
        gap: 30,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    // Info Panel
    infoPanel: {
        flex: 1,
        flexDirection: 'column',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
    },
    infoBadge: {
        alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16,
    },
    infoBadgeText: { color: '#e2e8f0', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    infoTitle: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 40, marginBottom: 12 },
    infoSub: { color: '#94a3b8', fontSize: 13, lineHeight: 20, marginBottom: 30 },
    infoSteps: { gap: 20, flexDirection: 'column' },
    infoStep: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    infoStepIcon: { fontSize: 24 },
    infoStepTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    infoStepDesc: { color: '#64748b', fontSize: 13 },

    formCard: {
        flex: 1,
        flexDirection: 'column',
        padding: 20,
        backgroundColor: 'rgba(10, 15, 30, 0.7)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.15)',
    },
    formHeader: { marginBottom: 20 },
    formHeaderBadge: {
        alignSelf: 'flex-start', backgroundColor: 'rgba(96,165,250,0.1)',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.25)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12,
    },
    formHeaderBadgeText: { color: '#60a5fa', fontSize: 12, fontWeight: '700' },
    formTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
    formSubtitle: { color: '#475569', fontSize: 13, lineHeight: 20 },

    // Form Fields
    fGroup: { marginBottom: 18 },
    fLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 8 },
    fOptional: { color: '#334155', fontWeight: '400' },
    fRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, paddingHorizontal: 14, height: 52,
    },
    fRowMulti: { height: 'auto', paddingVertical: 12, alignItems: 'flex-start' },
    fRowFocus: { borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.06)' },
    fRowError: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' },
    fInput: { flex: 1, color: '#fff', fontSize: 15 },
    fCurrencySymbol: { color: '#60a5fa', fontSize: 16, fontWeight: '700' },
    fError: { color: '#f87171', fontSize: 12, marginTop: 5 },
    fHint: { color: '#334155', fontSize: 11, marginTop: 5 },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
    dividerLabel: { color: '#475569', fontSize: 12, fontWeight: '600' },

    // Upload Button
    uploadBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(96,165,250,0.06)',
        borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.2)',
        borderStyle: 'dashed', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
    },
    uploadBtnDoc: {
        backgroundColor: 'rgba(245,158,11,0.05)',
        borderColor: 'rgba(245,158,11,0.2)',
    },
    uploadBtnText: { color: '#60a5fa', fontWeight: '600', fontSize: 13, flex: 1 },
    uploadSize: { color: '#475569', fontSize: 11 },

    // OR
    orRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 },
    orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    orText: { color: '#334155', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

    // Photo Preview
    previewBox: {
        marginTop: 10, borderRadius: 14, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    },
    previewImg: { width: '100%', height: 180 },
    previewFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    previewLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },

    // Doc Preview
    docPreview: {
        flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10,
        backgroundColor: 'rgba(245,158,11,0.06)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
        borderRadius: 14, padding: 14,
    },
    docPreviewName: { color: '#f59e0b', fontWeight: '600', fontSize: 13 },
    docPreviewSize: { color: '#78350f', fontSize: 11, marginTop: 2 },

    // Submit
    submitBtn: {
        height: 56, borderRadius: 16, overflow: 'hidden',
        marginTop: 8, marginBottom: 14,
        shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    submitGrad: {
        flex: 1, flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 10,
    },
    submitText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },

    switchTabBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        gap: 6, paddingVertical: 10,
    },
    switchTabText: { color: '#60a5fa', fontSize: 14, fontWeight: '600' },

    // History
    historyCard: {
        borderRadius: 20,
        width: '100%',
    },
    historyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        padding: 10,
    },
    historyHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 18,
        backgroundColor: 'rgba(10,15,40,0.9)',
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    historyHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    historyTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    refreshBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    },
    refreshText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },

    centerMsg: {
        alignItems: 'center', paddingVertical: 60, gap: 14, paddingHorizontal: 20,
    },
    centerMsgText: { color: '#475569', fontSize: 16, fontWeight: '500' },
    addFirstBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6,
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    },
    addFirstText: { color: '#10b981', fontWeight: '700', fontSize: 14 },

    // Vehicle Card
    vehicleCard: {
        width: 350,
        padding: 20,
        backgroundColor: 'rgba(10,15,40,0.9)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    vehicleCardBorder: {},
    vcRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    vcNumBadge: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(96,165,250,0.08)',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    vcNumText: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },
    vcNumber: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
    vcPrice: { color: '#10b981', fontSize: 14, fontWeight: '600', marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, alignSelf: 'flex-start',
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    vcAccident: { color: '#94a3b8', fontSize: 12, marginTop: 10 },
    vcHashRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    vcHashLabel: { color: '#334155', fontSize: 11, fontWeight: '600' },
    vcHash: { color: '#334155', fontSize: 11, flex: 1 },
    txnBtn: {
        marginTop: 12, alignSelf: 'flex-start',
        backgroundColor: 'rgba(96,165,250,0.08)',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.25)',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    txnBtnText: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },

    historyFooter: {
        paddingHorizontal: 20, paddingVertical: 14,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.01)',
    },
    historyFooterText: { color: '#334155', fontSize: 13, fontWeight: '600', textAlign: 'center' },

    // Modal
    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center', alignItems: 'center',
        padding: 24, zIndex: 10000,
    },
    modalCard: {
        backgroundColor: '#0f172a', width: '100%', maxWidth: 400,
        borderRadius: 24, padding: 28,
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5, shadowRadius: 30, elevation: 20,
    },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
    modalSub: { color: '#94a3b8', fontSize: 14, lineHeight: 20, marginBottom: 20 },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14, color: '#fff', padding: 14,
        marginBottom: 20, fontSize: 15,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
    modalCancelText: { color: '#64748b', fontWeight: '700', fontSize: 15 },
    modalConfirmBtn: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
    },
    modalConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default SellerDashboard;
