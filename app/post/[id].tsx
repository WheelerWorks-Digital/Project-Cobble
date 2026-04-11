import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, STATUS_META, FONT, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MOCK_COMMENTS = [
  { id: 'c1', author: 'Sarah K.', avatar: 'https://i.pravatar.cc/150?img=48', text: "This has been an issue for months. So glad someone finally posted it!", time: '2h ago' },
  { id: 'c2', author: 'Mike T.', avatar: 'https://i.pravatar.cc/150?img=11', text: "I'd also add that the area needs better lighting at night. Double problem here.", time: '4h ago' },
  { id: 'c3', author: 'NKCDC', avatar: 'https://i.pravatar.cc/150?img=68', text: "We're aware of this issue and have flagged it internally. Thanks for raising it!", time: '1d ago', isOrg: true },
];

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, toggleUpvote, userRole } = useApp();
  const post = posts.find(p => p.id === id);
  const [pulse] = useState(new Animated.Value(1));

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Post not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];

  const handleUpvote = () => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    toggleUpvote(post.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: post.image_url }} style={styles.hero} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.catText, { color: cat.color }]}>{cat.icon} {cat.label}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Location & time */}
          <Text style={styles.location}>
            📍 {post.neighborhood_name} · {getTimeAgo(post.created_at)}
          </Text>

          {/* Author */}
          <View style={styles.authorRow}>
            <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>Posted by {post.author_name}</Text>
              <Text style={styles.authorSub}>Resident</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{post.description}</Text>

          {/* Upvote */}
          <View style={styles.upvoteSection}>
            <Text style={styles.upvoteLabel}>
              {post.upvotes} neighbors agree this matters
            </Text>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={[styles.upvoteBtn, post.has_upvoted && styles.upvoteBtnActive]}
                onPress={handleUpvote}
                activeOpacity={0.85}
              >
                <Text style={styles.upvoteArrow}>▲</Text>
                <Text style={[styles.upvoteBtnText, post.has_upvoted && styles.upvoteBtnTextActive]}>
                  {post.has_upvoted ? 'You upvoted' : 'Upvote this issue'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments */}
          <Text style={styles.sectionTitle}>Community Responses</Text>
          <View style={styles.comments}>
            {MOCK_COMMENTS.map(c => (
              <View key={c.id} style={[styles.comment, c.isOrg && styles.commentOrg]}>
                <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.author}</Text>
                    {c.isOrg && (
                      <View style={styles.orgBadge}>
                        <Text style={styles.orgBadgeText}>Org</Text>
                      </View>
                    )}
                    <Text style={styles.commentTime}>{c.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige100 },
  scroll: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.beige100 },

  heroContainer: { position: 'relative' },
  hero: { width, height: 280, backgroundColor: COLORS.beige200 },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtnText: { fontSize: 20, color: COLORS.textDark, lineHeight: 24 },

  content: { padding: SPACING.md },

  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  catBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  catText: { fontFamily: FONT.semiBold, fontSize: 13 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: FONT.semiBold, fontSize: 13 },

  title: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: COLORS.textDark,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  location: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.beige200,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.beige300 },
  authorName: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.textDark },
  authorSub: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },

  description: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.textMid,
    lineHeight: 24,
    marginBottom: 24,
  },

  upvoteSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  upvoteLabel: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.textMid,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.beige100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.beige300,
  },
  upvoteBtnActive: {
    backgroundColor: COLORS.greenPale,
    borderColor: COLORS.greenMid,
  },
  upvoteArrow: { fontSize: 16, color: COLORS.greenMid },
  upvoteBtnText: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textMid },
  upvoteBtnTextActive: { color: COLORS.greenDark },

  divider: { height: 1, backgroundColor: COLORS.beige300, marginVertical: SPACING.md },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 12,
  },

  comments: { gap: 12 },
  comment: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  commentOrg: {
    backgroundColor: COLORS.greenPale,
    borderWidth: 1,
    borderColor: COLORS.greenLight,
  },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.beige200 },
  commentBody: { flex: 1, gap: 4 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentAuthor: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.textDark },
  orgBadge: {
    backgroundColor: COLORS.greenMid,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  orgBadgeText: { fontFamily: FONT.semiBold, fontSize: 10, color: COLORS.white },
  commentTime: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.textMuted, flex: 1, textAlign: 'right' },
  commentText: { fontFamily: FONT.regular, fontSize: 13, color: COLORS.textMid, lineHeight: 19 },

  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  notFoundText: { fontFamily: FONT.semiBold, fontSize: 18, color: COLORS.textMuted },
  backLink: { fontFamily: FONT.medium, fontSize: 15, color: COLORS.greenMid },
});
