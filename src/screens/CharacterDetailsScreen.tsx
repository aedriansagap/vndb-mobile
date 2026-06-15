import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Character } from '../api/vndb';
import { colors, spacing, borderRadius } from '../theme/colors';

export const CharacterDetailsScreen = ({ route, navigation }: any) => {
  const { character } = route.params as { character: Character };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Cover Image Header */}
        <View style={styles.headerContainer}>
          {character.image?.url ? (
            <Image source={{ uri: character.image.url }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.surfaceLight }]} />
          )}
          <LinearGradient
            colors={['rgba(13,13,18,0.1)', 'rgba(13,13,18,0.8)', colors.background]}
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
          <Text style={styles.title}>{character.name}</Text>
          {character.original && <Text style={styles.altTitle}>{character.original}</Text>}

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {character.description ? character.description.replace(/\[[^\]]+\]/g, '') : 'No description available.'}
          </Text>
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
    height: 500, // Characters usually have taller portraits
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
    marginTop: -100,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  altTitle: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.lg,
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
});
