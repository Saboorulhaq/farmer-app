import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf';
import UploadButton from '../upload-button';
import CheckIcon from '../../icons/CheckIconSquare';
import DownloadIcon from '../../icons/DownloadIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import {
  pick,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { axiosDocumentsPrivate } from '@/config/axios';

export interface DocumentInfo {
  documentId: string;
  documentType: string;
  documentName: string;
  fileName: string;
  fileType: string;
  s3Key?: string;
  uploadUrl?: string;
  uri?: string;
  size?: number;
}

export interface DocumentApiEndpoints {
  create_presigned_url: {
    method: string;
    endpoint: string;
    description?: string;
  };
  list_documents: {
    method: string;
    endpoint: string;
    description?: string;
  };
  get_document: {
    method: string;
    endpoint: string;
    description?: string;
  };
  delete_document: {
    method: string;
    endpoint: string;
    description?: string;
  };
}

interface DocumentUploadProps {
  label: string;
  fieldKey: string;
  documentType: string;
  apiEndpoints: DocumentApiEndpoints;
  value?: DocumentInfo | null;
  onChange: (document: DocumentInfo | null) => void;
  isRequired?: boolean;
  allowedTypes?: string[];
  maxSizeMB?: number;
  productSubmissionId?: string;
  isDisabled?: boolean;
  style?: any;
  error?: string | null;
}

// Map field_key to document type for API
const getDocumentTypeFromFieldKey = (fieldKey: string): string => {
  const typeMap: Record<string, string> = {
    farm_ownership_lease_document: 'farm_ownership_lease',
    buyer_offtaker_agreement: 'buyer_agreement_commitment',
    previous_loan_statement: 'previous_loan_statement',
  };
  return typeMap[fieldKey] || fieldKey;
};

export default function DocumentUpload({
  label,
  fieldKey,
  documentType,
  apiEndpoints,
  value = null,
  onChange,
  isRequired = false,
  allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
  ],
  maxSizeMB = 10,
  productSubmissionId,
  isDisabled = false,
  style,
  error: externalError,
}: DocumentUploadProps) {
  // Sanitize value: Remove local file URIs from documents loaded from API
  // Local URIs (content://, file://) are platform-specific and may not exist
  // The file is on S3, so we don't need the local URI
  const sanitizedValue = useMemo(() => {
    if (!value || !value.uri) return value;
    
    // Check if URI is a local file URI (platform-specific, temporary)
    const isLocalFileUri = value.uri.startsWith('content://') || 
                          value.uri.startsWith('file://') ||
                          value.uri.startsWith('ph://') ||
                          value.uri.startsWith('assets-library://');
    
    if (isLocalFileUri) {
      // Return value without URI
      const { uri, ...valueWithoutUri } = value;
      return valueWithoutUri;
    }
    
    return value;
  }, [value, fieldKey]);
  
  // Use sanitized value instead of raw value
  const effectiveValue = sanitizedValue;

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  // State to indicate an upload is being retried after a failure
  const [isRetrying, setIsRetrying] = useState(false);
  // Number of failed upload attempts so far (for UI feedback)
  const [retryCount, setRetryCount] = useState(0);
  
  // Ref to track the current XHR request for aborting
  const currentXhrRef = useRef<XMLHttpRequest | null>(null);
  // Ref to track the current AbortController for fetch cancellation
  const currentAbortControllerRef = useRef<AbortController | null>(null);
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Ref to cancel an in-progress retry loop (e.g. when deleting or unmounting)
  const uploadCancelledRef = useRef(false);
  
  // Cleanup on unmount - abort any ongoing requests
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      uploadCancelledRef.current = true;
      if (currentXhrRef.current) {
        currentXhrRef.current.abort();
        currentXhrRef.current = null;
      }
      if (currentAbortControllerRef.current) {
        currentAbortControllerRef.current.abort();
        currentAbortControllerRef.current = null;
      }
    };
  }, []);

  // Prioritize internal error (client-side validation) over external error (backend validation)
  // This ensures validation errors (file size, file type) are displayed immediately
  const displayError = internalError || externalError || null;
  const setError = setInternalError;

  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.svg'];

  // Characters that are not allowed in filenames
  const invalidFilenameChars = /[<>:"/\\|?*\x00-\x1F]/g;
  const maxFilenameLength = 200;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Sanitize filename by removing invalid characters
  const sanitizeFilename = (
    filename: string,
  ): { sanitized: string; wasModified: boolean } => {
    let sanitized = filename.replace(invalidFilenameChars, '_');

    // Truncate if too long (keep extension)
    if (sanitized.length > maxFilenameLength) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized =
        nameWithoutExt.substring(0, maxFilenameLength - ext.length) + ext;
    }

    return {
      sanitized,
      wasModified: sanitized !== filename,
    };
  };

  // Check if file appears to be corrupt/unreadable
  const isFileReadable = (file: { size?: number; uri?: string }): boolean => {
    // A file with 0 bytes is likely corrupt or unreadable
    if (file.size === 0) {
      return false;
    }
    // Check if URI exists
    if (!file.uri) {
      return false;
    }
    return true;
  };

  const validateFile = (file: {
    name?: string;
    fileName?: string;
    type?: string;
    size?: number;
  }): string | null => {
    const fileName = file.name || file.fileName || '';
    const fileSize = file.size || 0;
    const mimeType = (file.type || '').toLowerCase();

    // Check file size - with specific error message
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return `File is too large. Maximum size is ${maxSizeMB} MB.`;
    }

    // Check file type - with specific error message
    // First check by MIME type (exact match)
    const normalizedAllowedTypes = allowedTypes.map(t => t.toLowerCase());
    const normalizedMimeType = mimeType.toLowerCase();
    const isMimeAllowed = normalizedAllowedTypes.includes(normalizedMimeType);
    
    // Then check by file extension (more reliable for files without proper MIME types)
    const lowerFileName = fileName.toLowerCase();
    const isExtAllowed = allowedExtensions.some(ext =>
      lowerFileName.endsWith(ext.toLowerCase())
    );

    // If neither MIME type nor extension is allowed, reject the file
    if (!isMimeAllowed && !isExtAllowed) {
      return 'This file type is not supported. Please upload PDF, PNG, JPG, or SVG.';
    }

    // Check for invalid filename characters
    if (invalidFilenameChars.test(fileName)) {
      // We'll sanitize instead of rejecting, but warn if sanitization fails
      const { sanitized } = sanitizeFilename(fileName);
      if (!sanitized || sanitized === '_') {
        return 'File name contains unsupported characters. Please rename the file and try again.';
      }
    }

    return null;
  };

  const getCleanEndpoint = (endpoint: string): string => {
    // axiosDocumentsPrivate already has the configured base URL, so keep endpoint path as-is.
    return endpoint;
  };

  const handleUpload = async () => {
    // Prevent upload while delete is in progress
    if (isDeleting) {
      console.log('Upload blocked: delete operation in progress');
      return;
    }
    
    try {
      setError(null);
      setIsUploading(true);
      // Reset cancellation flag for a fresh upload session
      uploadCancelledRef.current = false;
      setIsRetrying(false);
      setRetryCount(0);

      // If there's an existing document, delete it first before uploading new one
      if (effectiveValue?.documentId) {
        try {
          const deleteEndpoint = getCleanEndpoint(
            apiEndpoints.delete_document.endpoint.replace(
              ':id',
              effectiveValue.documentId,
            ),
          );
          console.log(
            'Deleting existing document before re-upload:',
            deleteEndpoint,
          );
          await axiosDocumentsPrivate.delete(deleteEndpoint);
          console.log('Existing document deleted successfully');
          // Add a small delay after deletion to ensure server-side cleanup is complete
          await new Promise(resolve => setTimeout(() => resolve(undefined), 200));
        } catch (deleteErr: any) {
          console.warn(
            'Failed to delete existing document:',
            deleteErr.message,
          );
          // Continue with upload even if delete fails
        }
      }

      // Pick document - handle permission errors
      let doc;
      try {
        const [pickedDoc] = await pick({});
        doc = pickedDoc;
      } catch (pickError: any) {
        // Handle specific permission/access errors
        if (isErrorWithCode(pickError)) {
          if (pickError.code === errorCodes.UNABLE_TO_OPEN_FILE_TYPE) {
            setError(
              'We could not read this file. Please try a different file.',
            );
            setIsUploading(false);
            return;
          }
          if (pickError.code === errorCodes.IN_PROGRESS) {
            // Another picker is already open, just return
            setIsUploading(false);
            return;
          }
          if (pickError.code === errorCodes.OPERATION_CANCELED) {
            // User cancelled, just return
            setIsUploading(false);
            return;
          }
        }
        // Check for permission-related errors
        const errorMessage = pickError?.message?.toLowerCase() || '';
        if (
          errorMessage.includes('permission') ||
          errorMessage.includes('access denied')
        ) {
          setError(
            'Storage access is required. Please grant permission in your device settings.',
          );
          setIsUploading(false);
          return;
        }
        // Re-throw for generic error handling
        throw pickError;
      }

      if (!doc) {
        setIsUploading(false);
        return;
      }

      let fileName = doc.name ?? 'document';
      const fileSize = typeof doc.size === 'number' ? doc.size : 0;
      const mimeType = (doc as any).type || 'application/octet-stream';
      const fileUri = (doc as any).fileCopyUri ?? doc.uri;

      // Check if file is readable/corrupt
      if (!isFileReadable({ size: fileSize, uri: fileUri })) {
        setError('We could not read this file. Please try a different file.');
        setIsUploading(false);
        return;
      }

      // Sanitize filename if it contains invalid characters
      const { sanitized: sanitizedFileName, wasModified } =
        sanitizeFilename(fileName);
      if (wasModified) {
        console.log(
          `Filename sanitized: "${fileName}" -> "${sanitizedFileName}"`,
        );
        fileName = sanitizedFileName;
      }

      // Validate file
      const validationError = validateFile({
        name: fileName,
        size: fileSize,
        type: mimeType,
      });

      if (validationError) {
        console.log('File validation failed:', validationError, { fileName, mimeType, fileSize });
        setError(validationError);
        setIsUploading(false);
        return;
      }

      // Step 1: Get presigned URL from API
      const presignedEndpoint = getCleanEndpoint(
        apiEndpoints.create_presigned_url.endpoint,
      );

      console.log('Getting presigned URL from:', presignedEndpoint);

      const presignedResponse = await axiosDocumentsPrivate.post(
        presignedEndpoint,
        {
          documentType: getDocumentTypeFromFieldKey(fieldKey),
          documentName: label,
          fileName: fileName,
          fileType: mimeType,
          ...(productSubmissionId && { productSubmissionId }),
        },
      );

      console.log('Presigned URL response:', presignedResponse.data);

      if (
        !presignedResponse.data?.success ||
        !presignedResponse.data?.data?.uploadUrl
      ) {
        throw new Error('Failed to get upload URL');
      }

      const {
        uploadUrl,
        s3Key,
        documentId,
        documentType: docType,
        documentName,
      } = presignedResponse.data.data;

      // Step 2: Upload file to S3 using presigned URL
      // Log file URI details for debugging
      const isContentUri = fileUri.startsWith('content://');
      const isFileUri = fileUri.startsWith('file://');
      console.log('Uploading file to S3...', { 
        fileUri: fileUri.substring(0, 100) + '...', // Truncate for logging
        mimeType, 
        fileName,
        fileSize,
        uriType: isContentUri ? 'content://' : isFileUri ? 'file://' : 'other',
      });

      // Abort any existing requests before starting a new one
      if (currentXhrRef.current) {
        console.log('Aborting previous XHR request...');
        currentXhrRef.current.abort();
        currentXhrRef.current = null;
      }
      if (currentAbortControllerRef.current) {
        console.log('Aborting previous fetch request...');
        currentAbortControllerRef.current.abort();
        currentAbortControllerRef.current = null;
      }
      // Small delay to ensure previous requests are fully cleaned up
      await new Promise(resolve => setTimeout(() => resolve(undefined), 150));

      // Helper function to upload using fetch (more reliable for file URIs on Android)
      const uploadWithFetch = async (): Promise<boolean> => {
        console.log('Attempting upload with fetch...');
        
        // Create AbortController for this fetch request
        const abortController = new AbortController();
        currentAbortControllerRef.current = abortController;
        
        // Create a file object for fetch - React Native's fetch can handle file URIs
        const fileObject = {
          uri: fileUri,
          type: mimeType,
          name: fileName,
        };
        
        try {
          const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': mimeType,
            },
            body: fileObject as any,
            signal: abortController.signal,
          });
          
          console.log('Fetch upload response status:', response.status);
          currentAbortControllerRef.current = null;
          
          if (response.ok) {
            return true;
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
          }
        } catch (fetchErr: any) {
          currentAbortControllerRef.current = null;
          if (fetchErr.name === 'AbortError') {
            throw new Error('Upload was cancelled');
          }
          throw fetchErr;
        }
      };

      // Helper function to upload using XHR (fallback)
      const uploadWithXHR = (): Promise<boolean> => {
        console.log('Attempting upload with XHR...');
        
        return new Promise<boolean>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          currentXhrRef.current = xhr;
          
          // Set timeout for the upload (60 seconds)
          xhr.timeout = 60000;
          
          // Track if this request was aborted
          let wasAborted = false;

          xhr.onload = () => {
            console.log('XHR upload response status:', xhr.status);
            currentXhrRef.current = null;
            if (!isMountedRef.current) {
              reject(new Error('Component unmounted during upload'));
              return;
            }
            if (xhr.status === 200) {
              resolve(true);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
          };

          xhr.onerror = (event) => {
            console.log('XHR error event:', JSON.stringify(event));
            console.log('XHR readyState:', xhr.readyState);
            console.log('XHR status:', xhr.status);
            currentXhrRef.current = null;
            if (wasAborted) {
              reject(new Error('Upload was cancelled'));
            } else {
              reject(new Error('Network request failed during upload'));
            }
          };

          xhr.ontimeout = () => {
            console.log('XHR timeout');
            currentXhrRef.current = null;
            reject(new Error('Upload request timed out. Please try again.'));
          };
          
          xhr.onabort = () => {
            console.log('XHR aborted');
            wasAborted = true;
            currentXhrRef.current = null;
            reject(new Error('Upload was cancelled'));
          };

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', mimeType);

          // For S3 presigned URLs, we need to send the file directly, not as FormData
          // On React Native, we can pass the file object directly
          xhr.send({
            uri: fileUri,
            type: mimeType,
            name: fileName,
          } as any);
        });
      };

      // Perform a single S3 upload attempt: try fetch first (more reliable on
      // Android), then fall back to XHR. Throws on cancellation/abort so the
      // retry loop can stop, and throws on failure so it can retry.
      const attemptUpload = async (): Promise<boolean> => {
        try {
          return await uploadWithFetch();
        } catch (fetchError: any) {
          // Stop retrying immediately if the upload was cancelled/aborted
          if (
            fetchError?.name === 'AbortError' ||
            fetchError?.message?.toLowerCase().includes('cancelled')
          ) {
            throw fetchError;
          }
          console.log('Fetch upload failed, trying XHR:', fetchError.message);
          try {
            return await uploadWithXHR();
          } catch (xhrError: any) {
            console.log('XHR upload also failed:', xhrError.message);
            throw new Error(
              `Upload failed. Please try again. (${fetchError.message})`,
            );
          }
        }
      };

      // Retry loop: if the S3 upload fails, wait 1 second and retry again,
      // repeating until the upload succeeds (or is cancelled/unmounted).
      const RETRY_DELAY_MS = 1000;
      let uploadSuccess = false;
      let attempt = 0;

      while (true) {
        // Stop if the component unmounted or the upload was cancelled
        // (e.g. via delete). This also breaks out of a retry wait.
        if (!isMountedRef.current || uploadCancelledRef.current) {
          console.log('S3 upload retry stopped (unmounted or cancelled)');
          break;
        }

        attempt += 1;

        try {
          uploadSuccess = await attemptUpload();
          if (uploadSuccess) {
            console.log(`S3 upload succeeded on attempt ${attempt}`);
            break;
          }
        } catch (attemptErr: any) {
          const attemptMsg = attemptErr?.message || '';
          // Abort/cancel should not be retried
          if (
            attemptErr?.name === 'AbortError' ||
            attemptMsg.toLowerCase().includes('cancelled') ||
            attemptMsg.toLowerCase().includes('aborted')
          ) {
            console.log('S3 upload was cancelled/aborted, stopping retry');
            break;
          }
          // Transient failure: log and continue to the retry wait below
          console.warn(
            `S3 upload attempt ${attempt} failed: ${attemptMsg}. ` +
              `Retrying in ${RETRY_DELAY_MS}ms...`,
          );
        }

        if (uploadSuccess) break;

        // Surface a retrying state so the UI can inform the user
        if (isMountedRef.current && !uploadCancelledRef.current) {
          setIsRetrying(true);
          setRetryCount(attempt);
        }

        // Wait 1 second before the next attempt (cancellation is checked at
        // the top of the loop, so this waits at most RETRY_DELAY_MS).
        await new Promise((resolve) =>
          setTimeout(() => resolve(undefined), RETRY_DELAY_MS),
        );
      }

      // Clear the retrying UI state
      setIsRetrying(false);
      setRetryCount(0);

      // If we stopped because of cancellation/unmount, don't treat it as a
      // hard error and don't continue to the success path.
      if (!isMountedRef.current || uploadCancelledRef.current) {
        setIsUploading(false);
        return;
      }

      if (!uploadSuccess) {
        throw new Error('Failed to upload file to storage');
      }

      // Step 3: Update state with uploaded document info
      // IMPORTANT: Do NOT store the local file URI after upload to S3.
      // The file is now on S3, and the local URI may be:
      // - Platform-specific (content:// on Android, file:// on iOS)
      // - Pointing to a temp file that no longer exists
      // - Incompatible when loading on a different platform
      // If we need to display the image, we should fetch a view URL from the API using documentId.
      const uploadedDocument: DocumentInfo = {
        documentId,
        documentType: docType,
        documentName,
        fileName,
        fileType: mimeType,
        s3Key,
        // uri: fileUri, // REMOVED: Don't store local URI after S3 upload
        size: fileSize,
      };

      console.log('Document uploaded successfully:', uploadedDocument);
      onChange(uploadedDocument);
      setError(null);
    } catch (err: any) {
      console.log('Document upload error:', err);
      
      // Don't show error for intentional cancellations or unmounts
      const errorMessage = err?.message || '';
      if (
        errorMessage.includes('cancelled') ||
        errorMessage.includes('unmounted') ||
        errorMessage.includes('aborted')
      ) {
        console.log('Upload was cancelled/aborted, not showing error');
        return;
      }
      
      // Don't update state if component is unmounted
      if (!isMountedRef.current) {
        return;
      }
      
      // Log detailed error info from API response
      if (err.response) {
        console.log(
          'API Error Response:',
          JSON.stringify(
            {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            },
            null,
            2,
          ),
        );
        const apiMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data);
        setError(apiMessage || 'Failed to upload document. Please try again.');
      } else {
        setError(err.message || 'Failed to upload document. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
        setIsRetrying(false);
        setRetryCount(0);
      }
    }
  };

  // Perform the actual delete operation
  const performDelete = async () => {
    if (!effectiveValue?.documentId) {
      onChange(null);
      return;
    }

    try {
      // Abort any ongoing upload before deleting
      if (currentXhrRef.current) {
        console.log('Aborting ongoing XHR upload before delete...');
        currentXhrRef.current.abort();
        currentXhrRef.current = null;
      }
      if (currentAbortControllerRef.current) {
        console.log('Aborting ongoing fetch upload before delete...');
        currentAbortControllerRef.current.abort();
        currentAbortControllerRef.current = null;
      }
      // Cancel any in-progress S3 upload retry loop
      uploadCancelledRef.current = true;
      setIsRetrying(false);
      setRetryCount(0);
      
      setIsDeleting(true);
      setError(null);

      const deleteEndpoint = getCleanEndpoint(
        apiEndpoints.delete_document.endpoint.replace(':id', effectiveValue.documentId),
      );

      console.log('Deleting document:', deleteEndpoint);

      await axiosDocumentsPrivate.delete(deleteEndpoint);

      console.log('Document deleted successfully');
      
      // Small delay to ensure server-side cleanup is complete before allowing re-upload
      await new Promise(resolve => setTimeout(() => resolve(undefined), 200));
      
      if (isMountedRef.current) {
        onChange(null);
        // Show success feedback
        Alert.alert('Success', 'Document removed.');
      }
    } catch (err: any) {
      console.log('Document delete error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to delete document. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  };

  // Show confirmation popup before deleting
  const handleDelete = () => {
    if (!effectiveValue?.documentId) {
      onChange(null);
      return;
    }

    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ],
      { cancelable: true },
    );
  };

  const handleDownload = async () => {
    if (!effectiveValue?.documentId) return;

    try {
      setIsDownloading(true);
      setError(null);

      const getEndpoint = getCleanEndpoint(
        apiEndpoints.get_document.endpoint.replace(':id', effectiveValue.documentId),
      );

      console.log('Getting document:', getEndpoint);

      const response = await axiosDocumentsPrivate.get(getEndpoint);

      console.log('Document info:', response.data);

      // If response contains a view URL, open it
      if (response.data?.data?.viewUrl) {
        const viewUrl = response.data.data.viewUrl;
        console.log('View URL:', viewUrl);

        // Open the view URL
        const canOpen = await Linking.canOpenURL(viewUrl);
        if (canOpen) {
          await Linking.openURL(viewUrl);
        } else {
          setError('Cannot open document URL');
        }
      } else {
        setError('No view URL found in response');
      }
    } catch (err: any) {
      console.log('Document download error:', err);
      setError(err.message || 'Failed to download document.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to check if file is an image (including SVG - try to render with Image component)
  const isImage = (fileType: string): boolean => {
    const lowerType = fileType?.toLowerCase() || '';
    return lowerType.includes('image') || 
           lowerType.includes('jpeg') ||
           lowerType.includes('jpg') ||
           lowerType.includes('png') ||
           lowerType.includes('svg');
  };

  // Helper to check if file is a PDF
  const isPDF = (fileType: string): boolean => {
    return fileType?.toLowerCase().includes('pdf');
  };

  // Helper to check if URI is valid for the current platform
  const isValidUriForPlatform = (uri: string | undefined): boolean => {
    if (!uri) return false;
    
    // On iOS, Android content URIs won't work
    if (Platform.OS === 'ios') {
      // iOS supports file://, ph:// (Photos), and http/https URLs
      // Reject Android content:// URIs
      if (uri.startsWith('content://')) {
        return false;
      }
    }
    
    // On Android, both content:// and file:// work
    // Basic validation - URI should start with a valid scheme
    const validSchemes = ['file://', 'content://', 'http://', 'https://', 'ph://', 'assets-library://'];
    return validSchemes.some(scheme => uri.startsWith(scheme));
  };

  // State to track image loading errors
  const [imageError, setImageError] = useState(false);
  // State to store preview URL for uploaded images
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  // Ref to track which documentId we've fetched preview for
  const fetchedPreviewForDocumentId = useRef<string | null>(null);

  // Reset image error and preview URL when document value changes
  useEffect(() => {
    setImageError(false);
    setPreviewUrl(null);
    fetchedPreviewForDocumentId.current = null;
  }, [effectiveValue?.documentId, (effectiveValue as DocumentInfo)?.uri]);

  // Fetch preview URL for uploaded images, SVG files, and PDF files (when no local URI exists)
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      const documentId = effectiveValue?.documentId;
      
      // Only fetch if:
      // 1. Document exists and has an ID
      // 2. It's an image file (jpg, png, jpeg, svg) or PDF
      // 3. No local URI exists (document was uploaded to S3)
      // 4. We haven't already fetched for this documentId
      if (!effectiveValue) {
        return;
      }
      const documentUri = (effectiveValue as DocumentInfo)?.uri;
      const fileType = effectiveValue.fileType || '';
      const isImageOrPdf = isImage(fileType) || isPDF(fileType);
      if (
        !documentId ||
        !isImageOrPdf ||
        documentUri ||
        fetchedPreviewForDocumentId.current === documentId ||
        isLoadingPreview
      ) {
        return;
      }

      try {
        setIsLoadingPreview(true);
        fetchedPreviewForDocumentId.current = documentId;
        
        const getEndpoint = getCleanEndpoint(
          apiEndpoints.get_document.endpoint.replace(':id', documentId),
        );

        const response = await axiosDocumentsPrivate.get(getEndpoint);

        if (response.data?.data?.viewUrl) {
          setPreviewUrl(response.data.data.viewUrl);
        }
      } catch (err: any) {
        console.log('Failed to fetch preview URL:', err);
        // Reset the ref so we can retry if needed
        fetchedPreviewForDocumentId.current = null;
        // Don't set error state - preview is optional
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreviewUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveValue?.documentId, effectiveValue?.fileType, (effectiveValue as DocumentInfo)?.uri]);


  // Render uploaded file state
  if (effectiveValue?.documentId) {
    const fileType = effectiveValue.fileType || '';
    const isSVGFile = fileType.toLowerCase().includes('svg');
    const isImageFile = isImage(fileType) && !isSVGFile; // Exclude SVG from image preview
    const showPDFIcon = isPDF(fileType);
    
    // Show image preview if:
    // 1. It's an image file (jpg, png, jpeg)
    // 2. Either has a local URI (just uploaded) OR has a fetched preview URL (uploaded to S3)
    const documentUri = (effectiveValue as DocumentInfo)?.uri;
    const hasLocalUri = documentUri && isValidUriForPlatform(documentUri);
    const hasPreviewUrl = previewUrl && !imageError;
    const showImagePreview = isImageFile && (hasLocalUri || hasPreviewUrl);
    
    // Show SVG preview if:
    // 1. It's an SVG file
    // 2. Either has a local URI (just uploaded) OR has a fetched preview URL (uploaded to S3)
    const showSVGPreview = isSVGFile && (hasLocalUri || hasPreviewUrl);
    
    // Show PDF preview if:
    // 1. It's a PDF file
    // 2. Either has a local URI (just uploaded) OR has a fetched preview URL (uploaded to S3)
    const showPDFPreview = showPDFIcon && (hasLocalUri || hasPreviewUrl);
    
    // Determine which URI to use for preview
    const imageUri = hasLocalUri ? documentUri : previewUrl;
    const svgUri = hasLocalUri ? documentUri : previewUrl;
    const pdfUri = hasLocalUri ? documentUri : previewUrl;

    return (
      <View style={[styles.wrapper, style]}>
        {/* File preview thumbnail */}
        {showImagePreview && imageUri && (
          <View style={styles.previewContainer}>
            {isLoadingPreview ? (
              <View style={styles.previewLoadingContainer}>
                <ActivityIndicator size="small" color="#099453" />
              </View>
            ) : (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.previewImage}
                resizeMode="cover"
                onError={() => {
                  console.warn('Failed to load image preview:', imageUri);
                  setImageError(true);
                }}
              />
            )}
          </View>
        )}
        {showSVGPreview && svgUri && (
          <View style={styles.previewContainer}>
            {isLoadingPreview ? (
              <View style={styles.previewLoadingContainer}>
                <ActivityIndicator size="small" color="#099453" />
              </View>
            ) : (
              <WebView
                source={{ uri: svgUri }}
                style={[styles.previewImage, styles.webViewPreview]}
                scalesPageToFit={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                backgroundColor="transparent"
                onError={() => {
                  console.warn('Failed to load SVG preview:', svgUri);
                  setImageError(true);
                }}
                onHttpError={() => {
                  console.warn('HTTP error loading SVG preview:', svgUri);
                  setImageError(true);
                }}
              />
            )}
          </View>
        )}
        {isSVGFile && !showSVGPreview && (
          <View style={styles.previewContainer}>
            <View style={styles.svgIconContainer}>
              <Text style={styles.svgIconText}>SVG</Text>
            </View>
          </View>
        )}
        {showPDFPreview && pdfUri && (
          <View style={styles.previewContainer}>
            {isLoadingPreview ? (
              <View style={styles.previewLoadingContainer}>
                <ActivityIndicator size="small" color="#099453" />
              </View>
            ) : (
              <Pdf
                source={{ uri: pdfUri, cache: true }}
                trustAllCerts={false}
                onError={(error) => {
                  console.warn('Failed to load PDF preview:', error);
                  setImageError(true);
                }}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`PDF loaded: ${numberOfPages} pages`);
                }}
                style={styles.pdfPreview}
                enablePaging={true}
                horizontal={false}
                minScale={1.0}
                maxScale={3.0}
                scale={1.0}
                spacing={10}
                fitPolicy={0}
                enableAntialiasing={true}
                enableAnnotationRendering={true}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`Current page: ${page}/${numberOfPages}`);
                }}
              />
            )}
          </View>
        )}
        {showPDFIcon && !showPDFPreview && (
          <View style={styles.previewContainer}>
            <View style={styles.pdfIconContainer}>
              <Text style={styles.pdfIconText}>PDF</Text>
            </View>
          </View>
        )}
        
        {/* File info and actions */}
        <View style={[styles.container, styles.fileContainer]}>
          <View style={styles.leftSection}>
            <CheckIcon size={18} color="white" />
            <View style={styles.fileInfo}>
              <Text style={[styles.label, styles.fileName]} numberOfLines={1}>
                {label}
              </Text>
              {effectiveValue.fileName && (
                <Text style={styles.fileNameSecondary} numberOfLines={1}>
                  {effectiveValue.fileName}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            {isDownloading ? (
              <ActivityIndicator
                size="small"
                color="#099453"
                style={styles.iconButton}
              />
            ) : (
              <TouchableOpacity
                onPress={handleDownload}
                style={styles.iconButton}
                disabled={isDownloading || isDisabled}
              >
                <DownloadIcon
                  width={14}
                  height={15}
                  color={isDownloading || isDisabled ? '#E8E8E8' : '#C2B7C9'}
                />
              </TouchableOpacity>
            )}
            {isDeleting ? (
              <ActivityIndicator
                size="small"
                color="#E53935"
                style={styles.iconButton}
              />
            ) : (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.iconButton}
                disabled={isDeleting || isDisabled}
              >
                <DeleteIcon
                  width={13}
                  height={16}
                  color={isDeleting || isDisabled ? '#E8E8E8' : '#C2B7C9'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {displayError && <Text style={styles.errorText}>{displayError}</Text>}
      </View>
    );
  }

  // Render upload state
  return (
    <View style={[styles.container, styles.defaultContainer, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {displayError && <Text style={styles.errorText}>{displayError}</Text>}
      </View>
      {isUploading ? (
        <ActivityIndicator size="small" color="#099453" />
      ) : (
        <UploadButton onPress={handleUpload} disabled={isDisabled} />
      )}
      {isRetrying && (
        <Text style={styles.retryText}>
          Upload failed. Retrying… (attempt {retryCount + 1})
        </Text>
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
    gap: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#1D3A70',
    flex: 1,
  },
  fileName: {
    color: '#1D3A70',
  },
  fileNameSecondary: {
    fontSize: 12,
    color: '#898A8D',
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  retryText: {
    color: '#099453',
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  webViewPreview: {
    backgroundColor: 'transparent',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  previewLoadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  pdfIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  pdfIconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E53935',
  },
  svgIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  svgIconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1D3A70',
  },
});
