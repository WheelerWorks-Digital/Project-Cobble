import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, STATUS_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { NEIGHBORHOODS } from '../../constants/mockData';
import { Post } from '../../constants/types';

type SortMode = 'trending' | 'new' | 'status';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80';

// Quest link mappings: which quest categories correspond to feed actions
const QUEST_CATEGORY_MAP: Record<string, string> = {
  report: 'Snap & Report a Pothole',
  infrastructure: 'Document 3 Infrastructure Issues',
  community: 'Introduce Yourself to a Neighbor',
};

function QuestBanner({ category }: { category: string }) {
  const questName = QUEST_CATEGORY_MAP[category];
  if (!questName) return null;
  return (
    <TouchableOpacity 
      style={questBannerStyles.container}
      onPress={() => router.push('/(resident)/sidequests')}
      activeOpacity={0.8}
    >
      <Text style={questBannerStyles.icon}>⚡</Text>
      <Text style={questBannerStyles.text} numberOfLines={1}>Quest: {questName}</Text>
      <Text style={questBannerStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const questBannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2218',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#48C9B0',
    gap: 6,
  },
  icon: { fontSize: 12 },
  text: { flex: 1, fontFamily: FONT.medium, fontSize: 11, color: '#48C9B0' },
  arrow: { fontFamily: FONT.bold, fontSize: 14, color: '#48C9B0' },
});

function PostCard({ post, onUpvote }: { post: Post; onUpvote: () => void }) {
  const cat = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];
  const timeAgo = getTimeAgo(post.created_at);
  const displayName = post.is_anonymous ? 'Anonymous' : post.author_name;
  const [imgError, setImgError] = useState(false);
  const isTrending = post.upvotes >= 50;
  const isHigh = post.upvotes >= 150;

  return (
    <TouchableOpacity
      style={[styles.card, isTrending && styles.cardTrending, isHigh && styles.cardHigh]}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.9}
    >
      {/* Trending glow bar */}
      {isTrending && (
        <View style={styles.trendingBar}>
          <Text style={styles.trendingText}>{isHigh ? '🔥 HIGH PRIORITY' : '📈 TRENDING'}</Text>
          <Text style={styles.trendingXp}>+10 XP</Text>
        </View>
      )}

      {post.image_url ? (
        <Image
          source={{ uri: imgError ? FALLBACK_IMAGE : post.image_url }}
          style={styles.cardImage}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.cardBody}>
        {/* Quest link banner */}
        <QuestBanner category={post.category} />

        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: cat.color + '22', borderColor: cat.color + '66' }]}>
            <Text style={[styles.catBadgeText, { color: cat.color }]}>
              {cat.icon} {cat.label}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            {post.is_anonymous ? (
              <View style={styles.anonAvatar}>
                <Text style={styles.anonAvatarEmoji}>👤</Text>
              </View>
            ) : (
              <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
            )}
            <View>
              <Text style={styles.authorName}>{displayName}</Text>
              <Text style={styles.cardTime}>📍 {post.neighborhood_name} · {timeAgo}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.upvoteBtn, post.has_upvoted && styles.upvoteBtnActive]}
            onPress={onUpvote}
            activeOpacity={0.8}
          >
            <Text style={[styles.upvoteArrow, post.has_upvoted && { color: '#48C9B0' }]}>▲</Text>
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

const ALL_NEIGHBORHOODS = [{ id: 'all', name: 'All Areas' }, ...NEIGHBORHOODS];
const ALL_CATEGORIES: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '⚡' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'infrastructure', label: 'Infra', icon: '🔧' },
  { id: 'beautification', label: 'Beauty', icon: '🌿' },
  { id: 'community', label: 'Community', icon: '🤝' },
  { id: 'environment', label: 'Enviro', icon: '♻️' },
  { id: 'convenience', label: 'Convenience', icon: '🪑' },
];

export default function FeedScreen() {
  const { posts, toggleUpvote, userStats } = useApp();
  const [sort, setSort] = useState<SortMode>('trending');
  const [neighborhood, setNeighborhood] = useState('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let result = posts
      .filter(p => p.status !== 'pending')
      .filter(p => neighborhood === 'all' || p.neighborhood_id === neighborhood)
      .filter(p => category === 'all' || p.category === category);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.neighborhood_name.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      if (sort === 'trending') return b.upvotes - a.upvotes;
      if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      const order = { pending: 0, open: 1, acknowledged: 2, in_progress: 3, resolved: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    });
  }, [posts, sort, neighborhood, category, search]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0F1A14', '#162212']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>COMMUNITY</Text>
            <Text style={styles.headerTitle}>MISSION BOARD</Text>
          </View>
          <View style={styles.xpChip}>
            <Text style={styles.xpChipText}>⚡ {userStats.xp} XP</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search missions…"
            placeholderTextColor="#3D5A48"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </LinearGradient>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        {([
          { key: 'trending', label: '🔥 HOT', },
          { key: 'new', label: '✨ NEW' },
          { key: 'status', label: '📊 STATUS' },
        ] as { key: SortMode; label: string }[]).map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortTab, sort === s.key && styles.sortTabActive]}
            onPress={() => setSort(s.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortLabel, sort === s.key && styles.sortLabelActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Neighborhood filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
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

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {ALL_CATEGORIES.map(c => {
          const active = category === c.id;
          const color = c.id !== 'all' ? CATEGORY_META[c.id as Category].color : '#48C9B0';
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, active && { backgroundColor: color + '33', borderColor: color }]}
              onPress={() => setCategory(c.id as Category | 'all')}
              activeOpacity={0.8}
            >
              <Text style={styles.catChipEmoji}>{c.icon}</Text>
              <Text style={[styles.catChipText, active && { color }]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Post count label */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} MISSIONS ACTIVE</Text>
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
            tintColor="#48C9B0"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>NO MISSIONS</Text>
            <Text style={styles.emptySub}>Adjust your filters or post a new issue.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A14' },

  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A2A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontFamily: FONT.pixel,
    fontSize: 8,
    color: '#48C9B0',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: FONT.pixel,
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 1,
  },
  xpChip: {
    backgroundColor: '#162212',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  xpChipText: { fontFamily: FONT.pixel, fontSize: 8, color: '#48C9B0' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162212',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E3A2A',
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.white,
  },

  sortRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: '#162212',
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  sortTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortTabActive: {
    backgroundColor: '#1E3A2A',
  },
  sortLabel: {
    fontFamily: FONT.pixel,
    fontSize: 7,
    color: '#3D5A48',
    letterSpacing: 0.5,
  },
  sortLabelActive: { color: '#48C9B0' },

  chipScroll: { maxHeight: 38, marginBottom: 4 },
  chipContent: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    alignItems: 'center',
  },

  nhChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: '#162212',
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  nhChipActive: {
    backgroundColor: '#1E3A2A',
    borderColor: '#48C9B0',
  },
  nhChipText: { fontFamily: FONT.medium, fontSize: 11, color: '#3D5A48' },
  nhChipTextActive: { color: '#48C9B0' },

  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: '#162212',
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  catChipEmoji: { fontSize: 11 },
  catChipText: { fontFamily: FONT.medium, fontSize: 11, color: '#3D5A48' },

  countRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: 6,
  },
  countText: {
    fontFamily: FONT.pixel,
    fontSize: 7,
    color: '#2E4A38',
    letterSpacing: 2,
  },

  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100, gap: 12, paddingTop: 4 },

  card: {
    backgroundColor: '#162212',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  cardTrending: {
    borderColor: '#4A7C2F',
  },
  cardHigh: {
    borderColor: '#E05C5C',
    shadowColor: '#E05C5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  trendingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D2218',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A2A',
  },
  trendingText: { fontFamily: FONT.pixel, fontSize: 7, color: '#48C9B0', letterSpacing: 1 },
  trendingXp: { fontFamily: FONT.pixel, fontSize: 7, color: '#FFD166' },

  cardImage: { width: '100%', height: 160, backgroundColor: '#0D2218' },
  cardBody: { padding: SPACING.md },

  cardMeta: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  catBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  catBadgeText: { fontFamily: FONT.semiBold, fontSize: 11 },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: FONT.medium, fontSize: 11 },

  cardTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#E8F5E9',
    lineHeight: 22,
    marginBottom: 5,
  },
  cardDesc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 19,
    marginBottom: 12,
  },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E3A2A' },
  anonAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1E3A2A', justifyContent: 'center', alignItems: 'center',
  },
  anonAvatarEmoji: { fontSize: 15 },
  authorName: { fontFamily: FONT.semiBold, fontSize: 12, color: '#9DC4A8' },
  cardTime: { fontFamily: FONT.regular, fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 },

  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E3A2A',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#2E5A3A',
  },
  upvoteBtnActive: {
    backgroundColor: '#0D2218',
    borderColor: '#48C9B0',
  },
  upvoteArrow: { fontSize: 11, color: '#3D8A54' },
  upvoteCount: { fontFamily: FONT.bold, fontSize: 14, color: '#7DB892' },
  upvoteCountActive: { color: '#48C9B0' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontFamily: FONT.pixel, fontSize: 12, color: '#2E4A38' },
  emptySub: { fontFamily: FONT.regular, fontSize: 13, color: '#2E4A38', textAlign: 'center' },
});
