import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VN } from '../api/vndb';
import { colors, spacing, borderRadius } from '../theme/colors';

interface VnCardProps {
  vn: VN;
  onPress: () => void;
}

export const VnCard: React.FC<VnCardProps> = ({ vn, onPress }) => {
  const imageUrl = vn.image?.url;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(13, 13, 18, 0.8)', colors.background]}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {vn.title}
        </Text>
        <View style={styles.metadata}>
          {vn.rating ? (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {(vn.rating / 10).toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 240,
    margin: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 46, 147, 0.8)', // Primary color with opacity
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
