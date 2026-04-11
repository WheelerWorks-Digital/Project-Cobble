import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, FONT, SPACING, RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const { setUserRole } = useApp();

  const handleResident = () => {
    setUserRole('resident');
    router.replace('/(resident)');
  };

  const handleOrg = () => {
    setUserRole('org');
    router.replace('/(org)');
  };

  return (
    <LinearGradient
      colors={['#2D5016', '#4A7C2F', '#8CB87C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.content}>
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🪨</Text>
            </View>
            <Text style={styles.logoText}>Cobble</Text>
            <Text style={styles.tagline}>
              Surface local issues.{'\n'}Rally your neighbors.
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cards}>
            <TouchableOpacity
              style={styles.card}
              onPress={handleResident}
              activeOpacity={0.9}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>🏘️</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>I'm a Resident</Text>
                <Text style={styles.cardSub}>Post issues, upvote neighbors, track progress</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.cardOrg]}
              onPress={handleOrg}
              activeOpacity={0.9}
            >
              <View style={[styles.cardIcon, styles.cardIconOrg]}>
                <Text style={styles.cardEmoji}>🏢</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, styles.cardTitleOrg]}>I'm an Organization</Text>
                <Text style={[styles.cardSub, styles.cardSubOrg]}>Monitor your neighborhood, respond to residents</Text>
              </View>
              <Text style={[styles.cardArrow, styles.cardArrowOrg]}>›</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Greater Philadelphia Civic Engagement
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 100,
    left: -60,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoText: {
    fontFamily: FONT.bold,
    fontSize: 42,
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: FONT.regular,
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  cards: {
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardOrg: {
    backgroundColor: COLORS.greenDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.beige100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconOrg: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 17,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardTitleOrg: {
    color: COLORS.white,
  },
  cardSub: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  cardSubOrg: {
    color: 'rgba(255,255,255,0.7)',
  },
  cardArrow: {
    fontFamily: FONT.regular,
    fontSize: 28,
    color: COLORS.beige300,
    lineHeight: 30,
  },
  cardArrowOrg: {
    color: 'rgba(255,255,255,0.4)',
  },
  footer: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
