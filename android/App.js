import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { darkColors, lightColors } from './src/theme/colors';
import { searchTorrents } from './src/services/api';
import { TorrentCard } from './src/components/TorrentCard';
import { DetailSheet } from './src/components/DetailSheet';
import { SettingsSheet } from './src/components/SettingsSheet';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'music', label: 'Music' },
  { id: 'games', label: 'Games' },
  { id: 'software', label: 'Apps' },
  { id: 'ebooks', label: 'Books' },
];

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState('dark');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTorrent, setSelectedTorrent] = useState(null);
  
  const colors = useMemo(() => (theme === 'dark' ? darkColors : lightColors), [theme]);
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  const sheetRef = useRef(null);
  const settingsRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setResults([]);
    
    const data = await searchTorrents(query.trim(), category);
    setResults(data);
    setLoading(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const openDetail = useCallback((torrent) => {
    setSelectedTorrent(torrent);
    sheetRef.current?.expand();
  }, []);

  const openSettings = () => {
    settingsRef.current?.expand();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.largeTitle}>Search</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={toggleTheme}>
              <Ionicons 
                name={theme === 'dark' ? "sunny-outline" : "moon-outline"} 
                size={20} 
                color={colors.systemBlue} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={openSettings}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.systemBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, category === cat.id && styles.catPillActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.systemBlue} />
            <Text style={styles.loadingText}>Searching sources...</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <TorrentCard
                torrent={item}
                onPress={() => openDetail(item)}
                isFirst={index === 0}
                isLast={index === results.length - 1}
                colors={colors}
              />
            )}
          />
        ) : (
          <View style={styles.centerBox}>
            <Ionicons name="search" size={64} color={colors.systemGray4} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Find torrents across reliable sources</Text>
          </View>
        )}
      </View>

      {/* Detail Bottom Sheet */}
      <DetailSheet
        ref={sheetRef}
        torrent={selectedTorrent}
        colors={colors}
        onClose={() => setSelectedTorrent(null)}
      />

      {/* Settings Bottom Sheet */}
      <SettingsSheet
        ref={settingsRef}
        colors={colors}
        onClose={() => {}}
      />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MainScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
    height: 36,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 17,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 16,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.secondaryBackground,
  },
  catPillActive: {
    backgroundColor: colors.systemBlue,
  },
  catText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.systemBlue,
  },
  catTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
