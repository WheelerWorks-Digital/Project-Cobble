import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, STATUS_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { NEIGHBORHOODS } from '../../constants/mockData';
import { Post } from '../../constants/types';

type SortMode = 'trending' | 'new' | 'status';

function PostCard({ post, onUpvote }: { post: Post; onUpvote: () => void }) {
  const cat = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];
  const timeAgo = getTimeAgo(post.created_at);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.92}
    >
      {post.image_url ? (
        <Image source={{ uri: post.image_url }} style={styles.cardImage} />
      ) : null}

      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={[styles.catBadgeText, { color: cat.color }]}>
              {cat.icon} {cat.label}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>{post.author_name}</Text>
              <Text style={styles.cardTime}>
                📍 {post.neighborhood_name} · {timeAgo}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.upvoteBtn, post.has_upvoted && styles.upvoteBtnActive]}
            onPress={onUpvote}
            activeOpacity={0.8}
          >
            <Text style={styles.upvoteArrow}>▲</Text>
            <Text style={[styles.upvoteCount, post.has_upvoted && styles.upvoteCountActive]}>
              {post.upvotes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const ALL_NEIGHBORHOODS = [{ id: 'all', name: 'All Neighborhoods' }, ...NEIGHBORHOODS];

export default function FeedScreen() {
  const { posts, toggleUpvote } = useApp();
  const [sort, setSort] = useState<SortMode>('trending');
  const [neighborhood, setNeighborhood] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = posts
    .filter(p => neighborhood === 'all' || p.neighborhood_id === neighborhood)
    .sort((a, b) => {
      if (sort === 'trending') return b.upvotes - a.upvotes;
      if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <Text style={styles.headerSub}>{filtered.length} active issues</Text>
      </View>

      {/* Neighborhood filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.nhScroll}
        contentContainerStyle={styles.nhContent}
      >
        {ALL_NEIGHBORHOODS.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[styles.nhChip, neighborhood === n.id && styles.nhChipActive]}
            onPress={() => setNeighborhood(n.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.nhChipText, neighborhood === n.id && styles.nhChipTextActive]}>
              {n.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        {(['trending', 'new', 'status'] as SortMode[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortTab, sort === s && styles.sortTabActive]}
            onPress={() => setSort(s)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortLabel, sort === s && styles.sortLabelActive]}>
              {s === 'trending' ? '🔥 Trending' : s === 'new' ? '✨ New' : '📊 Status'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PostCard post={item} onUpvote={() => toggleUpvote(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.greenMid}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>No issues here yet.</Text>
            <Text style={styles.emptySub}>Be the first to speak up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },

  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  nhScroll: { maxHeight: 44 },
  nhContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    alignItems: 'center',
  },
  nhChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  nhChipActive: {
    backgroundColor: COLORS.greenDark,
    borderColor: COLORS.greenDark,
  },
  nhChipText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textMid,
  },
  nhChipTextActive: { color: COLORS.white },

  sortRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.beige200,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  sortTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sortLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sortLabelActive: { color: COLORS.textDark },

  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100, gap: 14 },

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
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.beige200,
  },
  cardBody: { padding: SPACING.md },
  cardMeta: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  catBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeText: { fontFamily: FONT.semiBold, fontSize: 12 },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontFamily: FONT.semiBold, fontSize: 12 },

  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 5,
  },
  cardDesc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 12,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.beige200,
  },
  authorName: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textDark,
  },
  cardTime: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.beige100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  upvoteBtnActive: {
    backgroundColor: COLORS.greenPale,
    borderColor: COLORS.greenLight,
  },
  upvoteArrow: { fontSize: 12, color: COLORS.greenMid },
  upvoteCount: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.textMid,
  },
  upvoteCountActive: { color: COLORS.greenDark },

  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontFamily: FONT.semiBold, fontSize: 18, color: COLORS.textDark },
  emptySub: { fontFamily: FONT.regular, fontSize: 14, color: COLORS.textMuted },
});
