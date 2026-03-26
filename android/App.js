import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
  Appearance,
  Alert,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  // State
  const [activeTab, setActiveTab] = useState('search');
  const [themeMode, setThemeMode] = useState('system');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTorrent, setSelectedTorrent] = useState(null);
  const [downloads, setDownloads] = useState([]);

  // Compute actual colors
  const systemColorScheme = Appearance.useColorScheme();
  const theme = useMemo(() => {
    if (themeMode === 'system') return systemColorScheme || 'dark';
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => (theme === 'dark' ? darkColors : lightColors), [theme]);
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  const sheetRef = useRef(null);
  const settingsRef = useRef(null);

  // Load saved theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('torquest_theme_mode');
        if (saved) setThemeMode(saved);
      } catch (e) {}
    };
    loadTheme();
  }, []);

  // Save theme
  const handleSetTheme = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('torquest_theme_mode', mode);
    } catch (e) {}
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

  const handleDownload = useCallback((torrent) => {
    // Check if already downloading
    if (downloads.some(d => d.id === torrent.id)) {
      Alert.alert('Download', 'This torrent is already in your download list.');
      return;
    }

    const newDownload = {
      ...torrent,
      progress: 0,
      status: 'downloading',
      speed: '0 KB/s',
      addedAt: Date.now(),
      paused: false,
    };
    setDownloads(prev => [newDownload, ...prev]);
    setActiveTab('downloads');
    sheetRef.current?.close();
  }, [downloads]);

  // Simulated Download Progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(d => {
        if (!d.paused && d.progress < 100) {
          const nextProgress = Math.min(d.progress + Math.random() * 2, 100);
          return { 
            ...d, 
            progress: nextProgress, 
            status: nextProgress === 100 ? 'completed' : 'downloading',
            speed: nextProgress === 100 ? '0 KB/s' : `${(Math.random() * 5 + 1).toFixed(1)} MB/s`
          };
        }
        return d;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const togglePause = (id) => {
    setDownloads(prev => prev.map(d => {
      if (d.id === id && d.status !== 'completed') {
        return { ...d, paused: !d.paused, speed: !d.paused ? '0 KB/s' : d.speed };
      }
      return d;
    }));
  };

  const removeDownload = (id) => {
    Alert.alert('Remove Download', 'Are you sure you want to remove this download?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setDownloads(prev => prev.filter(d => d.id !== id));
      }},
    ]);
  };

  const openDetail = useCallback((torrent) => {
    setSelectedTorrent(torrent);
    sheetRef.current?.expand();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.largeTitle}>{activeTab === 'search' ? 'Search' : 'Downloads'}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => handleSetTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Ionicons 
                name={theme === 'dark' ? "sunny-outline" : "moon-outline"} 
                size={20} 
                color={colors.systemBlue} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => settingsRef.current?.expand()}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.systemBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'search' && (
          <>
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
                  <TouchableOpacity onPress={() => {setQuery(''); setResults([]);}} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
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
          </>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'search' ? (
          loading ? (
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
          )
        ) : (
          /* Downloads Tab */
          downloads.length > 0 ? (
            <FlatList
              data={downloads}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={[styles.downloadCard, item.paused && styles.downloadCardPaused]}>
                  <View style={styles.downloadInfo}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.downloadTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[
                          styles.statusBadge, 
                          { backgroundColor: item.status === 'completed' ? colors.systemGreen : (item.paused ? colors.systemOrange : colors.systemBlue) }
                        ]}>
                          <Text style={styles.statusBadgeText}>
                            {item.status === 'completed' ? 'Finished' : (item.paused ? 'Paused' : 'Downloading')}
                          </Text>
                        </View>
                        <Text style={styles.downloadMeta}>{item.size_str} • {item.speed}</Text>
                      </View>
                    </View>
                    <View style={styles.downloadActions}>
                      {item.status !== 'completed' && (
                        <TouchableOpacity style={styles.miniBtn} onPress={() => togglePause(item.id)}>
                          <Ionicons name={item.paused ? "play" : "pause"} size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.miniBtn, styles.removeBtn]} onPress={() => removeDownload(item.id)}>
                        <Ionicons name="trash-outline" size={16} color={colors.systemRed} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill, 
                        { 
                          width: `${item.progress}%`, 
                          backgroundColor: item.status === 'completed' ? colors.systemGreen : (item.paused ? colors.systemOrange : colors.systemBlue) 
                        }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <View style={styles.centerBox}>
              <Ionicons name="cloud-download-outline" size={64} color={colors.systemGray4} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No active downloads</Text>
            </View>
          )
        )}
      </View>

      {/* Bottom Tabs */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('search')}>
          <Ionicons name="search" size={24} color={activeTab === 'search' ? colors.systemBlue : colors.textTertiary} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('downloads')}>
          <Ionicons name="download" size={24} color={activeTab === 'downloads' ? colors.systemBlue : colors.textTertiary} />
          <Text style={[styles.tabText, activeTab === 'downloads' && styles.tabTextActive]}>Downloads</Text>
        </TouchableOpacity>
      </View>

      <DetailSheet
        ref={sheetRef}
        torrent={selectedTorrent}
        colors={colors}
        onClose={() => setSelectedTorrent(null)}
        onDownload={handleDownload}
      />

      <SettingsSheet
        ref={settingsRef}
        colors={colors}
        themeMode={themeMode}
        onSetTheme={handleSetTheme}
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
    paddingBottom: 20,
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
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: colors.separator,
    backgroundColor: colors.background,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabText: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.systemBlue,
  },
  downloadCard: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  downloadCardPaused: {
    borderColor: colors.separator,
  },
  downloadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  downloadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  downloadMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.separator,
  },
  removeBtn: {
    borderColor: colors.systemRed + '40',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.separator,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'right',
  }
});
