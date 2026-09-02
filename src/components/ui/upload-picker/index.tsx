import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import UploadButton from '../upload-button';
import CheckIcon from '../../icons/CheckIconSquare';
import DownloadIcon from '../../icons/DownloadIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import { pick } from '@react-native-documents/picker';

export interface FileInfo {
  name: string;
  size: number; // in bytes
  uri?: string;
  type?: string;
}

interface UIUploadPickerProps {
  label?: string;
  file?: FileInfo | null;
  onUpload?: (file: FileInfo) => void;
  onDownload?: (file: FileInfo) => void;
  onDelete?: () => void;
  isUploading?: boolean;
  isDownloading?: boolean;
  isDisabled?: boolean;
  style?: any;
}

export default function UIUploadPicker({
  label = 'Certificate of Incorporation',
  file = null,
  onUpload,
  onDownload,
  onDelete,
  isUploading = false,
  isDownloading = false,
  isDisabled = false,
  style,
}: UIUploadPickerProps) {
  const [internalFile, setInternalFile] = useState<FileInfo | null>(file);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const truncateFileName = (name: string, maxLength: number = 25): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const handleUpload = async () => {
    try {
      const [doc] = await pick({});
      if (!doc) return;

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      const allowedMimeTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/svg+xml',
      ];
      const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.svg'];

      const docSize = typeof doc.size === 'number' ? doc.size : 0;
      if (docSize > MAX_SIZE_BYTES) {
        setError('File exceeds maximum size of 10 MB.');
        return;
      }

      const mimeType = (doc as any).type as string | undefined;
      const fileName = doc.name ?? 'Unnamed file';
      const isMimeAllowed = mimeType
        ? allowedMimeTypes.includes(mimeType)
        : false;
      const isExtAllowed = allowedExtensions.some(ext =>
        fileName.toLowerCase().endsWith(ext),
      );
      if (!isMimeAllowed && !isExtAllowed) {
        setError('Unsupported format. Please upload PDF, PNG, JPG, or SVG.');
        return;
      }

      const selectedFile: FileInfo = {
        name: fileName,
        size: docSize,
        uri: (doc as any).fileCopyUri ?? doc.uri,
        type: mimeType,
      };

      setInternalFile(selectedFile);
      setError(null);
      onUpload?.(selectedFile);
    } catch (error) {
      // User might have cancelled or an error occurred; just noop for now
      console.warn('Document picking cancelled or failed:', error);
    }
  };

  const handleDownload = () => {
    console.log('Downloading file:', internalFile?.name);
    if (internalFile) {
      onDownload?.(internalFile);
    }
  };

  const handleDelete = () => {
    setInternalFile(null);
    setError(null);
    onDelete?.();
  };

  const currentFile = file !== undefined ? file : internalFile;

  if (currentFile) {
    // File present state - show label at top, file info below
    return (
      <View style={[styles.wrapper, style]}>

        <View style={[styles.container, styles.fileContainer]}>
          <View style={styles.leftSection}>
              <CheckIcon size={18} color="white" />
            <Text style={[styles.label,styles.fileName]}>{label}</Text>
          </View>
          <View style={styles.rightSection}>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#099453" style={styles.iconButton} />
            ) : (
              <TouchableOpacity 
                onPress={handleDownload} 
                style={styles.iconButton}
                disabled={isDownloading || isDisabled}
              >
                <DownloadIcon width={14} height={15} color={(isDownloading || isDisabled) ? '#E8E8E8' : '#C2B7C9'} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleDelete} 
              style={styles.iconButton}
              disabled={isDownloading || isDisabled}
            >
              <DeleteIcon width={13} height={16} color={(isDownloading || isDisabled) ? '#E8E8E8' : '#C2B7C9'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Default state - label and upload button on same line
  return (
    <View style={[styles.container, styles.defaultContainer, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      {isUploading ? (
        <ActivityIndicator size="small" color="#099453" />
      ) : (
        <UploadButton onPress={handleUpload} disabled={isDisabled} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  defaultContainer: {
    justifyContent: 'space-between',
  },
  fileContainer: {
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#444444',
    width: '70%',
  },
  fileInfo: {
    marginLeft: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  fileName: {
    color: '#8B8B8B',
    width: '60%',
  },
  fileSize: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0,
    color: '#8B8B8B',
  },
  iconButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 10,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0,
    color: '#D32F2F',
    marginTop: 4,
  },
});
