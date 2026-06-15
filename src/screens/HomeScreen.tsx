import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { fetchPopularVNs, VN } from '../api/vndb';
import { VnCard } from '../components/VnCard';
import { colors, spacing } from '../theme/colors';

export const HomeScreen = ({ navigation }: any) => {
  const [vns, setVns] = useState<VN[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await fetchPopularVNs(pageNum);
      
      if (pageNum === 1) {
        setVns(data.results);
      } else {
        setVns((prev) => [...prev, ...data.results]);
      }
      
      setHasMore(data.more || false);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visual novels');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(page + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending</Text>
      </View>
      <FlatList
        data={vns}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={{ padding: spacing.md, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        )}
        renderItem={({ item, index }) => (
          <VnCard 
            vn={item} 
            index={index}
            onPress={() => navigation.navigate('Details', { vn: item })} 
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  listContainer: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
});
