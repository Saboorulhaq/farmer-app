import ArrowDownIcon from '@/components/icons/ArrowDownIcon';
import React, { useState } from 'react';
import {
  FlatList,
  SectionList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Typography from '../typography';

interface Option {
  label: string;
  value: string;
}

interface UIPickerProps {
  label?: string;
  labelStyles?: any;
  requiredLabel?: boolean;
  options?: Option[];
  sections?: { title: string; data: Option[] }[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  optional?: boolean;
  inline?: boolean;
  onPress?: () => void;
  style?: any;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const UIPicker: React.FC<UIPickerProps> = ({
  label = '',
  labelStyles,
  requiredLabel = false,
  options = [],
  sections,
  selectedValue,
  onValueChange,
  placeholder = 'Please select',
  optional = false,
  inline = false,
  onPress,
  style,
  error = false,
  helperText = '',
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Flatten sections to find the label if sections are used
  const allOptions = sections
    ? sections.flatMap(section => section.data)
    : options;

  const selectedOptionLabel =
    allOptions.find(opt => opt.value === selectedValue)?.label || placeholder;

  const pickerOptions =
    optional && selectedValue !== null
      ? [{ label: 'Clear selection', value: '__clear__' }, ...options]
      : options;

  const handleSelect = (value: string | null) => {
    if (value === '__clear__') {
      onValueChange(null);
    } else {
      onValueChange(value);
    }
    setModalVisible(false);
    Keyboard.dismiss();
  };

  if (inline) {
    return (
      <Pressable
        style={[
          styles.inlinePickerTrigger,
          style,
          error && { borderBottomColor: '#D32F2F', borderBottomWidth: 2 },
          disabled && { backgroundColor: '#F5F5F5', opacity: 0.6 },
        ]}
        onPress={
          onPress
            ? onPress
            : () => {
                if (!disabled) {
                  Keyboard.dismiss();
                  setModalVisible(true);
                }
              }
        }
        disabled={disabled}
        hitSlop={10}
      >
        <Typography
          variant="semiBold"
          style={[
            styles.inlineSelectedValue,
            !selectedValue && styles.inlinePlaceholder,
            disabled && { color: '#999' },
          ]}
        >
          {selectedOptionLabel}
        </Typography>
        {!disabled && <ArrowDownIcon />}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            Keyboard.dismiss();
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              Keyboard.dismiss();
            }}
          >
            <View style={styles.modalContent}>
              <Typography variant="semiBold" style={styles.modalTitle}>
                PLEASE SELECT
              </Typography>
              {sections ? (
                <SectionList
                  sections={sections}
                  keyExtractor={(item, index) => item.value + index}
                  renderItem={({ item, index, section }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        { borderBottomWidth: 1, borderBottomColor: '#EFEFF0' },
                        item.value === '__clear__' && { opacity: 0.7 },
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Typography variant="regular" style={styles.optionText}>
                        {item.label}
                      </Typography>
                      {selectedValue === item.value &&
                        item.value !== '__clear__' && (
                          <View style={styles.selectedDot} />
                        )}
                    </TouchableOpacity>
                  )}
                  renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                      <Typography
                        variant="semiBold"
                        style={styles.sectionHeaderText}
                      >
                        {title}
                      </Typography>
                    </View>
                  )}
                  ListFooterComponent={<View style={{ height: 20 }} />}
                  stickySectionHeadersEnabled={false}
                />
              ) : (
                <FlatList
                  data={pickerOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        pickerOptions.length > 1 &&
                        index !== pickerOptions.length - 1
                          ? {
                              borderBottomWidth: 1,
                              borderBottomColor: '#EFEFF0',
                            }
                          : null,
                        item.value === '__clear__' && { opacity: 0.7 },
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Typography variant="regular" style={styles.optionText}>
                        {item.label}
                      </Typography>
                      {selectedValue === item.value &&
                        item.value !== '__clear__' && (
                          <View style={styles.selectedDot} />
                        )}
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={<View style={{ height: 20 }} />}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>
        {error && helperText ? (
          <Typography
            variant="regular"
            style={{ color: '#D32F2F', marginTop: 4, fontSize: 13 }}
          >
            {helperText}
          </Typography>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          variant="semiBold"
          style={[styles.label, labelStyles]}
          requiredAsterisk={requiredLabel}
          requiredAsteriskStyle={{ color: '#E53935' }}
        >
          {label}
        </Typography>
      )}
      <Pressable
        style={[
          styles.pickerTrigger,
          error && { borderBottomColor: '#E53935', borderBottomWidth: 1 },
          disabled && { backgroundColor: '#F5F5F5', opacity: 0.6 },
        ]}
        onPress={() => {
          if (!disabled) {
            Keyboard.dismiss();
            setModalVisible(true);
          }
        }}
        disabled={disabled}
      >
        <Typography
          variant="semiBold"
          style={[
            styles.selectedValue,
            !selectedValue && styles.placeholderText,
            error && { color: '#E53935' },
            disabled && { color: '#999' },
          ]}
        >
          {selectedOptionLabel}
        </Typography>
        {!disabled && (
          <View
            style={{
              width: 24,
              height: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowDownIcon />
          </View>
        )}
      </Pressable>
      {error && helperText ? (
        <Typography
          variant="regular"
          style={{ color: '#D32F2F', marginTop: 4, fontSize: 13 }}
        >
          {helperText}
        </Typography>
      ) : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          Keyboard.dismiss();
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            Keyboard.dismiss();
          }}
        >
          <View style={styles.modalContent}>
            <Typography variant="semiBold" style={styles.modalTitle}>
              PLEASE SELECT
            </Typography>
            {sections ? (
              <SectionList
                sections={sections}
                keyExtractor={(item, index) => item.value + index}
                renderItem={({ item, index, section }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomWidth: 1, borderBottomColor: '#EFEFF0' },
                      item.value === '__clear__' && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Typography variant="regular" style={styles.optionText}>
                      {item.label}
                    </Typography>
                    {selectedValue === item.value &&
                      item.value !== '__clear__' && (
                        <View style={styles.selectedDot} />
                      )}
                  </TouchableOpacity>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Typography
                      variant="semiBold"
                      style={styles.sectionHeaderText}
                    >
                      {title}
                    </Typography>
                  </View>
                )}
                ListFooterComponent={<View style={{ height: 20 }} />}
                stickySectionHeadersEnabled={false}
              />
            ) : (
              <FlatList
                data={pickerOptions}
                keyExtractor={item => item.value}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      pickerOptions.length > 1 &&
                      index !== pickerOptions.length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: '#EFEFF0' }
                        : null,
                      item.value === '__clear__' && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Typography variant="regular" style={styles.optionText}>
                      {item.label}
                    </Typography>
                    {selectedValue === item.value &&
                      item.value !== '__clear__' && (
                        <View style={styles.selectedDot} />
                      )}
                  </TouchableOpacity>
                )}
                ListFooterComponent={<View style={{ height: 20 }} />}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 22,
  },
  label: {
    fontSize: 12,
    marginTop: 12,
    color: '#8B8B8B',
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingBottom: 8,
  },
  selectedValue: {
    fontSize: 14,
    color: '#404040',
  },
  placeholderText: {
    color: '#B5B5B5',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    maxHeight: '50%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    color: '#1E1E20',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'black',
  },
  inlinePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
    paddingRight: 8,
    justifyContent: 'space-between',
    gap: 6,
  },
  inlineSelectedValue: {
    fontSize: 14,
    color: '#404040',
    marginRight: 4,
  },
  inlinePlaceholder: {
    color: '#EDEDED',
    fontSize: 14,
  },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: '#666',
  },
});

export default UIPicker;
