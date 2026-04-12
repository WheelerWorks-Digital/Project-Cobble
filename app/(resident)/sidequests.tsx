import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING, RADIUS } from '../../constants/theme';
import { useApp, getRankInfo } from '../../context/AppContext';

type QuestCategory = 'all' | 'cleanup' | 'volunteer' | 'report' | 'connect';
type QuestDifficulty = 'easy' | 'medium' | 'hard';

interface SideQuest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xp: number;
  emoji: string;
  neighborhood: string;
  completedBy: number;
  isCompleted?: boolean;
}

const DIFFICULTY_META: Record<QuestDifficulty, { label: string; color: string; bg: string }> = {
  easy: { label: 'Easy', color: '#4A7C2F', bg: '#EDF5E9' },
  medium: { label: 'Medium', color: '#D97B2F', bg: '#FDF3EB' },
  hard: { label: 'Hard', color: '#E05C5C', bg: '#FDF0F0' },
};

const CAT_META: Record<QuestCategory, { label: string; icon: string; color: string }> = {
  all: { label: 'All Quests', icon: '⚡', color: COLORS.greenMid },
  cleanup: { label: 'Cleanup', icon: '🧹', color: '#2F9FA8' },
  volunteer: { label: 'Volunteer', icon: '🤝', color: '#4A7C2F' },
  report: { label: 'Report', icon: '📢', color: '#E05C5C' },
  connect: { label: 'Connect', icon: '💬', color: '#D97B2F' },
};

const QUESTS: SideQuest[] = [
  {
    id: 'q1',
    title: 'Snap & Report a Pothole',
    description: 'Find a pothole in your neighborhood, take a photo, and post it as an issue on Cobble. Help prioritize road repairs.',
    category: 'report',
    difficulty: 'easy',
    xp: 50,
    emoji: '🕳️',
    neighborhood: 'Any',
    completedBy: 38,
  },
  {
    id: 'q2',
    title: 'Join a Block Cleanup',
    description: 'Attend any community cleanup event near you. Grab some gloves and spend an hour making your street shine.',
    category: 'cleanup',
    difficulty: 'easy',
    xp: 75,
    emoji: '🧹',
    neighborhood: 'Any',
    completedBy: 62,
  },
  {
    id: 'q3',
    title: 'Introduce Yourself to a Neighbor',
    description: "Say hello to a neighbor you haven't met. Exchange names or numbers. Strong communities start with a conversation.",
    category: 'connect',
    difficulty: 'easy',
    xp: 40,
    emoji: '👋',
    neighborhood: 'Any',
    completedBy: 101,
  },
  {
    id: 'q4',
    title: 'Volunteer at UCity Community Garden',
    description: 'Show up for a Saturday morning session at the 43rd St garden. Plant, weed, and connect with neighbors over fresh soil.',
    category: 'volunteer',
    difficulty: 'medium',
    xp: 100,
    emoji: '🌱',
    neighborhood: 'University City',
    completedBy: 21,
  },
  {
    id: 'q5',
    title: 'Document 3 Infrastructure Issues',
    description: 'Walk around your block and photograph 3 infrastructure problems — broken sidewalks, missing signs, clogged drains. Post them all.',
    category: 'report',
    difficulty: 'medium',
    xp: 120,
    emoji: '🔧',
    neighborhood: 'Any',
    completedBy: 14,
  },
  {
    id: 'q6',
    title: 'Tutor a Student at Blackwell Library',
    description: 'Spend a session helping a student at Lucien Blackwell Library. No formal commitment — just show up and help.',
    category: 'volunteer',
    difficulty: 'medium',
    xp: 110,
    emoji: '📚',
    neighborhood: 'University City',
    completedBy: 9,
  },
  {
    id: 'q7',
    title: 'Organize Your Own Micro-Cleanup',
    description: 'Recruit at least 2 neighbors and organize a 30-minute cleanup on your street. Post before/after photos on Cobble.',
    category: 'cleanup',
    difficulty: 'hard',
    xp: 200,
    emoji: '🌟',
    neighborhood: 'Any',
    completedBy: 5,
  },
  {
    id: 'q8',
    title: 'Attend a Community Meeting',
    description: 'Attend a neighborhood association, city council, or community planning meeting and report back on Cobble.',
    category: 'connect',
    difficulty: 'hard',
    xp: 175,
    emoji: '🏛️',
    neighborhood: 'Any',
    completedBy: 18,
  },
  {
    id: 'q9',
    title: 'Share Cobble with 3 Neighbors',
    description: "Tell 3 of your neighbors about Cobble and why it matters. The more voices, the more change we can create together.",
    category: 'connect',
    difficulty: 'easy',
    xp: 60,
    emoji: '📣',
    neighborhood: 'Any',
    completedBy: 47,
  },
];

const CATEGORIES: QuestCategory[] = ['all', 'cleanup', 'volunteer', 'report', 'connect'];

function XPBar({ total }: { total: number }) {
  const rankInfo = getRankInfo(total);
  const pct = Math.min(total / rankInfo.nextXp, 1);
  return (
    <View style={xpStyles.container}>
      <View style={xpStyles.track}>
        <LinearGradient
          colors={[COLORS.greenMid, COLORS.greenLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[xpStyles.fill, { width: `${pct * 100}%` }]}
        />
      </View>
      <View style={xpStyles.labelRow}>
        <Text style={xpStyles.label}>{rankInfo.rank}</Text>
        <Text style={xpStyles.label}>{total} / {rankInfo.nextXp} XP</Text>
      </View>
    </View>
  );
}

const xpStyles = StyleSheet.create({
  container: { gap: 4 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: FONT.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
});

export default function SidequestsScreen() {
  const appCtx = useApp();
  const userStats = appCtx.userStats;
  const addXP = appCtx.addXP;
  const [activeCategory, setActiveCategory] = useState<QuestCategory>('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const filteredQuests = QUESTS.filter(
    q => activeCategory === 'all' || q.category === activeCategory
  );

  const toggleComplete = (quest: SideQuest) => {
    if (completedIds.has(quest.id)) return;
    
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.add(quest.id);
      return next;
    });
    
    addXP(quest.xp, 'quest');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0F1A14', '#162212', '#1E3A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGrad}
      >
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitle}>⚡ Side Quests</Text>
            <Text style={styles.headerSub}>
              {completedIds.size} of {QUESTS.length} completed
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>{userStats.xp} XP</Text>
          </View>
        </View>
        <XPBar total={userStats.xp} />
      </LinearGradient>


      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map(cat => {
          const meta = CAT_META[cat];
          const active = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, active && { backgroundColor: meta.color }]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={styles.catChipEmoji}>{meta.icon}</Text>
              <Text style={[styles.catChipLabel, active && { color: COLORS.white }]}>
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quest list */}
      <FlatList
        data={filteredQuests}
        keyExtractor={q => q.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: quest }) => {
          const completed = completedIds.has(quest.id);
          const diff = DIFFICULTY_META[quest.difficulty];
          return (
            <View style={[styles.questCard, completed && styles.questCardDone]}>
              <View style={styles.questHeader}>
                <Text style={styles.questEmoji}>{quest.emoji}</Text>
                <View style={styles.questMeta}>
                  <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                    <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
                  </View>
                  <Text style={styles.questNeighborhood}>📍 {quest.neighborhood}</Text>
                </View>
                <View style={styles.xpPill}>
                  <Text style={styles.xpPillText}>+{quest.xp} XP</Text>
                </View>
              </View>

              <Text style={[styles.questTitle, completed && styles.questTitleDone]}>
                {quest.title}
              </Text>
              <Text style={styles.questDesc}>{quest.description}</Text>

              <View style={styles.questFooter}>
                <Text style={styles.questCompletedBy}>
                  ✓ {quest.completedBy + (completed ? 1 : 0)} neighbors completed this
                </Text>
                <TouchableOpacity
                  style={[styles.questBtn, completed && styles.questBtnDone]}
                  onPress={() => toggleComplete(quest)}
                  activeOpacity={0.85}
                  disabled={completed}
                >
                  <Text style={[styles.questBtnText, completed && styles.questBtnTextDone]}>
                    {completed ? '✓ Completed' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>No quests here yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A14' },

  headerGrad: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A2A',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#48C9B0',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSub: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    letterSpacing: 1,
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.white,
  },

  catScroll: { maxHeight: 48, marginTop: 12 },
  catContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  catChipEmoji: { fontSize: 13 },
  catChipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.textMid,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
    gap: 14,
  },

  questCard: {
    backgroundColor: '#162212',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1E3A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  questCardDone: {
    opacity: 0.8,
    borderWidth: 1.5,
    borderColor: '#48C9B0',
    backgroundColor: '#0D2218',
  },

  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  questEmoji: { fontSize: 28 },
  questMeta: { flex: 1, gap: 4 },
  diffBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  diffText: { fontFamily: FONT.semiBold, fontSize: 11 },
  questNeighborhood: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  xpPill: {
    backgroundColor: COLORS.greenDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  xpPillText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: COLORS.white,
  },

  questTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: '#E8F5E9',
    lineHeight: 22,
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#48C9B0',
  },
  questDesc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },

  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E3A2A',
    paddingTop: 10,
  },
  questCompletedBy: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    flex: 1,
  },
  questBtn: {
    backgroundColor: COLORS.greenMid,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  questBtnDone: {
    backgroundColor: 'transparent',
  },
  questBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.white,
  },
  questBtnTextDone: {
    color: COLORS.greenDark,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontFamily: FONT.semiBold, fontSize: 16, color: 'rgba(255,255,255,0.4)' },
});
