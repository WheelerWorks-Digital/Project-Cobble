import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONT } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

// Pixel-art sprite positions within the tab_icons.png spritesheet
// The image is a 3x3 grid of icons (approx 346x346 each in a 1038x1038 image)
// Row 0: map, scroll/board, green plus
// Row 1: lightning, orb (unused), lightning2 (unused)
// Row 2: lightning3 (unused), trophy, helmet
const ICON_SIZE = 346;
const SHEET_SIZE = 1038;

type SpriteCoord = { row: number; col: number };

const SPRITES: Record<string, SpriteCoord> = {
  map:      { row: 0, col: 0 },
  feed:     { row: 0, col: 1 },
  create:   { row: 0, col: 2 },
  quest:    { row: 1, col: 0 },
  leaders:  { row: 2, col: 1 },
  profile:  { row: 2, col: 2 },
};

const ICON_DISPLAY = 28;

function SpriteIcon({ sprite, label, focused }: { sprite: keyof typeof SPRITES; label: string; focused: boolean }) {
  const { row, col } = SPRITES[sprite];
  const scale = ICON_DISPLAY / ICON_SIZE;
  return (
    <View style={iconStyles.container}>
      <View style={[iconStyles.spriteBox, focused && iconStyles.spriteBoxFocused]}>
        <View style={{ width: ICON_DISPLAY, height: ICON_DISPLAY, overflow: 'hidden' }}>
          <Image
            source={require('../../assets/icons/tab_icons.png')}
            style={{
              width: SHEET_SIZE * scale,
              height: SHEET_SIZE * scale,
              position: 'absolute',
              left: -(col * ICON_SIZE * scale),
              top: -(row * ICON_SIZE * scale),
            }}
          />
        </View>
      </View>
      <Text style={[iconStyles.label, focused && iconStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2 },
  spriteBox: {
    padding: 4,
    borderRadius: 8,
  },
  spriteBoxFocused: {
    backgroundColor: 'rgba(72, 201, 176, 0.2)',
    borderWidth: 1,
    borderColor: '#48C9B0',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 9,
    color: '#6B7C6E',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#48C9B0',
    fontFamily: FONT.bold,
  },
});

export default function ResidentLayout() {
  const { userRole } = useApp();

  useEffect(() => {
    if (userRole === null) {
      router.replace('/');
    }
  }, [userRole]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <SpriteIcon sprite="map" label="MAP" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <SpriteIcon sprite="feed" label="FEED" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.createBtn}>
              <Image
                source={require('../../assets/icons/tab_icons.png')}
                style={{
                  width: SHEET_SIZE * (36 / ICON_SIZE),
                  height: SHEET_SIZE * (36 / ICON_SIZE),
                  position: 'absolute',
                  left: -(2 * ICON_SIZE * (36 / ICON_SIZE)),
                  top: -(0 * ICON_SIZE * (36 / ICON_SIZE)),
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sidequests"
        options={{
          tabBarIcon: ({ focused }) => (
            <SpriteIcon sprite="quest" label="QUESTS" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaders"
        options={{
          tabBarIcon: ({ focused }) => (
            <SpriteIcon sprite="leaders" label="RANKS" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <SpriteIcon sprite="profile" label="HERO" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F1A14',
    borderTopWidth: 1,
    borderTopColor: '#1E3A2A',
    height: 84,
    paddingBottom: 14,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
  },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A2A',
    borderWidth: 2,
    borderColor: '#48C9B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#48C9B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
});
