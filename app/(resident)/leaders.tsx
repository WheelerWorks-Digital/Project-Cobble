import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING, RADIUS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ResidentLeaderboard() {
  const { userStats } = useApp();

  const leaders = [
    { id: '1', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3', rank: 'Block Captain', xp: 520, neighborhood: 'Fishtown', verified: true, isMe: true },
    { id: '2', name: 'Marcus R.', avatar: 'https://i.pravatar.cc/150?img=52', rank: 'Active Neighbor', xp: 215, neighborhood: 'Kensington', verified: true },
    { id: '3', name: 'Priya N.', avatar: 'https://i.pravatar.cc/150?img=44', rank: 'Active Neighbor', xp: 180, neighborhood: 'University City', verified: false },
    { id: '4', name: 'Maria S.', avatar: 'https://i.pravatar.cc/150?img=47', rank: 'Newcomer', xp: 95, neighborhood: 'Fishtown', verified: false },
  ];

  const dynamicLeaders = leaders.map(l => l.isMe ? { ...l, xp: userStats.xp } : l).sort((a, b) => b.xp - a.xp);

  const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0F1A14', '#162212', '#1A2E1A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerLabel}>LEADERBOARD</Text>
        <Text style={styles.headerTitle}>🏆 Neighborhood Legends</Text>
        <Text style={styles.headerSub}>Top civic contributors across Philadelphia</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {dynamicLeaders.map((leader, i) => (
          <View key={leader.id} style={[styles.card, leader.isMe && styles.cardMe, i === 0 && styles.cardFirst]}>
            {/* Rank Number */}
            <View style={[styles.rankBadge, i === 0 && { backgroundColor: '#FFD70022', borderColor: '#FFD700' }, i === 1 && { borderColor: '#C0C0C0' }, i === 2 && { borderColor: '#CD7F32' }]}>
              <Text style={[styles.rankNum, i === 0 && { color: '#FFD700' }, i === 1 && { color: '#C0C0C0' }, i === 2 && { color: '#CD7F32' }]}>
                {i < 3 ? MEDAL_LABELS[i] : `#${i + 1}`}
              </Text>
            </View>

            <Image source={{ uri: leader.avatar }} style={[styles.avatar, i === 0 && styles.avatarFirst]} />

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, i === 0 && styles.nameFirst]}>{leader.isMe ? 'YOU' : leader.name}</Text>
                {leader.verified && (
                  <View style={styles.verifyBadge}>
                    <Text style={styles.verifyIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.neighborhood}>📍 {leader.neighborhood}</Text>

              {/* Mini XP bar */}
              <View style={styles.miniBarTrack}>
                <View style={[styles.miniBarFill, { width: `${Math.min(leader.xp / 600, 1) * 100}%` as any, backgroundColor: i === 0 ? '#FFD700' : '#48C9B0' }]} />
              </View>
              <Text style={[styles.rankText, i === 0 && { color: '#FFD700' }]}>{leader.rank}  ·  {leader.xp} XP</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Rankings update when neighbors take action 🌱</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A14' },

  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A2A',
  },
  headerLabel: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#48C9B0',
    letterSpacing: 4,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },

  scroll: { padding: SPACING.md, gap: 10, paddingBottom: 100 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162212',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  cardMe: {
    borderColor: '#48C9B0',
    backgroundColor: '#0D2218',
  },
  cardFirst: {
    borderColor: '#FFD700',
    backgroundColor: '#1A1800',
  },

  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#1E3A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: { fontSize: 18, fontFamily: FONT.bold, color: 'rgba(255,255,255,0.4)' },

  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#1E3A2A' },
  avatarFirst: { borderColor: '#FFD700', width: 54, height: 54, borderRadius: 27 },

  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.white },
  nameFirst: { color: '#FFD700', fontSize: 16 },
  verifyBadge: {
    backgroundColor: '#3498DB',
    width: 14, height: 14, borderRadius: 7,
    justifyContent: 'center', alignItems: 'center',
  },
  verifyIcon: { color: COLORS.white, fontSize: 8, fontFamily: FONT.bold },
  neighborhood: { fontFamily: FONT.regular, fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  miniBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E3A2A',
    overflow: 'hidden',
    marginTop: 4,
  },
  miniBarFill: { height: '100%', borderRadius: 2 },
  rankText: { fontFamily: FONT.medium, fontSize: 11, color: '#48C9B0', marginTop: 3 },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontFamily: FONT.regular, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' },
});
