import React from 'react';
import {
    StyleSheet, 
    View, 
    SafeAreaView, 
    ActivityIndicator, 
    Platform, 
    StatusBar,
    Text,
    LinearGradient
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Car } from 'lucide-react-native';

const WebViewScreen = () => {
    const WEB_URL = 'https://digital-smart-vehicle-procurement.onrender.com';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0c0f15" />
            
            {/* Custom Header */}
            <LinearGradient
                colors={['rgba(22, 27, 34, 0.95)', 'rgba(33, 38, 45, 0.98)']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerIcon}>
                        <Car color="#f0b90b" size={28} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>VehicleChain Pro</Text>
                        <Text style={styles.headerSubtitle}>Web Dashboard</Text>
                    </View>
                </View>
            </LinearGradient>

            <WebView
                source={{ uri: WEB_URL }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <LinearGradient
                            colors={['rgba(240, 185, 11, 0.15)', 'rgba(234, 179, 8, 0.1)']}
                            style={styles.loadingCard}
                        >
                            <Car color="#f0b90b" size={48} style={styles.loadingIcon} />
                            <ActivityIndicator size="large" color="#f0b90b" style={styles.loadingSpinner} />
                            <Text style={styles.loadingText}>Loading Dashboard...</Text>
                            <Text style={styles.loadingSubtext}>Please wait while we connect securely</Text>
                        </LinearGradient>
                    </View>
                )}
                // Professional webview settings
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsBackForwardNavigationGestures={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                setSupportMultipleWindows={false}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                // Performance optimization
                cacheEnabled={true}
                cacheMode="LOAD_DEFAULT"
                // Smooth scrolling
                bounces={false}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c0f15', // Professional dark base
    },
    
    header: {
        height: Platform.OS === 'ios' ? 80 : 70,
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(240, 185, 11, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    
    headerIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(240, 185, 11, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    headerTextContainer: {
        flex: 1,
    },
    
    headerTitle: {
        color: '#f0f6fc',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    
    headerSubtitle: {
        color: '#c9d1d9',
        fontSize: 14,
        fontWeight: '600',
    },

    webview: {
        flex: 1,
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: '#0c0f15',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingCard: {
        minWidth: 280,
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: 'rgba(240, 185, 11, 0.25)',
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },

    loadingIcon: {
        shadowColor: '#f0b90b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },

    loadingSpinner: {
        marginVertical: 8,
    },

    loadingText: {
        color: '#f0f6fc',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    loadingSubtext: {
        color: '#c9d1d9',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 20,
    },
});

export default WebViewScreen;
