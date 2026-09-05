import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONT } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

// Spritesheet is 2 cols x 3 rows, each cell ~512x512 in a 1024x1536 image
// Row 0: map (0,0), feed/quests board (0,1)
// Row 1: create plus (1,0), sidequest lightning (1,1)
// Row 2: trophy (2,0), profile knight (2,1)
const SHEET_W = 1024;
const SHEET_H = 1536;
const CELL_W = 512;
const CELL_H = 512;
const DISPLAY = 30;
const SCALE_X = DISPLAY / CELL_W;
const SCALE_Y = DISPLAY / CELL_H;

type SpriteId = 'map' | 'feed' | 'create' | 'quest' | 'leaders' | 'profile';

const SPRITE_COORDS: Record<SpriteId, { col: number; row: number }> = {
  map:     { col: 1, row: 0 },
  feed:    { col: 1, row: 0 },
  create:  { col: 0, row: 1 },
  quest:   { col: 1, row: 1 },
  leaders: { col: 0, row: 2 },
  profile: { col: 1, row: 2 },
};

function SpriteIcon({ id, label, focused }: { id: SpriteId; label: string; focused: boolean }) {
  const { col, row } = SPRITE_COORDS[id];
  return (
    <View style={iconStyles.wrap}>
      <View style={[iconStyles.iconBox, focused && iconStyles.iconBoxFocused]}>
        <View style={{ width: DISPLAY, height: DISPLAY, overflow: 'hidden' }}>
          <Image
            source={require('../../assets/icons/tab_icons.png')}
            style={{
              width: SHEET_W * SCALE_X,
              height: SHEET_H * SCALE_Y,
              position: 'absolute',
              left: -(col * CELL_W * SCALE_X),
              top: -(row * CELL_H * SCALE_Y),
              right: -(col * CELL_W * SCALE_X),
            }}
            resizeMode="cover"
          />
        </View>
      </View>
      <Text style={[iconStyles.label, focused && iconStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 3},
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBoxFocused: {
    backgroundColor: 'rgba(72, 201, 176, 0.15)',
    borderWidth: 1,
    borderColor: '#48C9B0',
  },
  label: {
    fontFamily: FONT.pixel,
    fontSize: 6,
    color: '#4A6357',
    letterSpacing: 0,
  },
  labelFocused: {
    color: '#48C9B0',
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
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <SpriteIcon id="map" label="MAP" focused={focused} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ tabBarIcon: ({ focused }) => <SpriteIcon id="feed" label="FEED" focused={focused} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.createBtn}>
              <Text style={styles.createPlus}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sidequests"
        options={{ tabBarIcon: ({ focused }) => <SpriteIcon id="quest" label="QUESTS" focused={focused} /> }}
      />
      <Tabs.Screen
        name="leaders"
        options={{ tabBarIcon: ({ focused }) => <SpriteIcon id="leaders" label="RANKS" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <SpriteIcon id="profile" label="HERO" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D1710',
    borderTopWidth: 1,
    borderTopColor: '#1E3A2A',
    height: 82,
    paddingBottom: 12,
    paddingTop: 8,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  createBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#162212',
    borderWidth: 2,
    borderColor: '#48C9B0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#48C9B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  createPlus: {
    fontSize: 26,
    color: '#48C9B0',
    fontFamily: FONT.pixel,
    lineHeight: 30,
  },
});
