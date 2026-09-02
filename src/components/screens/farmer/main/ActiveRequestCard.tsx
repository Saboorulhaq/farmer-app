import React from 'react';
import { View, Pressable } from 'react-native';
import { styles } from './ActiveRequestCard.styled';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import DeleteIcon from '@/components/icons/DeleteIcon';

interface ActiveRequestCardProps {
  status: string;
  loanAmount: string;
  loanDuration: string;
  loanType: string;
  farmNumber: string;
  loanTypeLabel?: string; // Dynamic label (e.g., "Transaction Type", "Loan Type", "Volume")
  farmNumberLabel?: string;
  rejectionNote?: string | null;
  onComplete?: () => void;
  onDelete?: () => void;
  onViewRequest?: () => void;
}

export default function ActiveRequestCard({
  status,
  loanAmount,
  loanDuration,
  loanType,
  farmNumber,
  loanTypeLabel = 'Loan Type',
  farmNumberLabel = 'Farm Number',
  rejectionNote,
  onComplete,
  onDelete,
  onViewRequest,
}: ActiveRequestCardProps) {
  // Show "View Request" button for "Submitted", "Rejected", and "Approved" statuses
  const isSubmitted = status === 'Submitted' || status === 'Rejected' || status === 'Approved';
  // If there's a rejection note, show "Rejected" instead of the original status
  const displayStatus = rejectionNote ? 'Rejected' : status;

  const isApproved = displayStatus === 'Approved';
  const isRejected = displayStatus === 'Rejected';

  return (
    <View style={styles.card}>
      <View style={[
        styles.statusTag, 
        isApproved && styles.statusTagApproved,
        isRejected && styles.statusTagRejected
      ]}>
        <UITypography variant="medium" style={[
          styles.statusTagText, 
          isApproved && styles.statusTagTextApproved,
          isRejected && styles.statusTagTextRejected
        ]}>
          {displayStatus}
        </UITypography>
      </View>

      <UITypography variant="semiBold" style={styles.loanAmount}>
        {loanAmount}
      </UITypography>

      <UITypography variant="regular" style={styles.loanDuration}>
        {loanDuration}
      </UITypography>

      <View style={styles.detailsGrid}>
        <View style={styles.detailColumn}>
          <UITypography variant="regular" style={styles.detailLabel}>
            {loanTypeLabel}
          </UITypography>
          <UITypography variant="semiBold" style={styles.detailValue}>
            {loanType}
          </UITypography>
        </View>
        <View style={styles.detailColumn}>
          <UITypography variant="regular" style={styles.detailLabel}>
            {farmNumberLabel}
          </UITypography>
          <UITypography variant="semiBold" style={styles.detailValue}>
            {farmNumber}
          </UITypography>
        </View>
      </View>

      {isSubmitted ? (
        <View style={styles.viewRequestContainer}>
          <UIContainedButton
            onPress={onViewRequest || (() => {})}
            style={styles.viewRequestButton}
          >
            View Request
          </UIContainedButton>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <View style={styles.completeButtonContainer}>
            <UIContainedButton
              onPress={onComplete || (() => {})}
              style={styles.completeButton}
            >
              Complete Request
            </UIContainedButton>
          </View>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <UITypography variant="medium" style={styles.deleteButtonText}>
              Delete
            </UITypography>
            <DeleteIcon width={13} height={16} color="#101010" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

