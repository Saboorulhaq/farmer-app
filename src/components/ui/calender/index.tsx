import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import Typography from '@/components/ui/typography';
import CalendarIcon from '@/components/icons/CalendarIcon';

/**
 * CalendarPicker
 * - Supports single date or range selection
 * - Designed to be used inline in UITextInput via pickerAddonProps.type === 'calendar'
 * - Tap the month/year header to open a year list + month grid for fast navigation
 */

export type CalendarSelectionValue = string | null | { from: string; to: string | null };

interface CalendarPickerProps {
  selectedValue: CalendarSelectionValue;
  onValueChange: (value: CalendarSelectionValue) => void;
  placeholder?: string;
  inline?: boolean;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  selectionMode?: 'single' | 'range';
  style?: any;
  error?: boolean;
  helperText?: string;
  onClose?: () => void;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedValue,
  onValueChange,
  placeholder = 'Select date',
  inline = false,
  minDate = '1900-01-01',
  maxDate,
  selectionMode = 'single',
  style,
  error = false,
  helperText = '',
  onClose,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  // 'calendar' = normal date grid, 'yearMonth' = year list + month grid
  const [pickerMode, setPickerMode] = useState<'calendar' | 'yearMonth'>('calendar');

  const today = useMemo(() => {
    const d = new Date();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${d.getFullYear()}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
  }, []);

  const effectiveMaxDate = maxDate || today;
  const minYear = parseInt(minDate.split('-')[0], 10);
  const maxYear = parseInt(effectiveMaxDate.split('-')[0], 10);

  // Track which month the Calendar is displaying
  const initDisplayDate = () => {
    if (selectedValue && typeof selectedValue === 'string') return selectedValue;
    if (selectedValue && typeof selectedValue === 'object' && (selectedValue as any).from) {
      return (selectedValue as any).from;
    }
    return today;
  };
  const [currentDisplayDate, setCurrentDisplayDate] = useState<string>(initDisplayDate);

  // Temp year selection inside the yearMonth picker
  const [tempYear, setTempYear] = useState<number>(
    parseInt(currentDisplayDate.split('-')[0], 10),
  );

  const yearListRef = useRef<FlatList<number>>(null);

  const years = useMemo<number[]>(() => {
    const arr: number[] = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [minYear, maxYear]);

  const currentDisplayYear = parseInt(currentDisplayDate.split('-')[0], 10);
  const currentDisplayMonthIdx = parseInt(currentDisplayDate.split('-')[1], 10) - 1;

  const openYearMonthPicker = () => {
    const yr = parseInt(currentDisplayDate.split('-')[0], 10);
    setTempYear(yr);
    setPickerMode('yearMonth');
    setTimeout(() => {
      const idx = years.indexOf(yr);
      if (idx !== -1 && yearListRef.current) {
        yearListRef.current.scrollToIndex({
          index: idx,
          animated: false,
          viewPosition: 0.5,
        });
      }
    }, 80);
  };

  const handleMonthSelect = (monthIdx: number) => {
    const m = monthIdx + 1;
    const newDate = `${tempYear}-${m < 10 ? '0' + m : m}-01`;
    setCurrentDisplayDate(newDate);
    setPickerMode('calendar');
  };

  const selectedLabel = useMemo(() => {
    if (!selectedValue) return placeholder;
    if (typeof selectedValue === 'string') {
      return moment(selectedValue).format('DD/MM/YYYY');
    }
    if ((selectedValue as any)?.from && (selectedValue as any)?.to) {
      return `${moment((selectedValue as any).from).format('DD MMM')} – ${moment(
        (selectedValue as any).to,
      ).format('DD MMM')}`;
    }
    if ((selectedValue as any)?.from) {
      return moment((selectedValue as any).from).format('DD/MM/YYYY');
    }
    return placeholder;
  }, [selectedValue, placeholder]);

  const buildRangeMarks = (start: string, end: string) => {
    const result: Record<string, any> = {};
    const startMoment = moment(start);
    const endMoment = moment(end);

    if (startMoment.isSame(endMoment, 'day')) {
      result[start] = { startingDay: true, endingDay: true, color: '#0064ff', textColor: 'white' };
      return result;
    }

    let cursor = startMoment.clone();
    result[start] = { startingDay: true, color: '#0064ff', textColor: 'white' };

    while (cursor.isBefore(endMoment, 'day')) {
      cursor.add(1, 'day');
      const key = cursor.format('YYYY-MM-DD');
      if (cursor.isSame(endMoment, 'day')) {
        result[key] = { endingDay: true, color: '#0064ff', textColor: 'white' };
      } else {
        result[key] = { color: '#e2f0ff', textColor: 'black' };
      }
    }
    return result;
  };

  const onDayPress = (day: any) => {
    const dateString = day.dateString;

    if (selectionMode === 'single') {
      setMarkedDates({ [dateString]: { selected: true, selectedColor: '#0064ff' } });
      onValueChange(dateString);
      return;
    }

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateString);
      setRangeEnd(null);
      setMarkedDates({
        [dateString]: { startingDay: true, endingDay: true, color: '#0064ff', textColor: 'white' },
      });
      return;
    }

    const start = rangeStart;
    const startMoment = moment(start);
    const endMoment = moment(dateString);

    if (endMoment.isBefore(startMoment, 'day')) {
      setRangeStart(dateString);
      setRangeEnd(start);
      setMarkedDates(buildRangeMarks(dateString, start));
    } else {
      setRangeEnd(dateString);
      setMarkedDates(buildRangeMarks(start, dateString));
    }
  };

  const handleConfirm = () => {
    if (selectionMode === 'single') {
      setModalVisible(false);
      Keyboard.dismiss();
      onClose?.();
      return;
    }
    if (rangeStart && rangeEnd) {
      onValueChange({ from: rangeStart, to: rangeEnd });
    } else if (rangeStart && !rangeEnd) {
      onValueChange({ from: rangeStart, to: null });
    }
    setModalVisible(false);
    Keyboard.dismiss();
    onClose?.();
  };

  const handleClearOrCancel = () => {
    setPickerMode('calendar');
    setModalVisible(false);
    Keyboard.dismiss();
    onClose?.();
  };

  // Custom header for the Calendar — tapping it opens the year/month picker
  const renderCalendarHeader = (date: any) => {
    const label = moment(date.toString()).format('MMMM YYYY');
    return (
      <TouchableOpacity onPress={openYearMonthPicker} style={styles.calendarHeaderBtn}>
        <Typography variant="semiBold" style={styles.calendarHeaderText}>
          {label} ▾
        </Typography>
      </TouchableOpacity>
    );
  };

  const renderYearMonthPicker = () => (
    <View style={styles.ymContainer}>
      <TouchableOpacity onPress={() => setPickerMode('calendar')} style={styles.ymBackRow}>
        <Typography variant="semiBold" style={styles.ymBackText}>← Back</Typography>
      </TouchableOpacity>
      <Typography variant="semiBold" style={styles.ymSectionLabel}>
        Select Year
      </Typography>
      <FlatList
        ref={yearListRef}
        data={years}
        keyExtractor={item => String(item)}
        style={styles.yearList}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item: year }) => {
          const isSelected = year === tempYear;
          return (
            <TouchableOpacity
              style={[styles.yearItem, isSelected && styles.yearItemSelected]}
              onPress={() => setTempYear(year)}
            >
              <Typography
                variant={isSelected ? 'semiBold' : 'regular'}
                style={[styles.yearItemText, isSelected && styles.yearItemTextSelected]}
              >
                {year}
              </Typography>
            </TouchableOpacity>
          );
        }}
      />
      <Typography variant="semiBold" style={styles.ymSectionLabel}>
        Select Month
      </Typography>
      <View style={styles.monthGrid}>
        {MONTH_LABELS.map((m, idx) => {
          const isSelected =
            idx === currentDisplayMonthIdx && tempYear === currentDisplayYear;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.monthItem, isSelected && styles.monthItemSelected]}
              onPress={() => handleMonthSelect(idx)}
            >
              <Typography
                variant={isSelected ? 'semiBold' : 'regular'}
                style={[styles.monthItemText, isSelected && styles.monthItemTextSelected]}
              >
                {m}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      {pickerMode === 'yearMonth' ? (
        renderYearMonthPicker()
      ) : (
        <>
          <Typography variant="semiBold" style={styles.modalTitle}>
            {selectionMode === 'single' ? 'SELECT DATE' : 'SELECT DATE RANGE'}
          </Typography>
          <Calendar
            key={currentDisplayDate}
            current={currentDisplayDate}
            hideExtraDays={false}
            markingType={selectionMode === 'range' ? 'period' : undefined}
            maxDate={effectiveMaxDate}
            minDate={minDate}
            firstDay={1}
            onDayPress={onDayPress}
            markedDates={markedDates}
            onMonthChange={(month: any) => setCurrentDisplayDate(month.dateString)}
            renderHeader={renderCalendarHeader}
            theme={{
              textDayFontWeight: '400',
              arrowColor: '#9b9b9b',
              textSectionTitleColor: '#010101',
              textDayHeaderFontSize: 14,
              monthTextColor: '#000000',
              textMonthFontWeight: 'bold',
            }}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClearOrCancel}>
              <Typography variant="regular" style={styles.cancelText}>Cancel</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Typography variant="regular" style={styles.confirmText}>Update</Typography>
            </TouchableOpacity>
          </View>
          {error && helperText ? (
            <Typography variant="regular" style={{ color: '#D32F2F', marginTop: 8 }}>
              {helperText}
            </Typography>
          ) : null}
        </>
      )}
    </View>
  );

  const openModal = () => {
    Keyboard.dismiss();
    try {
      const state: any = (RNTextInput as any).State;
      const node = state?.currentlyFocusedInput?.();
      state?.blurTextInput?.(node);
    } catch {}
    setPickerMode('calendar');
    setModalVisible(true);
  };

  if (inline) {
    return (
      <Pressable
        style={[
          styles.inlineTrigger,
          style,
          error && { borderBottomColor: '#D32F2F', borderBottomWidth: 2 },
        ]}
        onPress={openModal}
      >
        <Typography
          variant="semiBold"
          style={[styles.inlineSelectedValue, !selectedValue && styles.inlinePlaceholder]}
        >
          {selectedLabel}
        </Typography>
        <View style={styles.inlineChevronButton}>
          <CalendarIcon color="#616161" />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            onClose?.();
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              onClose?.();
            }}
          >
            {renderModalContent()}
          </TouchableOpacity>
        </Modal>
      </Pressable>
    );
  }

  // Non-inline variant
  return (
    <View>
      <Pressable onPress={openModal} style={{ paddingVertical: 12 }}>
        <Typography variant="semiBold">{selectedLabel}</Typography>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          onClose?.();
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            onClose?.();
          }}
        >
          {renderModalContent()}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Inline trigger ──────────────────────────────────────────────────────────
  inlineTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    minWidth: 50,
    gap: 6,
  },
  inlineSelectedValue: {
    fontSize: 14,
    color: '#101010',
    fontFamily: 'Poppins-Medium',
    marginRight: 4,
  },
  inlinePlaceholder: {
    color: '#EDEDED',
  },
  inlineChevronButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Modal shell ─────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 10,
  },
  // ── Calendar header (tappable month/year label) ─────────────────────────────
  calendarHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  calendarHeaderText: {
    fontSize: 16,
    color: '#101010',
  },
  // ── Bottom action row ───────────────────────────────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0064ff',
  },
  cancelText: {
    color: '#1E1E20',
  },
  confirmText: {
    color: '#FFFFFF',
  },
  // ── Year / Month picker ─────────────────────────────────────────────────────
  ymContainer: {
    // no flex:1 — parent modalContent has no explicit height (only maxHeight)
    // so flex children collapse to zero; let content size itself naturally
  },
  ymBackRow: {
    marginBottom: 12,
  },
  ymBackText: {
    fontSize: 14,
    color: '#0064ff',
  },
  ymSectionLabel: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 6,
    marginTop: 4,
  },
  yearList: {
    height: 176, // explicit height required for FlatList (VirtualizedList needs a bounded container)
    marginBottom: 8,
  },
  yearItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  yearItemSelected: {
    backgroundColor: '#0064ff',
  },
  yearItemText: {
    fontSize: 16,
    color: '#101010',
  },
  yearItemTextSelected: {
    color: '#ffffff',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  monthItem: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  monthItemSelected: {
    backgroundColor: '#0064ff',
  },
  monthItemText: {
    fontSize: 14,
    color: '#101010',
  },
  monthItemTextSelected: {
    color: '#ffffff',
  },
});

export default CalendarPicker;

