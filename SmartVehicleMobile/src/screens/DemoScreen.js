import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView, 
    Platform,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, Play, Monitor, ShieldCheck, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DemoScreen = ({ navigation }) => {
    // A professional automotive blockchain demonstration video from YouTube
    const VIDEO_ID = 'O8XfU8vD_Jc'; 
    const VIDEO_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&showinfo=0&controls=1`;

    return (
        <SafeAreaView style={styles.container}>
            {/* 👑 PREMIUM HEADER */}
            <LinearGradient
                colors={['#0c0f15', '#161b22']}
                style={styles.header}
            >
                <TouchableOpacity 
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft color="#f0b90b" size={28} />
                    <Text style={styles.backText}>Back to Home</Text>
                </TouchableOpacity>
                <View style={styles.badge}>
                    <Monitor color="#f0b90b" size={16} />
                    <Text style={styles.badgeText}>LIVE DEMO</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* 🎞️ VIDEO PLAYER CONTAINER */}
                <View style={styles.videoWrapper}>
                    <WebView
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        originWhitelist={['*']}
                        source={{ uri: VIDEO_URL }}
                        style={styles.video}
                        containerStyle={styles.webviewContainer}
                    />
                </View>

                {/* 📝 VIDEO DETAILS */}
                <View style={styles.detailsBox}>
                    <View style={styles.infoRow}>
                        <Zap color="#f0b90b" size={24} />
                        <Text style={styles.videoTitle}>VehicleChain Pro: Ecosystem Walkthrough</Text>
                    </View>
                    <Text style={styles.videoDesc}>
                        This live demonstration showcases how blockchain technology revolutionizes vehicle procurement, 
                        ensuring trustless transactions, immutable service history, and instant ownership transfers.
                    </Text>

                    <View style={styles.featureGrid}>
                        <View style={styles.featureItem}>
                            <ShieldCheck color="#22c55e" size={20} />
                            <Text style={styles.featureText}>Verified Data</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Zap color="#f59e0b" size={20} />
                            <Text style={styles.featureText}>Instant Settlement</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Monitor color="#60a5fa" size={20} />
                            <Text style={styles.featureText}>Transparent Ledger</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.getStartedBtn}
                    onPress={() => navigation.navigate('Register')}
                >
                    <LinearGradient
                        colors={['#f0b90b', '#ca8a04']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>Start Your Journey Today</Text>
                        <Play color="#1f2937" size={20} fill="#1f2937" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c0f15',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(240, 185, 11, 0.2)',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        color: '#f0b90b',
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(240, 185, 11, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.3)',
    },
    badgeText: {
        color: '#f0b90b',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    videoWrapper: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#000',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#f0b90b',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 32,
    },
    video: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    webviewContainer: {
        backgroundColor: 'transparent',
    },
    detailsBox: {
        backgroundColor: 'rgba(22, 27, 34, 0.8)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    videoTitle: {
        color: '#f0f6fc',
        fontSize: 22,
        fontWeight: '900',
        flex: 1,
    },
    videoDesc: {
        color: '#8b949e',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 24,
    },
    featureGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    featureText: {
        color: '#c9d1d9',
        fontSize: 13,
        fontWeight: '600',
    },
    getStartedBtn: {
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 'auto',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    btnText: {
        color: '#1f2937',
        fontSize: 18,
        fontWeight: '900',
    },
});

export default DemoScreen;
