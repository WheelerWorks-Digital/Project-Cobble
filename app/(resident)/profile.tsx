import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp, getRankInfo } from '../../context/AppContext';
import { COLORS, FONT, SPACING, RADIUS, CATEGORY_META, STATUS_META } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_USER = {
  name: 'Alex Rivera',
  avatar: 'https://i.pravatar.cc/150?img=3',
  neighborhood: 'Fishtown',
  joined: 'March 2026',
};

export default function ProfileScreen() {
  const { posts, setUserRole, userStats } = useApp();
  const myPosts = posts.filter(p => p.author_name === 'You' || p.author_name === 'Alex Rivera').slice(0, 3);
  
  const rankInfo = getRankInfo(userStats.xp);
  const progressPercent = Math.min((userStats.xp / rankInfo.nextXp) * 100, 100);

  const handleLogout = () => {
    setUserRole(null);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient
          colors={[COLORS.greenDark, COLORS.greenMid]}
          style={styles.profileHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{MOCK_USER.name}</Text>
            {userStats.is_verified && (
              <View style={styles.verifyBadge}>
                <Text style={styles.verifyIcon}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.neighborhood}>📍 {MOCK_USER.neighborhood} · Joined {MOCK_USER.joined}</Text>
          
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>Lvl {rankInfo.level} · {rankInfo.rank}</Text>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Next Rank</Text>
              <Text style={styles.xpCount}>{userStats.xp} / {rankInfo.nextXp} XP</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${progressPercent}%` as any }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgesGrid}>
            {userStats.badges.map(b => (
              <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIconBg, !b.unlocked && styles.badgeIconBgLocked]}>
                  <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                </View>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc}>{b.description}</Text>
                {!b.unlocked && <Text style={styles.lockedText}>Locked</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* My Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Contributions</Text>
          {myPosts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>You haven't posted yet.</Text>
              <Text style={styles.emptySub}>Tap + to share an issue and earn XP!</Text>
            </View>
          ) : (
            myPosts.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.miniCard}
                onPress={() => router.push(`/post/${p.id}`)}
                activeOpacity={0.9}
              >
                {p.image_url && (
                  <Image source={{ uri: p.image_url }} style={styles.miniImage} />
                )}
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.miniMeta}>
                    {CATEGORY_META[p.category].icon} {CATEGORY_META[p.category].label} ·{' '}
                    <Text style={{ color: STATUS_META[p.status].color }}>
                      {STATUS_META[p.status].label}
                    </Text>
                  </Text>
                  <Text style={styles.miniUpvotes}>▲ {p.upvotes} upvotes</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>← Switch Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },

  profileHeader: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: 6,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.greenLight,
    marginBottom: 8,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: FONT.bold, fontSize: 24, color: COLORS.white },
  verifyBadge: {
    backgroundColor: '#3498DB',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.greenDark,
    marginTop: 2,
  },
  verifyIcon: { color: COLORS.white, fontSize: 10, fontFamily: FONT.bold },
  
  neighborhood: { fontFamily: FONT.medium, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  
  levelPill: {
    backgroundColor: '#FFD166',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  levelText: { fontFamily: FONT.bold, fontSize: 14, color: COLORS.textDark },

  xpContainer: {
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: 12,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpTitle: { fontFamily: FONT.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  xpCount: { fontFamily: FONT.bold, fontSize: 12, color: COLORS.white },
  xpBarTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#48C9B0', borderRadius: 4 },

  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.textDark,
  },

  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeLocked: { opacity: 0.5, backgroundColor: COLORS.beige200 },
  badgeIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconBgLocked: { backgroundColor: COLORS.beige300 },
  badgeEmoji: { fontSize: 24 },
  badgeName: { fontFamily: FONT.bold, fontSize: 13, color: COLORS.textDark, textAlign: 'center', marginBottom: 2 },
  badgeDesc: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  lockedText: { fontFamily: FONT.semiBold, fontSize: 10, color: '#C0392B', marginTop: 6 },

  miniCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miniImage: { width: 80, height: 80, backgroundColor: COLORS.beige200 },
  miniInfo: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },
  miniTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.textDark },
  miniMeta: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },
  miniUpvotes: { fontFamily: FONT.medium, fontSize: 12, color: COLORS.greenMid },

  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textMid },
  emptySub: { fontFamily: FONT.regular, fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  logoutBtn: {
    margin: SPACING.lg,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.beige300,
    backgroundColor: COLORS.white,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  logoutText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.textMuted },
});
