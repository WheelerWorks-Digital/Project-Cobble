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
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, STATUS_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { NEIGHBORHOODS } from '../../constants/mockData';
import { Post } from '../../constants/types';

type SortMode = 'trending' | 'new' | 'status';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80';

function PostCard({ post, onUpvote }: { post: Post; onUpvote: () => void }) {
  const cat = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];
  const timeAgo = getTimeAgo(post.created_at);
  const isPending = post.status === 'pending';
  const displayName = post.is_anonymous ? 'Anonymous' : post.author_name;
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.92}
    >
      {post.image_url ? (
        <Image
          source={{ uri: imgError ? FALLBACK_IMAGE : post.image_url }}
          style={styles.cardImage}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.cardBody}>
        {isPending && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>⏳ Pending verification — under review</Text>
          </View>
        )}

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
            {post.is_anonymous ? (
              <View style={styles.anonAvatar}>
                <Text style={styles.anonAvatarEmoji}>👤</Text>
              </View>
            ) : (
              <Image
                source={{ uri: post.author_avatar }}
                style={styles.avatar}
                onError={() => {}}
              />
            )}
            <View>
              <Text style={styles.authorName}>{displayName}</Text>
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

const ALL_NEIGHBORHOODS = [{ id: 'all', name: 'All Areas' }, ...NEIGHBORHOODS];
const ALL_CATEGORIES: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🗂️' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'infrastructure', label: 'Infra', icon: '🔧' },
  { id: 'beautification', label: 'Beauty', icon: '🌿' },
  { id: 'community', label: 'Community', icon: '🤝' },
  { id: 'environment', label: 'Enviro', icon: '♻️' },
];

export default function FeedScreen() {
  const { posts, toggleUpvote } = useApp();
  const [sort, setSort] = useState<SortMode>('trending');
  const [neighborhood, setNeighborhood] = useState('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let result = posts
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
      // status: pending first, then open, acknowledged, in_progress, resolved
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
      {/* Header + search */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Community Feed</Text>
            <Text style={styles.headerSub}>{filtered.length} posts</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search issues…"
            placeholderTextColor={COLORS.textLight}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

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
              {s === 'trending' ? '🔥 Hot' : s === 'new' ? '✨ New' : '📊 Status'}
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
          const color = c.id !== 'all' ? CATEGORY_META[c.id as Category].color : COLORS.greenMid;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => setCategory(c.id as Category | 'all')}
              activeOpacity={0.8}
            >
              <Text style={styles.catChipEmoji}>{c.icon}</Text>
              <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
            <Text style={styles.emptyText}>Nothing found.</Text>
            <Text style={styles.emptySub}>Try adjusting your filters.</Text>
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.beige300,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textDark,
  },

  sortRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.beige200,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sortLabelActive: { color: COLORS.textDark },

  chipScroll: { maxHeight: 40, marginBottom: 4 },
  chipContent: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    alignItems: 'center',
  },

  nhChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    fontSize: 12,
    color: COLORS.textMid,
  },
  nhChipTextActive: { color: COLORS.white },

  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  catChipEmoji: { fontSize: 12 },
  catChipText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.textMid,
  },
  catChipTextActive: { color: COLORS.white },

  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100, gap: 14, paddingTop: 6 },

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

  pendingBanner: {
    backgroundColor: '#F5EEF8',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9B59B6',
  },
  pendingBannerText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#9B59B6',
  },

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
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.beige200,
  },
  anonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.beige200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anonAvatarEmoji: { fontSize: 16 },
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
