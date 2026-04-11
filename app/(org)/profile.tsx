import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { COLORS, FONT, SPACING, RADIUS, CATEGORY_META } from '../../constants/theme';

export default function OrgProfileScreen() {
  const { posts, setUserRole } = useApp();

  const resolved = posts.filter(p => p.status === 'resolved').length;
  const acknowledged = posts.filter(p => p.status === 'acknowledged').length;
  const totalUpvotes = posts.reduce((acc, p) => acc + p.upvotes, 0);

  const categoryCounts = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    meta,
    count: posts.filter(p => p.category === key).length,
  })).sort((a, b) => b.count - a.count);

  const handleLogout = () => {
    setUserRole(null);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.greenDark, '#3A6520']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.orgLogo}>
            <Text style={styles.orgLogoEmoji}>🏢</Text>
          </View>
          <Text style={styles.orgName}>NKCDC</Text>
          <Text style={styles.orgFull}>New Kensington Community Development Corp.</Text>
          <Text style={styles.orgArea}>Serving Kensington · Northern Liberties · Fishtown</Text>

          <View style={styles.missionBox}>
            <Text style={styles.missionText}>
              "Transforming communities through affordable housing, economic development, and community organizing."
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{posts.length}</Text>
            <Text style={styles.statLabel}>Total Issues</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.greenMid }]}>{resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalUpvotes}</Text>
            <Text style={styles.statLabel}>Resident Voices</Text>
          </View>
        </View>

        {/* Category breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issues by Category</Text>
          {categoryCounts.map(({ key, meta, count }) => (
            <View key={key} style={styles.categoryRow}>
              <Text style={styles.catEmoji}>{meta.icon}</Text>
              <Text style={styles.catName}>{meta.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(count / posts.length) * 100}%` as any,
                      backgroundColor: meta.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.catCount}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>🌱 Your Impact</Text>
          <Text style={styles.impactText}>
            You've acknowledged {acknowledged} resident issues and resolved {resolved} through community action.{' '}
            {totalUpvotes} upvotes across the area show real community demand.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>← Switch Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },

  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: 6,
  },
  orgLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  orgLogoEmoji: { fontSize: 36 },
  orgName: { fontFamily: FONT.bold, fontSize: 28, color: COLORS.white, letterSpacing: -0.5 },
  orgFull: { fontFamily: FONT.medium, fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  orgArea: { fontFamily: FONT.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  missionBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  missionText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },

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
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statNum: { fontFamily: FONT.bold, fontSize: 24, color: COLORS.textDark },
  statLabel: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },
  statDivider: { width: 1, backgroundColor: COLORS.beige200 },

  section: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.textDark },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catEmoji: { fontSize: 18, width: 24 },
  catName: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMid, width: 100 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.beige200,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  catCount: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.textDark, width: 20, textAlign: 'right' },

  impactCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.greenPale,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.greenLight,
  },
  impactTitle: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.greenDark },
  impactText: { fontFamily: FONT.regular, fontSize: 13, color: COLORS.greenDark, lineHeight: 20 },

  logoutBtn: {
    margin: SPACING.md,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.beige300,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xl,
  },
  logoutText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.textMuted },
});
