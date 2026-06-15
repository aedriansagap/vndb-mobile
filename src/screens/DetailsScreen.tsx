import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star } from 'lucide-react-native';
import { FadeInView } from '../components/animations/FadeInView';
import { ScaleButton } from '../components/animations/ScaleButton';
import { fetchVNCharacters, fetchVNReleases, fetchTags, Character, Release, Tag, VN } from '../api/vndb';
import { colors, spacing, borderRadius } from '../theme/colors';

export const DetailsScreen = ({ route, navigation }: any) => {
  const { vn } = route.params as { vn: VN };
  const [activeTab, setActiveTab] = useState<'About' | 'Characters' | 'Releases' | 'Tags'>('About');
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [tags, setTags] = useState<(Tag & { rating: number })[]>([]);
  
  const [loadingChars, setLoadingChars] = useState(true);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    // Fetch Characters
    fetchVNCharacters(vn.id)
      .then(data => setCharacters(data.results))
      .catch(console.error)
      .finally(() => setLoadingChars(false));
    
    // Fetch Releases
    fetchVNReleases(vn.id)
      .then(data => setReleases(data.results))
      .catch(console.error)
      .finally(() => setLoadingReleases(false));
      
    // Fetch Tags (filter major spoilers)
    if (vn.tags && vn.tags.length > 0) {
      const safeTags = vn.tags.filter(t => t.spoiler < 2).sort((a, b) => b.rating - a.rating).slice(0, 30);
      if (safeTags.length > 0) {
        fetchTags(safeTags.map(t => t.id))
          .then(data => {
            const merged = data.results.map(tagDef => {
              const vnTag = safeTags.find(t => t.id === tagDef.id);
              return { ...tagDef, rating: vnTag?.rating || 0 };
            }).sort((a, b) => b.rating - a.rating);
            setTags(merged);
          })
          .catch(console.error)
          .finally(() => setLoadingTags(false));
      } else {
        setLoadingTags(false);
      }
    } else {
      setLoadingTags(false);
    }
  }, [vn.id]);

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
      {['About', 'Characters', 'Releases', 'Tags'].map(tab => (
        <ScaleButton 
          key={tab} 
          style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
        </ScaleButton>
      ))}
    </ScrollView>
  );

  const renderAbout = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Synopsis</Text>
      <Text style={styles.description}>
        {vn.description ? vn.description.replace(/\[[^\]]+\]/g, '') : 'No description available.'}
      </Text>
    </View>
  );

  const renderCharacters = () => (
    <View style={styles.tabContent}>
      {loadingChars ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : characters.length === 0 ? (
        <Text style={styles.emptyText}>No characters found.</Text>
      ) : (
        <View style={styles.characterGrid}>
          {characters.map((char, index) => (
            <FadeInView key={char.id} delay={Math.min(index * 30, 400)} slideUpOffset={10} style={styles.characterCardWrapper}>
              <ScaleButton 
                style={styles.characterCard}
                onPress={() => navigation.navigate('CharacterDetails', { character: char })}
              >
                {char.image?.url ? (
                  <Image source={{ uri: char.image.url }} style={styles.characterImage} />
                ) : (
                  <View style={[styles.characterImage, { backgroundColor: colors.surfaceLight }]} />
                )}
                <Text style={styles.characterName} numberOfLines={1}>{char.name}</Text>
              </ScaleButton>
            </FadeInView>
          ))}
        </View>
      )}
    </View>
  );

  const renderReleases = () => (
    <View style={styles.tabContent}>
      {loadingReleases ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : releases.length === 0 ? (
        <Text style={styles.emptyText}>No releases found.</Text>
      ) : (
        releases.map((release) => (
          <View key={release.id} style={styles.releaseCard}>
            <Text style={styles.releaseTitle}>{release.title}</Text>
            <View style={styles.releaseMeta}>
              <Text style={styles.releaseDate}>{release.released || 'TBA'}</Text>
              <Text style={styles.releasePlatform}>
                {(release.platforms || []).map(p => p.toUpperCase()).join(', ')}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTags = () => (
    <View style={styles.tabContent}>
      {loadingTags ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : tags.length === 0 ? (
        <Text style={styles.emptyText}>No tags found.</Text>
      ) : (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <View key={tag.id} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
        <View style={styles.infoContainer}>
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
        </View>

        {renderTabs()}

        <FadeInView key={activeTab} delay={0} duration={250} slideUpOffset={8}>
          {activeTab === 'About' && renderAbout()}
          {activeTab === 'Characters' && renderCharacters()}
          {activeTab === 'Releases' && renderReleases()}
          {activeTab === 'Tags' && renderTags()}
        </FadeInView>

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
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginTop: -80,
    marginBottom: spacing.md,
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 24,
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characterCardWrapper: {
    width: '30%',
    marginBottom: spacing.md,
  },
  characterCard: {
    width: '100%',
  },
  characterImage: {
    width: '100%',
    height: 140,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  characterName: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  releaseCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  releaseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  releaseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  releaseDate: {
    color: colors.textMuted,
    fontSize: 14,
  },
  releasePlatform: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
