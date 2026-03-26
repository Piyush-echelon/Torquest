import React, { forwardRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ToastAndroid, Platform } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export const DetailSheet = forwardRef(({ torrent, colors, onClose }, ref) => {
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  const handleOpenMagnet = async () => {
    if (!torrent?.magnet) return;
    try {
      await Linking.openURL(torrent.magnet);
    } catch (e) {
      if (Platform.OS === 'android') {
        ToastAndroid.show("Couldn't open torrent client", ToastAndroid.SHORT);
      }
    }
  };

  const handleCopyMagnet = async () => {
    if (!torrent?.magnet) return;
    await Clipboard.setStringAsync(torrent.magnet);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Link copied to clipboard', ToastAndroid.SHORT);
    }
    onClose();
  };

  if (!torrent) return null;

  const styles = createStyles(colors);

  const dateStr = new Date(parseInt(torrent.added) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['75%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      onChange={(index) => {
        if (index === -1) onClose();
      }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{torrent.title}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Seeds</Text>
            <Text style={[styles.statValue, { color: colors.systemGreen }]}>
              {torrent.seeders?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Peers</Text>
            <Text style={[styles.statValue, { color: colors.systemRed }]}>
              {torrent.leechers?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Size</Text>
            <Text style={styles.statValue}>{torrent.size_str}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Source</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {torrent.source}
            </Text>
          </View>
        </View>

        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{torrent.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Added</Text>
            <Text style={styles.infoValue}>{dateStr}</Text>
          </View>
          <View style={[styles.infoRow, styles.noBorder]}>
            <Text style={styles.infoLabel}>Hash</Text>
            <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
              {torrent.info_hash}
            </Text>
          </View>
        </View>

        {torrent.magnet && (
          <View style={styles.magnetSection}>
            <Text style={styles.magnetLabel}>MAGNET LINK</Text>
            <View style={styles.magnetBox}>
              <Text style={styles.magnetText} numberOfLines={3}>
                {torrent.magnet}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={handleOpenMagnet}>
            <Ionicons name="magnet" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Open Magnet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={handleCopyMagnet}>
            <Ionicons name="copy-outline" size={20} color={colors.systemBlue} />
            <Text style={styles.secondaryBtnText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const createStyles = (colors) => StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.tertiaryBackground,
  },
  handle: {
    backgroundColor: colors.textTertiary,
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
    lineHeight: 26,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.secondaryBackground,
    padding: 12,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoGroup: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  hashValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    maxWidth: '60%',
  },
  magnetSection: {
    marginBottom: 24,
  },
  magnetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  magnetBox: {
    backgroundColor: colors.secondaryBackground,
    padding: 12,
    borderRadius: 10,
  },
  magnetText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
  btn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: colors.systemBlue,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: colors.secondaryBackground,
  },
  secondaryBtnText: {
    color: colors.systemBlue,
    fontSize: 17,
    fontWeight: '600',
  },
});
