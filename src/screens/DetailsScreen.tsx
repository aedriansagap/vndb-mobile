import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star } from 'lucide-react-native';
import { fetchVNCharacters, Character, VN } from '../api/vndb';
import { colors, spacing, borderRadius } from '../theme/colors';

export const DetailsScreen = ({ route, navigation }: any) => {
  const { vn } = route.params as { vn: VN };
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const data = await fetchVNCharacters(vn.id);
        setCharacters(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCharacters();
  }, [vn.id]);

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Cover Image Header */}
        <View style={styles.headerContainer}>
          {vn.image?.url ? (
            <Image source={{ uri: vn.image.url }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.surfaceLight }]} />
          )}
          <LinearGradient
            colors={['rgba(13,13,18,0.3)', 'rgba(13,13,18,0.8)', colors.background]}
            style={styles.gradient}
          />
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Info Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{vn.title}</Text>
          {vn.alttitle && <Text style={styles.altTitle}>{vn.alttitle}</Text>}
          
          <View style={styles.metaRow}>
            {vn.rating ? (
              <View style={styles.ratingBadge}>
                <Star color="#FFF" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{(vn.rating / 10).toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>
            {vn.description ? vn.description.replace(/\[[^\]]+\]/g, '') : 'No description available.'}
          </Text>

          <Text style={styles.sectionTitle}>Characters</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : characters.length === 0 ? (
            <Text style={styles.emptyText}>No characters found.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.characterScroll}>
              {characters.map((char) => (
                <View key={char.id} style={styles.characterCard}>
                  {char.image?.url ? (
                    <Image source={{ uri: char.image.url }} style={styles.characterImage} />
                  ) : (
                    <View style={[styles.characterImage, { backgroundColor: colors.surfaceLight }]} />
                  )}
                  <Text style={styles.characterName} numberOfLines={1}>{char.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: spacing.lg,
    marginTop: -80,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  altTitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  ratingText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 24,
  },
  characterScroll: {
    marginTop: spacing.sm,
  },
  characterCard: {
    width: 100,
    marginRight: spacing.md,
  },
  characterImage: {
    width: 100,
    height: 140,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  characterName: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
