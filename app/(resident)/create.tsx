import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS, CATEGORY_META, FONT, SPACING, RADIUS, Category } from '../../constants/theme';
import { NEIGHBORHOODS } from '../../constants/mockData';
import { Post } from '../../constants/types';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][];

export default function CreateScreen() {
  const { addPost } = useApp();
  const [step, setStep] = useState(1); // 1=photo, 2=details, 3=confirm
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].id);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to snap photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    const nh = NEIGHBORHOODS.find(n => n.id === neighborhood)!;
    const newPost: Post = {
      id: `p-${Date.now()}`,
      title,
      description,
      category: category!,
      image_url: image ?? 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      lat: nh.lat + (Math.random() - 0.5) * 0.01,
      lng: nh.lng + (Math.random() - 0.5) * 0.01,
      neighborhood_id: nh.id,
      neighborhood_name: nh.name,
      author_name: isAnonymous ? 'Anonymous' : 'You',
      author_avatar: 'https://i.pravatar.cc/150?img=3',
      upvotes: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      has_upvoted: true,
      is_anonymous: isAnonymous,
      verified: false,
    };
    addPost(newPost);
    setStep(3);
  };

  const resetAndClose = () => {
    setStep(1);
    setImage(null);
    setTitle('');
    setDescription('');
    setCategory(null);
    setIsAnonymous(false);
    router.push('/(resident)/feed');
  };

  // Step 3: Success
  if (step === 3) {
    return (
      <LinearGradient colors={[COLORS.greenDark, COLORS.greenMid]} style={styles.successContainer}>
        <SafeAreaView style={styles.successSafe}>
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Posted!</Text>
            <Text style={styles.successSub}>
              Your post is under review.{'\n'}Once verified it will go live for neighbors to see.
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={resetAndClose} activeOpacity={0.9}>
              <Text style={styles.successBtnText}>View in Feed</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Add a Photo' : 'Describe the Issue'}
          </Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
        </View>

        {/* Step 1: Photo */}
        {step === 1 && (
          <View style={styles.section}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.preview} />
                <TouchableOpacity style={styles.replaceBtn} onPress={pickImage}>
                  <Text style={styles.replaceBtnText}>Replace Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} activeOpacity={0.85}>
                  <Text style={styles.photoBtnEmoji}>📷</Text>
                  <Text style={styles.photoBtnLabel}>Take Photo</Text>
                  <Text style={styles.photoBtnSub}>Snap it right now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.85}>
                  <Text style={styles.photoBtnEmoji}>🖼️</Text>
                  <Text style={styles.photoBtnLabel}>Choose from Library</Text>
                  <Text style={styles.photoBtnSub}>Pick an existing photo</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.nextBtn, !image && styles.nextBtnDisabled]}
              onPress={() => image && setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(2)}>
              <Text style={styles.skipBtnText}>Skip photo for now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <View style={styles.section}>
            {image && <Image source={{ uri: image }} style={styles.detailThumb} />}

            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Broken streetlight on 3rd Ave"
              placeholderTextColor={COLORS.textLight}
              multiline={false}
              maxLength={80}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell your neighbors what's happening and why it matters..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={400}
            />

            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(([key, meta]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.catOption,
                    category === key && { backgroundColor: meta.color, borderColor: meta.color },
                  ]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.catOptionEmoji}>{meta.icon}</Text>
                  <Text style={[styles.catOptionLabel, category === key && { color: COLORS.white }]}>
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Neighborhood</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nhScroll}>
              {NEIGHBORHOODS.map(n => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.nhChip, neighborhood === n.id && styles.nhChipActive]}
                  onPress={() => setNeighborhood(n.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nhChipText, neighborhood === n.id && styles.nhChipTextActive]}>
                    {n.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Anonymous toggle */}
            <TouchableOpacity
              style={[styles.anonToggle, isAnonymous && styles.anonToggleActive]}
              onPress={() => setIsAnonymous(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.anonDot, isAnonymous && styles.anonDotActive]} />
              <View style={styles.anonContent}>
                <Text style={styles.anonTitle}>Post anonymously</Text>
                <Text style={styles.anonSub}>
                  {isAnonymous
                    ? 'Your name will be hidden from neighbors'
                    : 'Your name will be shown on this post'}
                </Text>
              </View>
              <Text style={styles.anonCheck}>{isAnonymous ? '✓' : ''}</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, (!title || !category) && styles.nextBtnDisabled]}
                onPress={() => title && category && handleSubmit()}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Post to Cobble 🪨</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.beige100 },
  scroll: { flex: 1 },

  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.beige300,
  },
  stepDotActive: { backgroundColor: COLORS.greenMid },
  stepLine: {
    flex: 0,
    width: 24,
    height: 2,
    backgroundColor: COLORS.beige300,
    marginHorizontal: 4,
  },

  section: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
    gap: 14,
  },

  photoActions: { gap: 12 },
  photoBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.beige300,
    borderStyle: 'dashed',
  },
  photoBtnEmoji: { fontSize: 36 },
  photoBtnLabel: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.textDark },
  photoBtnSub: { fontFamily: FONT.regular, fontSize: 13, color: COLORS.textMuted },

  previewContainer: { gap: 8, alignItems: 'center' },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.beige200,
  },
  replaceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  replaceBtnText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMuted },

  nextBtn: {
    backgroundColor: COLORS.greenMid,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnDisabled: { backgroundColor: COLORS.beige300 },
  nextBtnText: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.white },

  skipBtn: { alignItems: 'center' },
  skipBtnText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.textMuted },

  detailThumb: {
    width: '100%',
    height: 140,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.beige200,
  },

  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.textMid,
    marginBottom: -6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.beige300,
  },
  inputMulti: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.beige300,
  },
  catOptionEmoji: { fontSize: 16 },
  catOptionLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textMid,
  },

  nhScroll: { maxHeight: 44 },
  nhChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beige300,
    marginRight: 8,
  },
  nhChipActive: {
    backgroundColor: COLORS.greenDark,
    borderColor: COLORS.greenDark,
  },
  nhChipText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMid },
  nhChipTextActive: { color: COLORS.white },

  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.beige300,
  },
  anonToggleActive: {
    borderColor: COLORS.greenLight,
    backgroundColor: COLORS.greenPale,
  },
  anonDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.beige400,
    backgroundColor: COLORS.white,
  },
  anonDotActive: {
    borderColor: COLORS.greenMid,
    backgroundColor: COLORS.greenMid,
  },
  anonContent: { flex: 1 },
  anonTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.textDark,
  },
  anonSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  anonCheck: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.greenMid,
    width: 20,
    textAlign: 'center',
  },

  actionRow: { flexDirection: 'row', gap: 10 },
  backBtn: {
    flex: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.beige300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  backBtnText: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textMid },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.greenMid,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnText: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.white },

  successContainer: { flex: 1 },
  successSafe: { flex: 1 },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 16,
  },
  successEmoji: { fontSize: 64 },
  successTitle: {
    fontFamily: FONT.bold,
    fontSize: 36,
    color: COLORS.white,
    letterSpacing: -1,
  },
  successSub: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  successBtn: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  successBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: COLORS.greenDark,
  },
});
