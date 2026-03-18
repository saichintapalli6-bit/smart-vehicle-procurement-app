import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Dimensions, Platform, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const VEHICLES = ["🚗", "🚕", "🚙", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🚇", "🚌", "🚎"];

const Vehicle = ({ emoji, startX, startY, onComplete }) => {
    const animatedPos = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 400 + 200;
        const destinationX = startX + Math.cos(angle) * distance;
        const destinationY = startY + Math.sin(angle) * distance;

        Animated.parallel([
            Animated.timing(animatedPos, {
                toValue: { x: destinationX, y: destinationY },
                duration: 3000 + Math.random() * 2000,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 3000 + Math.random() * 2000,
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start(() => {
            onComplete();
        });
    }, []);

    return (
        <Animated.View
            style={[
                styles.vehicle,
                {
                    opacity,
                    transform: [
                        { translateX: animatedPos.x },
                        { translateY: animatedPos.y },
                        { scale: Math.random() * 0.5 + 0.8 }
                    ],
                },
            ]}
        >
            <Text style={styles.emojiText}>{emoji}</Text>
        </Animated.View>
    );
};

const AnimatedBackground = React.memo(({ colors, particleColor }) => {
    const [vehicles, setVehicles] = useState([]);
    const vehicleCount = useRef(0);

    const spawnVehicle = useCallback((x, y, count = 1) => {
        if (vehicles.length > 50) return; // Increased limit

        const newVehicles = [];
        for (let i = 0; i < count; i++) {
            const id = ++vehicleCount.current;
            const emoji = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
            newVehicles.push({ id, x, y, emoji });
        }

        setVehicles(prev => [...prev, ...newVehicles]);
    }, [vehicles.length]);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleMouseMove = (e) => {
                if (Math.random() > 0.15) return;
                spawnVehicle(e.clientX, e.clientY);
            };
            const handleClick = (e) => {
                spawnVehicle(e.clientX, e.clientY, 10); // Burst on click
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('click', handleClick);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('click', handleClick);
            };
        }
    }, [spawnVehicle]);

    const removeVehicle = (id) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
    };
    // const defaultColors = colors || [
    //     'rgba(250, 250, 250, 0.95)',
    //     'rgba(245, 245, 245, 0.90)',
    //     'rgba(235, 235, 235, 0.85)',
    //     'rgba(220, 220, 220, 0.80)'
    // ];

    const defaultColors = colors || [
        'rgba(20, 18, 25, 0.92)',
        'rgba(35, 28, 40, 0.88)',
        'rgba(48, 38, 52, 0.84)',
        'rgba(62, 50, 68, 0.80)'
    ];

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
            <LinearGradient
                colors={defaultColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {vehicles.map(v => (
                <Vehicle
                    key={v.id}
                    emoji={v.emoji}
                    startX={v.x}
                    startY={v.y}
                    onComplete={() => removeVehicle(v.id)}
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    vehicle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 24,
    }
});

export default AnimatedBackground;
