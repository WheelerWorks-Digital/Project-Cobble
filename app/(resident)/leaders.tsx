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
import { useApp } from '../../context/AppContext';

export default function ResidentLeaderboard() {
  const { userStats } = useApp() as any;

  const leaders = [
    { id: '1', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3', rank: 'Block Captain', xp: 520, neighborhood: 'Fishtown', verified: true, isMe: true },
    { id: '2', name: 'Marcus R.', avatar: 'https://i.pravatar.cc/150?img=52', rank: 'Active Neighbor', xp: 215, neighborhood: 'Kensington', verified: true },
    { id: '3', name: 'Priya N.', avatar: 'https://i.pravatar.cc/150?img=44', rank: 'Active Neighbor', xp: 180, neighborhood: 'University City', verified: false },
    { id: '4', name: 'Maria S.', avatar: 'https://i.pravatar.cc/150?img=47', rank: 'Newcomer', xp: 95, neighborhood: 'Fishtown', verified: false },
  ];

  // Inject current dynamic XP for the mock "Alex Rivera" (the logged in user)
  const dynamicLeaders = leaders.map(l => l.isMe ? { ...l, xp: userStats.xp } : l).sort((a,b) => b.xp - a.xp);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.greenDark, COLORS.greenMid]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.headerTitle}>Neighborhood Legends</Text>
        <Text style={styles.headerSub}>Top contributors making a difference in Philadelphia.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {dynamicLeaders.map((leader, i) => (
          <TouchableOpacity 
            key={leader.id} 
            style={[styles.card, leader.isMe && styles.cardMe]} 
            activeOpacity={0.9}
          >
            <View style={[styles.rankBadge, i === 0 && styles.rankGold, i === 1 && styles.rankSilver, i === 2 && styles.rankBronze]}>
              <Text style={[styles.rankNum, i < 3 && styles.rankNumWin]}>#{i + 1}</Text>
            </View>
            <Image source={{ uri: leader.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{leader.isMe ? "You" : leader.name}</Text>
                {leader.verified && (
                  <View style={styles.verifyBadge}>
                    <Text style={styles.verifyIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.neighborhood}>📍 {leader.neighborhood}</Text>
              <Text style={styles.rankText}>{leader.rank} · {leader.xp} XP</Text>
            </View>
            {leader.isMe && (
              <View style={styles.meLabel}>
                <Text style={styles.meLabelText}>YOU</Text>
              </View>
            )}
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

  scroll: { padding: SPACING.md, gap: 12, paddingBottom: 100 },
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardMe: {
    borderColor: COLORS.greenMid,
    backgroundColor: '#F7FCF5',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.beige100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankGold: { backgroundColor: '#FFD700' },
  rankSilver: { backgroundColor: '#C0C0C0' },
  rankBronze: { backgroundColor: '#CD7F32' },
  rankNum: { fontFamily: FONT.bold, fontSize: 14, color: COLORS.textMuted },
  rankNumWin: { color: COLORS.white },
  
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
  rankText: { fontFamily: FONT.medium, fontSize: 11, color: COLORS.greenMid, marginTop: 4 },

  meLabel: {
    backgroundColor: COLORS.greenMid,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  meLabelText: { fontFamily: FONT.bold, fontSize: 10, color: COLORS.white },
});
