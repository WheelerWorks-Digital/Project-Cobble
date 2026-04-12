import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, UserStats, Badge } from '../constants/types';
import { MOCK_POSTS } from '../constants/mockData';

type UserRole = 'resident' | 'org' | null;

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  posts: Post[];
  updatePostStatus: (postId: string, status: Post['status']) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  toggleUpvote: (postId: string) => void;
  addPost: (post: Post) => void;
  userStats: UserStats;
  addXP: (amount: number, reason: string) => void;
}

const DEFAULT_BADGES: Badge[] = [
  { id: 'first_post', name: 'First Post', description: 'Shared an issue in your neighborhood', emoji: '🌱', unlocked: false },
  { id: 'supporter', name: 'Active Supporter', description: 'Supported 5 local issues', emoji: '👍', unlocked: false },
  { id: 'rally_starter', name: 'Rally Starter', description: 'Your post gathered 10+ upvotes', emoji: '🔥', unlocked: false },
  { id: 'voice', name: 'Voice of the Area', description: 'Reached Block Captain rank', emoji: '👑', unlocked: false },
];

export function getRankInfo(xp: number) {
  if (xp < 100) return { rank: 'Newcomer', nextXp: 100, level: 1 };
  if (xp < 300) return { rank: 'Active Neighbor', nextXp: 300, level: 2 };
  if (xp < 600) return { rank: 'Block Captain', nextXp: 600, level: 3 };
  return { rank: 'Neighborhood Legend', nextXp: xp, level: 4 };
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 65,
    level: 1,
    rank: 'Newcomer',
    badges: DEFAULT_BADGES,
    is_verified: true,
  });

  const addXP = (amount: number, reason: string) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      const rankInfo = getRankInfo(newXp);
      const newBadges = [...prev.badges];
      
      // Auto-unlock rank badge if reached Block Captain
      if (rankInfo.level >= 3) {
        const b = newBadges.find(b => b.id === 'voice');
        if (b && !b.unlocked) { b.unlocked = true; b.earned_at = new Date().toISOString(); }
      }

      return {
        ...prev,
        xp: newXp,
        level: rankInfo.level,
        rank: rankInfo.rank,
        badges: newBadges,
      };
    });
  };

  const updatePostStatus = (postId: string, status: Post['status']) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, status } : p))
    );
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, ...updates } : p))
    );
  };

  const toggleUpvote = (postId: string) => {
    setPosts(prev => {
      let upvoteCountDelta = 0;
      let newPosts = prev.map(p => {
        if (p.id !== postId) return p;
        const hasUpvoted = p.has_upvoted ?? false;
        upvoteCountDelta = hasUpvoted ? -1 : 1;
        return {
          ...p,
          upvotes: p.upvotes + upvoteCountDelta,
          has_upvoted: !hasUpvoted,
        };
      });
      return newPosts;
    });

    // Gamification hook
    addXP(10, 'upvote');
    const upvotedCount = posts.filter(p => p.has_upvoted).length + 1;
    if (upvotedCount >= 5) {
      setUserStats(prev => {
        const nb = [...prev.badges];
        const b = nb.find(x => x.id === 'supporter');
        if (b && !b.unlocked) { b.unlocked = true; b.earned_at = new Date().toISOString(); }
        return { ...prev, badges: nb };
      });
    }
  };

  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
    addXP(50, 'post');
    setUserStats(prev => {
      const nb = [...prev.badges];
      const b = nb.find(x => x.id === 'first_post');
      if (b && !b.unlocked) { b.unlocked = true; b.earned_at = new Date().toISOString(); }
      return { ...prev, badges: nb };
    });
  };

  return (
    <AppContext.Provider
      value={{ userRole, setUserRole, posts, updatePostStatus, updatePost, toggleUpvote, addPost, userStats, addXP }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
