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
import { useApp } from '../../context/AppContext';
import { COLORS, FONT, SPACING, RADIUS, CATEGORY_META, STATUS_META } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_USER = {
  name: 'Alex Rivera',
  avatar: 'https://i.pravatar.cc/150?img=3',
  neighborhood: 'Fishtown',
  joined: 'March 2026',
  postsCount: 4,
  upvotesGiven: 23,
  impact: 'Got 2 issues acknowledged',
};

export default function ProfileScreen() {
  const { posts, setUserRole } = useApp();
  const myPosts = posts.filter(p => p.author_name === 'You' || p.author_name === 'Alex Rivera').slice(0, 3);

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
          <Text style={styles.name}>{MOCK_USER.name}</Text>
          <Text style={styles.neighborhood}>📍 {MOCK_USER.neighborhood}</Text>
          <Text style={styles.joined}>Member since {MOCK_USER.joined}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{MOCK_USER.postsCount}</Text>
            <Text style={styles.statLabel}>Issues Posted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{MOCK_USER.upvotesGiven}</Text>
            <Text style={styles.statLabel}>Upvotes Given</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Impact pill */}
        <View style={styles.impactPill}>
          <Text style={styles.impactEmoji}>⚡</Text>
          <Text style={styles.impactText}>{MOCK_USER.impact}</Text>
        </View>

        {/* My Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Posts</Text>
          {myPosts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>You haven't posted yet.</Text>
              <Text style={styles.emptySub}>Tap + to share an issue with your community.</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  name: { fontFamily: FONT.bold, fontSize: 22, color: COLORS.white },
  neighborhood: { fontFamily: FONT.medium, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  joined: { fontFamily: FONT.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 3 },
  statNum: { fontFamily: FONT.bold, fontSize: 24, color: COLORS.greenDark },
  statLabel: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },
  statDivider: { width: 1, backgroundColor: COLORS.beige200 },

  impactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.greenPale,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.greenLight,
  },
  impactEmoji: { fontSize: 18 },
  impactText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.greenDark },

  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.textDark,
  },

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
  },
  logoutText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.textMuted },
});
