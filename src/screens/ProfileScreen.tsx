import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Key } from 'lucide-react-native';
import { fetchAuthInfo, fetchUserList } from '../api/vndb';
import { colors, spacing, borderRadius } from '../theme/colors';

const TOKEN_KEY = '@vndb_auth_token';

export const ProfileScreen = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const loadUserData = async (activeToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const info = await fetchAuthInfo(activeToken);
      setAuthInfo(info);
      const listData = await fetchUserList(activeToken);
      setUserList(listData.results || []);
    } catch (e: any) {
      setError(e.message || 'Failed to authenticate');
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    try {
      // Test the token
      await fetchAuthInfo(tokenInput);
      await AsyncStorage.setItem(TOKEN_KEY, tokenInput);
      setToken(tokenInput);
    } catch (e) {
      setError('Invalid token. Please check your VNDB account settings.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthInfo(null);
    setUserList([]);
    setTokenInput('');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Key color={colors.primary} size={48} style={{ marginBottom: spacing.lg }} />
          <Text style={styles.title}>Welcome to VNDB</Text>
          <Text style={styles.subtitle}>
            To view your personal lists, enter your VNDB API Token. You can generate one in your VNDB account settings.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Paste your token here..."
            placeholderTextColor={colors.textMuted}
            value={tokenInput}
            onChangeText={setTokenInput}
            secureTextEntry
            autoCapitalize="none"
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{authInfo?.username || 'User'}</Text>
          <Text style={styles.headerSubtitle}>Personal List</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.error} size={20} />
        </TouchableOpacity>
      </View>

      {userList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Your list is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={userList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              {item.vn?.image?.url ? (
                <Image source={{ uri: item.vn.image.url }} style={styles.listImage} />
              ) : (
                <View style={[styles.listImage, { backgroundColor: colors.surfaceLight }]} />
              )}
              <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={2}>{item.vn?.title}</Text>
                {item.vote && (
                  <Text style={styles.listVote}>Score: {(item.vote / 10).toFixed(1)}</Text>
                )}
              </View>
            </View>
          )}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  logoutButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 61, 0, 0.1)',
    borderRadius: borderRadius.md,
  },
  listContainer: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  listImage: {
    width: 80,
    height: 100,
  },
  listContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  listTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  listVote: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
