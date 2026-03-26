import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const TorrentCard = ({ torrent, onPress, isFirst, isLast, colors }) => {
  const styles = createStyles(colors);
  
  const containerStyle = [
    styles.container,
    isFirst && styles.firstItem,
    isLast && styles.lastItem,
    !isLast && styles.bottomBorder,
  ];

  const dateStr = new Date(parseInt(torrent.added) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{torrent.title}</Text>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>{torrent.source}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>{torrent.size_str}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{dateStr}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText} numberOfLines={1}>{torrent.category}</Text>
        </View>

        <View style={styles.stats}>
          <Ionicons name="arrow-up" size={12} color={colors.systemGreen} />
          <Text style={styles.seeders}>{torrent.seeders.toLocaleString()}</Text>
          <Text style={styles.slash}>/</Text>
          <Ionicons name="arrow-down" size={12} color={colors.systemRed} />
          <Text style={styles.leechers}>{torrent.leechers.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 12,
    lineHeight: 22,
  },
  sourceBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sourceText: {
    color: colors.systemBlue,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dot: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeders: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.systemGreen,
    marginLeft: 2,
  },
  slash: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 4,
  },
  leechers: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.systemRed,
    marginLeft: 2,
  },
});
