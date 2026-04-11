import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, STATUS_META, FONT, SPACING, RADIUS } from '../../constants/theme';
import { Post } from '../../constants/types';

type FilterMode = 'all' | 'open' | 'in_progress' | 'acknowledged';

function PriorityCard({
  post,
  onStatusChange,
}: {
  post: Post;
  onStatusChange: (status: Post['status']) => void;
}) {
  const cat = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];
  const isHigh = post.upvotes >= 150;

  return (
    <TouchableOpacity
      style={[styles.card, isHigh && styles.cardHigh]}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.92}
    >
      {isHigh && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>🔥 HIGH PRIORITY</Text>
        </View>
      )}

      <View style={styles.cardTop}>
        <Image source={{ uri: post.image_url }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.catText, { color: cat.color }]}>{cat.icon} {cat.label}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
          <Text style={styles.cardNeigh}>📍 {post.neighborhood_name}</Text>
        </View>
      </View>

      {/* Upvote bar */}
      <View style={styles.upvoteBar}>
        <View style={styles.upvoteBarFill}>
          <View
            style={[
              styles.upvoteFill,
              { width: `${Math.min((post.upvotes / 300) * 100, 100)}%` as any },
            ]}
          />
        </View>
        <Text style={styles.upvoteBarText}>▲ {post.upvotes} residents</Text>
      </View>

      {/* Status actions */}
      <View style={styles.actionRow}>
        <View style={[styles.currentStatus, { backgroundColor: status.bg }]}>
          <Text style={[styles.currentStatusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.actionBtns}>
          {post.status === 'open' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onStatusChange('acknowledged')}
            >
              <Text style={styles.actionBtnText}>Acknowledge</Text>
            </TouchableOpacity>
          )}
          {post.status === 'acknowledged' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnBlue]}
              onPress={() => onStatusChange('in_progress')}
            >
              <Text style={[styles.actionBtnText, { color: '#5B8DD9' }]}>Mark In Progress</Text>
            </TouchableOpacity>
          )}
          {post.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen]}
              onPress={() => onStatusChange('resolved')}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.greenMid }]}>Mark Resolved ✓</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrgDashboard() {
  const { posts, updatePostStatus } = useApp();
  const [filter, setFilter] = useState<FilterMode>('all');

  const filtered = posts
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => b.upvotes - a.upvotes);

  const open = posts.filter(p => p.status === 'open').length;
  const acknowledged = posts.filter(p => p.status === 'acknowledged').length;
  const inProgress = posts.filter(p => p.status === 'in_progress').length;
  const resolved = posts.filter(p => p.status === 'resolved').length;
  const highPriority = posts.filter(p => p.upvotes >= 150 && p.status !== 'resolved').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Org Header */}
      <LinearGradient
        colors={[COLORS.greenDark, '#3A6520']}
        style={styles.orgHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.orgHeaderTop}>
          <View>
            <Text style={styles.orgName}>NKCDC</Text>
            <Text style={styles.orgSub}>Kensington · Northern Liberties · Fishtown</Text>
          </View>
          <View style={styles.orgLogo}>
            <Text style={styles.orgLogoEmoji}>🏢</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{open}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#FFD166' }]}>{highPriority}</Text>
            <Text style={styles.statLabel}>🔥 High Priority</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.greenLight }]}>{resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {([
          ['all', 'All Issues'],
          ['open', `Open (${open})`],
          ['acknowledged', `Noted (${acknowledged})`],
          ['in_progress', `Active (${inProgress})`],
        ] as [FilterMode, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterTab, filter === key && styles.filterTabActive]}
            onPress={() => setFilter(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterLabel, filter === key && styles.filterLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PriorityCard
            post={item}
            onStatusChange={status => updatePostStatus(item.id, status)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>All clear in this category!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },

  orgHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  orgHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgName: { fontFamily: FONT.bold, fontSize: 24, color: COLORS.white, letterSpacing: -0.5 },
  orgSub: { fontFamily: FONT.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  orgLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgLogoEmoji: { fontSize: 26 },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNum: { fontFamily: FONT.bold, fontSize: 22, color: COLORS.white },
  statLabel: { fontFamily: FONT.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.beige200,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.beige100,
  },
  filterTabActive: { backgroundColor: COLORS.greenDark },
  filterLabel: { fontFamily: FONT.medium, fontSize: 12, color: COLORS.textMuted },
  filterLabelActive: { color: COLORS.white },

  list: { padding: SPACING.md, gap: 14, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHigh: {
    borderWidth: 1.5,
    borderColor: '#E05C5C',
  },
  hotBadge: {
    backgroundColor: '#FDF0F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5C4C4',
  },
  hotText: { fontFamily: FONT.semiBold, fontSize: 11, color: '#E05C5C', letterSpacing: 0.5 },

  cardTop: { flexDirection: 'row', padding: SPACING.md, gap: 12 },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.beige200,
  },
  cardInfo: { flex: 1, gap: 5 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  catBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: { fontFamily: FONT.semiBold, fontSize: 11 },
  cardTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.textDark, lineHeight: 19 },
  cardNeigh: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },

  upvoteBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    gap: 6,
  },
  upvoteBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.beige200,
    overflow: 'hidden',
  },
  upvoteFill: {
    height: '100%',
    backgroundColor: COLORS.greenMid,
    borderRadius: 2,
  },
  upvoteBarText: { fontFamily: FONT.medium, fontSize: 12, color: COLORS.greenDark },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 8,
  },
  currentStatus: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentStatusText: { fontFamily: FONT.semiBold, fontSize: 12 },
  actionBtns: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.beige100,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  actionBtnBlue: { borderColor: '#5B8DD9', backgroundColor: '#EFF4FC' },
  actionBtnGreen: { borderColor: COLORS.greenMid, backgroundColor: COLORS.greenPale },
  actionBtnText: { fontFamily: FONT.semiBold, fontSize: 12, color: COLORS.textMid },

  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.textMuted },
});
