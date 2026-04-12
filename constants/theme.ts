export const COLORS = {
  // Greens
  greenDark: '#2D5016',
  greenMid: '#4A7C2F',
  greenLight: '#8CB87C',
  greenPale: '#D4E8C8',

  // Beiges
  beige100: '#F5F0E8',
  beige200: '#EDE6D6',
  beige300: '#D4C9B0',
  beige400: '#BFB49A',

  // Text
  textDark: '#1A1A1A',
  textMid: '#3D3A30',
  textMuted: '#6B6558',
  textLight: '#9C9589',

  // Semantic
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(26, 26, 26, 0.6)',

  // Status
  statusOpen: '#E05C5C',
  statusAcknowledged: '#D97B2F',
  statusInProgress: '#5B8DD9',
  statusResolved: '#4A7C2F',

  // Game palette (dark RPG theme)
  gameBg: '#0F1A14',
  gameSurface: '#162212',
  gameBorder: '#1E3A2A',
  gameAccent: '#48C9B0',
  gameGold: '#FFD166',
  gameRed: '#EF4D6D',
  gamePurple: '#9B59B6',
};

export const CATEGORY_META = {
  safety: { label: 'Safety', icon: '🛡️', color: '#E05C5C', bg: '#FDF0F0' },
  infrastructure: { label: 'Infrastructure', icon: '🔧', color: '#5B8DD9', bg: '#EFF4FC' },
  beautification: { label: 'Beautification', icon: '🌿', color: '#4A7C2F', bg: '#EDF5E9' },
  community: { label: 'Community', icon: '🤝', color: '#D97B2F', bg: '#FDF3EB' },
  environment: { label: 'Environment', icon: '♻️', color: '#2F9FA8', bg: '#EBF7F8' },
  convenience: { label: 'Convenience', icon: '🪑', color: '#8E44AD', bg: '#F4ECF7' },
} as const;

export type Category = keyof typeof CATEGORY_META;

export const STATUS_META = {
  pending: { label: 'Pending Review', color: '#9B59B6', bg: '#F5EEF8' },
  open: { label: 'Open', color: '#E05C5C', bg: '#FDF0F0' },
  acknowledged: { label: 'Acknowledged', color: '#D97B2F', bg: '#FDF3EB' },
  in_progress: { label: 'In Progress', color: '#5B8DD9', bg: '#EFF4FC' },
  resolved: { label: 'Resolved', color: '#4A7C2F', bg: '#EDF5E9' },
} as const;

export type Status = keyof typeof STATUS_META;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT = {
  regular: 'VT323_400Regular',
  medium: 'VT323_400Regular',
  semiBold: 'PressStart2P_400Regular',
  bold: 'PressStart2P_400Regular',
  pixel: 'PressStart2P_400Regular',
};
