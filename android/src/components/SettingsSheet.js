import React, { forwardRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

export const SettingsSheet = forwardRef(({ colors, onClose }, ref) => {
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
      snapPoints={['60%']}
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
          <Text style={styles.sectionTitle}>ACTIVE SOURCES</Text>
          <View style={styles.group}>
            {sources.map((s, i) => (
              <View key={s.name} style={[styles.row, i === sources.length - 1 && styles.noBorder]}>
                <View style={styles.rowLeft}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.systemGreen} />
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  group: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
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
    fontSize: 17,
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  legalSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  legalText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
