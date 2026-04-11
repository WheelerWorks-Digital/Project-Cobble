import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { Post } from '../../constants/types';
import { NEIGHBORHOODS } from '../../constants/mockData';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 160;

function buildMapHtml(posts: Post[], selectedId: string | null) {
  const markers = posts.map(p => {
    const cat = CATEGORY_META[p.category];
    const isSelected = p.id === selectedId;
    return `
      L.circleMarker([${p.lat}, ${p.lng}], {
        radius: ${isSelected ? 18 : 12},
        fillColor: '${cat.color}',
        color: '#fff',
        weight: ${isSelected ? 3 : 2},
        opacity: 1,
        fillOpacity: ${isSelected ? 1 : 0.85},
      })
      .addTo(map)
      .bindTooltip('<b>${p.title.replace(/'/g, "\\'")}</b>', { permanent: false, direction: 'top' })
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selectPost', id: '${p.id}' }));
      });
    `;
  }).join('\n');

  const neighborhoodLabels = NEIGHBORHOODS.map(n => `
    L.marker([${n.lat}, ${n.lng}], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:rgba(45,80,22,0.75);color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-family:sans-serif;font-weight:600;white-space:nowrap;border:1px solid rgba(255,255,255,0.3)">${n.name}</div>',
        iconAnchor: [40, 12],
      })
    }).addTo(map);
  `).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-container { background: #EDE6D6; }
    .leaflet-tile { filter: saturate(0.6) sepia(0.25) hue-rotate(60deg) brightness(1.05); }
    .leaflet-control-attribution { display: none; }
    .leaflet-control-zoom { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [39.9785, -75.1330],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    ${neighborhoodLabels}
    ${markers}
  </script>
</body>
</html>
  `;
}

const CATEGORIES: (Category | 'all')[] = ['all', 'safety', 'infrastructure', 'beautification', 'community', 'environment'];

export default function MapScreen() {
  const { posts } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const webViewRef = useRef<any>(null);

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.category === filter);
  const selectedPost = posts.find(p => p.id === selectedId) ?? null;

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selectPost') {
        setSelectedId(data.id);
      }
    } catch {}
  }, []);

  const mapHtml = buildMapHtml(filteredPosts, selectedId);

  return (
    <View style={styles.container}>
      {/* Map */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        onMessage={handleMessage}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🪨</Text>
            <Text style={styles.logoLabel}>Cobble</Text>
          </View>
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>📍 Philadelphia, PA</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map(cat => {
            const active = filter === cat;
            const meta = cat !== 'all' ? CATEGORY_META[cat] : null;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  active && { backgroundColor: meta?.color ?? COLORS.greenMid },
                ]}
                onPress={() => setFilter(cat)}
                activeOpacity={0.8}
              >
                {meta && <Text style={styles.chipEmoji}>{meta.icon}</Text>}
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {cat === 'all' ? 'All' : meta!.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Post count bubble */}
      <View style={styles.countBubble}>
        <Text style={styles.countText}>{filteredPosts.length} issues</Text>
      </View>

      {/* Selected post card */}
      {selectedPost && (
        <TouchableOpacity
          style={styles.selectedCard}
          onPress={() => router.push(`/post/${selectedPost.id}`)}
          activeOpacity={0.95}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedId(null)}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>

          <View style={styles.cardRow}>
            <Image source={{ uri: selectedPost.image_url }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <View style={[styles.catChip, { backgroundColor: CATEGORY_META[selectedPost.category].bg }]}>
                <Text style={styles.catChipText}>
                  {CATEGORY_META[selectedPost.category].icon} {CATEGORY_META[selectedPost.category].label}
                </Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{selectedPost.title}</Text>
              <Text style={styles.cardNeighborhood}>📍 {selectedPost.neighborhood_name}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.upvoteRow}>
              <Text style={styles.upvoteText}>▲ {selectedPost.upvotes} neighbors agree</Text>
            </View>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View →</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige100 },
  map: { ...StyleSheet.absoluteFillObject },

  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoEmoji: { fontSize: 20 },
  logoLabel: { fontFamily: FONT.bold, fontSize: 18, color: COLORS.greenDark },
  locationPill: {
    backgroundColor: COLORS.beige100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  locationText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMid },

  filterScroll: { marginTop: 10 },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMid },
  chipLabelActive: { color: COLORS.white },

  countBubble: {
    position: 'absolute',
    bottom: 190,
    right: SPACING.md,
    backgroundColor: COLORS.greenDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  countText: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.white },

  selectedCard: {
    position: 'absolute',
    bottom: 90,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  closeX: { fontSize: 16, color: COLORS.textMuted },

  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.beige200,
  },
  cardInfo: { flex: 1, gap: 5 },
  catChip: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catChipText: { fontFamily: FONT.medium, fontSize: 11, color: COLORS.textMid },
  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 19,
  },
  cardNeighborhood: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.beige200,
    paddingTop: 10,
  },
  upvoteRow: { flexDirection: 'row', alignItems: 'center' },
  upvoteText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.greenMid },
  viewBtn: {
    backgroundColor: COLORS.greenMid,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  viewBtnText: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.white },
});
