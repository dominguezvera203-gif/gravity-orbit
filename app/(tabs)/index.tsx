// index.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  angle: number;
  type: 'speed' | 'invincible' | 'bonus';
}

export default function App() {
  const [screen, setScreen] = useState<'start' | 'game' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [orbitDirection, setOrbitDirection] = useState<1 | -1>(1);
  const [sunAngle, setSunAngle] = useState(Math.random() * 360);
  const [gravityPulseActive, setGravityPulseActive] = useState(false);
  const [sunSpeed, setSunSpeed] = useState(30);
  const [stars, setStars] = useState<Star[]>([]);
  const [powerUpActive, setPowerUpActive] = useState<'speed' | 'invincible' | 'bonus' | null>(null);
  const [powerUpCounters, setPowerUpCounters] = useState({ speed: 0, invincible: 0, bonus: 0 });

  const orbitRadius = 100;
  const planetAngleRef = useRef(0);
  const powerUpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const starIdRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setOrbitDirection(1);
    planetAngleRef.current = 0;
    setSunAngle(Math.random() * 360);
    setGravityPulseActive(false);
    setSunSpeed(30);
    setStars([]);
    setPowerUpActive(null);
    setPowerUpCounters({ speed: 0, invincible: 0, bonus: 0 });
    setScreen('game');
  };

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: width / 2 + radius * Math.cos(rad), y: height / 2 + radius * Math.sin(rad) };
  };

  const handleTap = () => setOrbitDirection(prev => (prev === 1 ? -1 : 1));

  const activatePowerUp = (type: 'speed' | 'invincible' | 'bonus') => {
    setPowerUpActive(type);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    powerUpTimerRef.current = setTimeout(() => setPowerUpActive(null), 5000);
    setPowerUpCounters(prev => ({ ...prev, [type]: 0 }));
  };

  // Respawn a star every 1 second
  useEffect(() => {
    if (screen !== 'game') return;

    const starRespawn = setInterval(() => {
      const types: Star['type'][] = ['speed', 'invincible', 'bonus'];
      const newStar: Star = {
        id: starIdRef.current++,
        angle: Math.random() * 360,
        type: types[Math.floor(Math.random() * types.length)],
      };
      setStars(prev => [...prev, newStar]); // Add new star
    }, 1000);

    return () => clearInterval(starRespawn);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game') return;

    let lastTime = Date.now();

    const pulseInterval = setInterval(() => {
      setGravityPulseActive(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => setGravityPulseActive(false), 800);
    }, 3000);

    const sunRespawnInterval = setInterval(() => {
      setSunAngle(Math.random() * 360);
    }, 5000);

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      let speedMultiplier = 1 + score / 5000;
      if (powerUpActive === 'speed') speedMultiplier *= 1.5;

      planetAngleRef.current = (planetAngleRef.current + orbitDirection * delta * 90 * speedMultiplier) % 360;
      setSunAngle(prev => (prev + delta * sunSpeed) % 360);
      setScore(prev => prev + 1);
      if (score > 0 && score % 500 === 0) setSunSpeed(prev => prev + 2);

      const planetPos = polarToCartesian(planetAngleRef.current, orbitRadius);
      const sunPos = polarToCartesian(sunAngle, orbitRadius);
      const distance = Math.sqrt((planetPos.x - sunPos.x) ** 2 + (planetPos.y - sunPos.y) ** 2);

      // Fixed collision: invincible prevents Game Over
      if (
        (distance < 25 && powerUpActive !== 'invincible') ||
        (gravityPulseActive && distance < 50 && powerUpActive !== 'invincible')
      ) {
        setScreen('gameOver');
      }

      // Star collection
      setStars(prev =>
        prev.filter(star => {
          const starPos = polarToCartesian(star.angle, orbitRadius);
          const dist = Math.sqrt((planetPos.x - starPos.x) ** 2 + (planetPos.y - starPos.y) ** 2);
          if (dist < 20) {
            Haptics.selectionAsync();
            setPowerUpCounters(counters => {
              const newCount = { ...counters, [star.type]: counters[star.type] + 1 };
              if (newCount[star.type] >= 3) activatePowerUp(star.type);
              return newCount;
            });
            return false; // remove collected star
          }
          return true;
        }),
      );
    }, 16);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
      clearInterval(sunRespawnInterval);
      if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    };
  }, [screen, orbitDirection, sunAngle, gravityPulseActive, score, sunSpeed, powerUpActive]);

  const planetPos = polarToCartesian(planetAngleRef.current, orbitRadius);
  const sunPos = polarToCartesian(sunAngle, orbitRadius);

  return (
    <View style={styles.container}>
      {screen === 'start' && (
        <View style={styles.screen}>
          <Text style={styles.title}>Gravity Orbit</Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        </View>
      )}

      {screen === 'game' && (
        <Pressable style={styles.gameScreen} onPress={handleTap}>
          <Text style={styles.score}>Score: {score}</Text>
          {powerUpActive && <Text style={styles.powerUpText}>Power-Up: {powerUpActive}</Text>}
          <Text style={styles.counterText}>
            Speed Stars: {powerUpCounters.speed}/3 | Invincible Stars: {powerUpCounters.invincible}/3 | Bonus Stars: {powerUpCounters.bonus}/3
          </Text>

          {/* Sun */}
          <Ionicons
            name="sunny"
            size={40}
            color={gravityPulseActive ? '#ff4500' : '#ffcc00'}
            style={{
              position: 'absolute',
              left: sunPos.x - 20,
              top: sunPos.y - 20,
              textShadowColor: gravityPulseActive ? '#f00' : '#ff0',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 5,
            }}
          />

          {/* Planet */}
          <Ionicons
            name="planet"
            size={30}
            color={powerUpActive === 'invincible' ? '#0ff' : '#0f0'} // Glow effect for invincible
            style={{
              position: 'absolute',
              left: planetPos.x - 15,
              top: planetPos.y - 15,
              textShadowColor: powerUpActive === 'invincible' ? '#0ff' : '#0f0',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 8, // stronger glow when invincible
            }}
          />

          {/* Stars */}
          {stars.map(star => {
            const starPos = polarToCartesian(star.angle, orbitRadius);
            return (
              <Ionicons
                key={star.id}
                name="star"
                size={20}
                color={star.type === 'speed' ? '#0ff' : star.type === 'invincible' ? '#f0f' : '#ff0'}
                style={{
                  position: 'absolute',
                  left: starPos.x - 10,
                  top: starPos.y - 10,
                  textShadowColor: '#fff',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              />
            );
          })}
        </Pressable>
      )}

      {screen === 'gameOver' && (
        <View style={styles.screen}>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Restart</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameScreen: { flex: 1, backgroundColor: '#050505' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  score: { fontSize: 20, color: '#fff', position: 'absolute', top: 50, left: 20 },
  powerUpText: { position: 'absolute', top: 80, left: 20, fontSize: 16, color: '#0ff', fontWeight: 'bold' },
  counterText: { position: 'absolute', top: 110, left: 20, fontSize: 14, color: '#fff' },
  button: { paddingVertical: 15, paddingHorizontal: 40, backgroundColor: '#0a84ff', borderRadius: 10 },
  buttonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
});