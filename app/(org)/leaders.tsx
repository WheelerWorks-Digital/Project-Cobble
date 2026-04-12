import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING, RADIUS } from '../../constants/theme';

export default function LeadersScreen() {
  const leaders = [
    { id: '1', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3', rank: 'Block Captain', xp: 520, neighborhood: 'Fishtown', verified: true },
    { id: '2', name: 'Marcus R.', avatar: 'https://i.pravatar.cc/150?img=52', rank: 'Active Neighbor', xp: 215, neighborhood: 'Kensington', verified: true },
    { id: '3', name: 'Priya N.', avatar: 'https://i.pravatar.cc/150?img=44', rank: 'Active Neighbor', xp: 180, neighborhood: 'University City', verified: false },
    { id: '4', name: 'Maria S.', avatar: 'https://i.pravatar.cc/150?img=47', rank: 'Newcomer', xp: 95, neighborhood: 'Fishtown', verified: false },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#8E44AD', '#5B2C6F']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.headerTitle}>Active Voices</Text>
        <Text style={styles.headerSub}>Recognize and collaborate with top contributors across your neighborhoods.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {leaders.map((leader, i) => (
          <TouchableOpacity key={leader.id} style={styles.card} activeOpacity={0.9}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
            </View>
            <Image source={{ uri: leader.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{leader.name}</Text>
                {leader.verified && (
                  <View style={styles.verifyBadge}>
                    <Text style={styles.verifyIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.neighborhood}>📍 {leader.neighborhood}</Text>
              <Text style={styles.rankText}>{leader.rank} · {leader.xp} XP</Text>
            </View>
            <View style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Connect</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontFamily: FONT.bold, fontSize: 24, color: COLORS.white, marginBottom: 6 },
  headerSub: { fontFamily: FONT.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 18 },

  scroll: { padding: SPACING.md, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4ECF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: { fontFamily: FONT.bold, fontSize: 14, color: '#8E44AD' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.beige200 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textDark },
  verifyBadge: {
    backgroundColor: '#3498DB',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyIcon: { color: COLORS.white, fontSize: 8, fontFamily: FONT.bold },
  neighborhood: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },
  rankText: { fontFamily: FONT.medium, fontSize: 11, color: '#8E44AD', marginTop: 4 },

  actionBtn: {
    backgroundColor: COLORS.beige100,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  actionBtnText: { fontFamily: FONT.medium, fontSize: 12, color: COLORS.textMid },
});
