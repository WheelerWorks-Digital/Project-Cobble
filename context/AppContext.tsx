import React, { createContext, useContext, useState } from 'react';
import { Post } from '../constants/types';
import { MOCK_POSTS } from '../constants/mockData';

type UserRole = 'resident' | 'org' | null;

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  posts: Post[];
  updatePostStatus: (postId: string, status: Post['status']) => void;
  toggleUpvote: (postId: string) => void;
  addPost: (post: Post) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const updatePostStatus = (postId: string, status: Post['status']) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, status } : p))
    );
  };

  const toggleUpvote = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const hasUpvoted = p.has_upvoted ?? false;
        return {
          ...p,
          upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          has_upvoted: !hasUpvoted,
        };
      })
    );
  };

  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{ userRole, setUserRole, posts, updatePostStatus, toggleUpvote, addPost }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
