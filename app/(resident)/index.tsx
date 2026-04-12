import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { Post } from '../../constants/types';
import { NEIGHBORHOODS } from '../../constants/mockData';

const { width } = Dimensions.get('window');

// Stable HTML — does NOT depend on selectedId so the map never reloads on selection.
// Markers are rendered as SVG pin icons for issues and pill labels for neighborhoods.
function buildMapHtml(posts: Post[]) {
  const markers = posts.map(p => {
    const cat = CATEGORY_META[p.category];
    const isPending = p.status === 'pending';
    const pinColor = isPending ? '#9B59B6' : cat.color;
    const escapedTitle = p.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `
      (function() {
        var icon = L.divIcon({
          className: '',
          html: '<div style="width:26px;height:34px;position:relative;cursor:pointer">'
            + '<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">'
            + '<path d="M13 1C6.925 1 2 5.925 2 12c0 8.5 11 21 11 21s11-12.5 11-21C24 5.925 19.075 1 13 1z" fill="${pinColor}" stroke="white" stroke-width="2"/>'
            + '<circle cx="13" cy="12" r="4.5" fill="white" fill-opacity="0.9"/>'
            + '</svg></div>',
          iconSize: [26, 34],
          iconAnchor: [13, 34],
          tooltipAnchor: [0, -36],
        });
        L.marker([${p.lat}, ${p.lng}], { icon: icon })
          .addTo(map)
          .bindTooltip('<b>${escapedTitle}</b>', { permanent: false, direction: 'top', className: 'cobble-tip' })
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selectPost', id: '${p.id}' }));
          });
      })();
    `.replace('${pinColor}', pinColor);
  }).join('\n');

  const neighborhoodLabels = NEIGHBORHOODS.map(n => `
    L.marker([${n.lat}, ${n.lng}], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:transparent;color:#48C9B0;padding:5px 12px;text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;font-size:8px;font-family:\\'Press Start 2P\\', monospace;line-height:1.5;white-space:nowrap;letter-spacing:1px;text-transform:uppercase;">${n.name}</div>',
        iconAnchor: [40, 14],
      }),
      interactive: false,
      zIndexOffset: -100,
    }).addTo(map);
  `).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-container { background: #0F1A14; }
    /* Dark map filter to make it look extra retro */
    .leaflet-tile { filter: contrast(1.2) grayscale(0.5) sepia(0.3) hue-rotate(90deg) brightness(0.6) invert(1) hue-rotate(180deg); }
    .leaflet-control-attribution { display: none; }
    .leaflet-control-zoom { display: none; }
    .cobble-tip { 
      font-family: 'Press Start 2P', monospace; 
      font-size: 8px; 
      padding: 6px 10px; 
      background: #162212; 
      color: #48C9B0; 
      border: 1px solid #1E3A2A; 
      box-shadow: 2px 2px 0px rgba(0,0,0,0.5); 
      border-radius: 0; 
      line-height: 1.4;
      text-transform: uppercase;
    }
    .leaflet-tooltip-top:before { border-top-color: #162212; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [39.9700, -75.1650],
      zoom: 12,
      zoomControl: false,
    });

    // We use standard tiles but invert/filter them to look dark and retro
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

const CATEGORIES: (Category | 'all')[] = ['all', 'convenience', 'safety', 'infrastructure', 'beautification', 'community', 'environment'];

export default function MapScreen() {
  const { posts } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const webViewRef = useRef<any>(null);

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => p.status !== 'pending');
    if (filter !== 'all') {
      result = result.filter(p => p.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.neighborhood_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, filter, search]);

  const selectedPost = posts.find(p => p.id === selectedId) ?? null;

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selectPost') {
        setSelectedId(data.id);
      }
    } catch {}
  }, []);

  // Only rebuild HTML when filtered posts change — never when selectedId changes
  const mapHtml = useMemo(() => buildMapHtml(filteredPosts), [filteredPosts]);

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
          <TextInput
            style={styles.searchBar}
            value={search}
            onChangeText={setSearch}
            placeholder="Search issues, places…"
            placeholderTextColor={COLORS.textLight}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
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
            <Image
              source={{ uri: selectedPost.image_url }}
              style={styles.cardImage}
              defaultSource={{ uri: 'https://via.placeholder.com/72x72/EDE6D6/9C9589?text=📍' }}
            />
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
  container: { flex: 1, backgroundColor: '#0F1A14' },
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
    gap: 10,
    marginHorizontal: SPACING.md,
    marginTop: 8,
    backgroundColor: '#162212',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#1E3A2A',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoEmoji: { fontSize: 16 },
  logoLabel: { fontFamily: FONT.pixel, fontSize: 10, color: '#48C9B0' },
  searchBar: {
    flex: 1,
    fontFamily: FONT.pixel,
    fontSize: 9,
    color: COLORS.white,
    backgroundColor: '#0F1A14',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#1E3A2A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 34,
  },

  filterScroll: { marginTop: 10 },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#162212',
    borderWidth: 1,
    borderColor: '#1E3A2A',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 2,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontFamily: FONT.pixel, fontSize: 8, color: '#3D5A48' },
  chipLabelActive: { color: COLORS.white },

  countBubble: {
    position: 'absolute',
    bottom: 150,
    right: SPACING.md,
    backgroundColor: '#0F1A14',
    borderWidth: 1,
    borderColor: '#48C9B0',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  countText: { fontFamily: FONT.pixel, fontSize: 8, color: '#48C9B0' },

  selectedCard: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#162212',
    borderWidth: 1,
    borderColor: '#48C9B0',
    borderRadius: 0,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  closeX: { fontFamily: FONT.pixel, fontSize: 10, color: '#3D5A48' },

  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: '#0F1A14',
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  cardInfo: { flex: 1, gap: 5 },
  catChip: {
    alignSelf: 'flex-start',
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#1E3A2A',
  },
  catChipText: { fontFamily: FONT.pixel, fontSize: 7, color: COLORS.white },
  cardTitle: {
    fontFamily: FONT.pixel,
    fontSize: 9,
    color: '#E8F5E9',
    lineHeight: 14,
  },
  cardNeighborhood: {
    fontFamily: FONT.pixel,
    fontSize: 7,
    color: '#3D5A48',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E3A2A',
    paddingTop: 10,
  },
  upvoteRow: { flexDirection: 'row', alignItems: 'center' },
  upvoteText: { fontFamily: FONT.pixel, fontSize: 7, color: '#FFD166' },
  viewBtn: {
    backgroundColor: '#48C9B0',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewBtnText: { fontFamily: FONT.pixel, fontSize: 8, color: '#0F1A14' },
});
