// Org Map — reuses the same map component with org-mode styling
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, FONT, SPACING, RADIUS } from '../../constants/theme';
import { NEIGHBORHOODS } from '../../constants/mockData';
import { Post } from '../../constants/types';

function buildOrgMap(posts: Post[]) {
  const markers = posts.map(p => {
    const cat = CATEGORY_META[p.category];
    const isHigh = p.upvotes >= 150;
    return `
      L.circleMarker([${p.lat}, ${p.lng}], {
        radius: ${isHigh ? 18 : 12},
        fillColor: '${cat.color}',
        color: '${isHigh ? '#fff' : '#fff'}',
        weight: ${isHigh ? 3 : 2},
        opacity: 1,
        fillOpacity: 0.9,
      })
      .addTo(map)
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selectPost', id: '${p.id}' }));
      });
    `;
  }).join('\n');

  const nhLabels = NEIGHBORHOODS.map(n => `
    L.marker([${n.lat}, ${n.lng}], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:rgba(45,80,22,0.8);color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-family:sans-serif;font-weight:600;white-space:nowrap">${n.name}</div>',
        iconAnchor: [40, 12],
      })
    }).addTo(map);
  `).join('\n');

  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>* {margin:0;padding:0;box-sizing:border-box;} html,body,#map{width:100%;height:100%;} .leaflet-container{background:#EDE6D6;} .leaflet-tile{filter:saturate(0.5) sepia(0.3) hue-rotate(60deg) brightness(1.0);} .leaflet-control-attribution{display:none;} .leaflet-control-zoom{display:none;}</style>
    </head><body><div id="map"></div><script>
    var map = L.map('map',{center:[39.9785,-75.1330],zoom:12,zoomControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
    ${nhLabels}${markers}
    </script></body></html>`;
}

export default function OrgMapScreen() {
  const { posts } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPost = posts.find(p => p.id === selectedId);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selectPost') setSelectedId(data.id);
    } catch {}
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: buildOrgMap(posts) }}
        style={StyleSheet.absoluteFill}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗺️ Issue Heatmap</Text>
          <Text style={styles.headerSub}>NKCDC Coverage Area</Text>
        </View>
      </SafeAreaView>

      {selectedPost && (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/post/${selectedPost.id}`)}
          activeOpacity={0.95}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedId(null)}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
          <View style={styles.cardRow}>
            <Image source={{ uri: selectedPost.image_url }} style={styles.cardImg} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>{selectedPost.title}</Text>
              <Text style={styles.cardNeigh}>📍 {selectedPost.neighborhood_name}</Text>
              <Text style={styles.cardUpvotes}>▲ {selectedPost.upvotes} residents</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: {
    margin: SPACING.md,
    backgroundColor: COLORS.greenDark,
    borderRadius: RADIUS.lg,
    padding: 14,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.white },
  headerSub: { fontFamily: FONT.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  card: {
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
  closeBtn: { position: 'absolute', top: 10, right: 12, zIndex: 10, padding: 4 },
  closeX: { fontSize: 16, color: COLORS.textMuted },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardImg: { width: 64, height: 64, borderRadius: RADIUS.md, backgroundColor: COLORS.beige200 },
  cardInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  cardTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.textDark, lineHeight: 19 },
  cardNeigh: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textMuted },
  cardUpvotes: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.greenMid },
});
