import React, { forwardRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

export const SettingsSheet = forwardRef(({ colors, onClose, themeMode, onSetTheme }, ref) => {
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

  const sources = [
    { name: 'ThePirateBay', status: 'Active' },
    { name: 'SolidTorrents', status: 'Active' },
    { name: 'YTS', status: 'Active' },
    { name: 'EZTV', status: 'Active' },
    { name: '1337x', status: 'Active' },
  ];

  const styles = createStyles(colors);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['70%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      onChange={(index) => {
        if (index === -1) onClose();
      }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.group}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Theme</Text>
              <View style={styles.themeSelector}>
                {['Light', 'Dark', 'System'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.themeBtn,
                      themeMode === mode.toLowerCase() && styles.themeBtnActive
                    ]}
                    onPress={() => onSetTheme(mode.toLowerCase())}
                  >
                    <Text style={[
                      styles.themeBtnText,
                      themeMode === mode.toLowerCase() && styles.themeBtnTextActive
                    ]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>ACTIVE SOURCES</Text>
          <View style={styles.group}>
            {sources.map((s, i) => (
              <View key={s.name} style={[styles.row, i === sources.length - 1 && styles.noBorder]}>
                <View style={styles.rowLeft}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.systemGreen} />
                  <Text style={styles.rowLabel}>{s.name}</Text>
                </View>
                <Text style={styles.rowValue}>{s.status}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.group}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.1.0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Platform</Text>
              <Text style={styles.rowValue}>React Native</Text>
            </View>
            <View style={[styles.row, styles.noBorder]}>
              <Text style={styles.rowLabel}>Developer</Text>
              <Text style={styles.rowValue}>Torquest Team</Text>
            </View>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalText}>
              Torquest is a search interface only. It does not host content. Users are responsible for complying with local laws.
            </Text>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

const createStyles = (colors) => StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
  },
  handle: {
    backgroundColor: colors.textTertiary,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 20,
  },
  group: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 2,
    borderRadius: 8,
    gap: 2,
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  themeBtnActive: {
    backgroundColor: colors.systemBlue,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  themeBtnTextActive: {
    color: '#fff',
  },
  legalSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  legalText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
