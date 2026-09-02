import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography, UIContainedButton } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import BankBuildingIcon from '@/components/icons/BankBuildingIcon';
import { axiosPrivate } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UIPicker from '@/components/ui/picker';

// Regex rules matching API spec
const ACCOUNT_NUMBER_REGEX = /^\d{8,20}$/;
// Branch code: exactly 6 digits
const BRANCH_CODE_REGEX = /^\d{6}$/;
// Account holder name: alphabetic + spaces only
const ACCOUNT_HOLDER_NAME_REGEX = /^[a-zA-Z\s]+$/;

const BANK_OPTIONS = [
  { label: 'Bank of Punjab', value: 'Bank of Punjab' },
  { label: 'AlBarka Bank', value: 'AlBarka Bank' },
  { label: 'Allied Bank', value: 'Allied Bank' },
  { label: 'Sindh Bank', value: 'Sindh Bank' },
  { label: 'Meezan Bank', value: 'Meezan Bank' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Savings', value: 'savings' },
  { label: 'Current', value: 'current' },
  { label: 'Checking', value: 'checking' },
  { label: 'Business', value: 'business' },
];

type BankAccount = {
  id: string;
  attributes: {
    account_category: 'bank_account' | 'momo_account';
    bank_name?: string;
    account_number?: string;
    account_holder_name?: string;
    account_type?: string;
    branch_code?: string;
    is_primary?: boolean;
  };
};

type FormField = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
};

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconBox}>
        <BankBuildingIcon size={14} color="#FFFFFF" />
      </View>
      <UITypography variant="semiBold" style={s.sectionHeaderText}>
        {title}
      </UITypography>
    </View>
  );
}

const FormInput = React.memo(function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  keyboardType = 'default',
  error,
  autoCapitalize = 'sentences',
  maxLength,
  multiline,
}: FormField) {
  return (
    <View style={s.fieldGroup}>
      <UITypography variant="medium" style={s.fieldLabel}>
        {label} <UITypography style={s.requiredStar}>*</UITypography>
      </UITypography>
      <TextInput
        style={[s.fieldInput, !!error && s.fieldInputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        multiline={multiline}
        scrollEnabled={!multiline}
      />
      <View style={[s.divider, !!error && s.dividerError]} />
      {!!error && (
        <UITypography style={s.errorText}>{error}</UITypography>
      )}
    </View>
  );
});

function PickerField({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
  error,
}: {
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  error?: string;
}) {
  return (
    <View style={s.fieldGroup}>
      <UIPicker
        label={label}
        requiredLabel
        labelStyles={s.fieldLabel}
        options={options}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        error={!!error}
        helperText={error}
      />
    </View>
  );
}

export default function BankDetailsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankAccountId, setBankAccountId] = useState<string | null>(null);

  const [bankName, setBankName] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [branchCode, setBranchCode] = useState('');

  type Errors = {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    accountType?: string;
    branchCode?: string;
  };
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof Errors): string | undefined => {
    switch (field) {
      case 'bankName':
        return !bankName ? 'Please select a bank.' : undefined;
      case 'accountNumber':
        if (!bankName) return undefined;
        if (!accountNumber.trim() || !ACCOUNT_NUMBER_REGEX.test(accountNumber.trim()))
          return 'Enter a valid account number.';
        return undefined;
      case 'accountHolderName':
        if (!bankName) return undefined;
        if (!accountHolderName.trim())
          return 'Enter valid account holder name.';
        if (accountHolderName.trim().length > 256)
          return 'Account name must not exceed 256 characters.';
        if (!ACCOUNT_HOLDER_NAME_REGEX.test(accountHolderName.trim()))
          return 'Enter valid account holder name.';
        return undefined;
      case 'accountType':
        if (!bankName) return undefined;
        return !accountType ? 'Select an account type.' : undefined;
      case 'branchCode':
        if (!bankName) return undefined;
        if (!branchCode.trim() || !BRANCH_CODE_REGEX.test(branchCode.trim()))
          return 'Enter a valid branch code.';
        return undefined;
      default:
        return undefined;
    }
  };

  const blurField = (field: keyof Errors) => {
    setErrors(prev => ({ ...prev, [field]: validateField(field) }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {
      bankName: validateField('bankName'),
      accountNumber: validateField('accountNumber'),
      accountHolderName: validateField('accountHolderName'),
      accountType: validateField('accountType'),
      branchCode: validateField('branchCode'),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const isFormIncomplete =
    !bankName ||
    !accountNumber.trim() ||
    !accountHolderName.trim() ||
    !accountType ||
    !branchCode.trim() ||
    !ACCOUNT_NUMBER_REGEX.test(accountNumber.trim()) ||
    !ACCOUNT_HOLDER_NAME_REGEX.test(accountHolderName.trim()) ||
    !BRANCH_CODE_REGEX.test(branchCode.trim());

  const fetchBankAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get('/user_bank_accounts');
      const accounts: BankAccount[] = res.data?.data || [];

      const bankAcc = accounts.find(
        a => a.attributes.account_category === 'bank_account',
      );

      if (bankAcc) {
        setBankAccountId(bankAcc.id);
        setBankName(bankAcc.attributes.bank_name || null);
        setAccountNumber(bankAcc.attributes.account_number || '');
        setAccountHolderName(bankAcc.attributes.account_holder_name || '');
        setAccountType(bankAcc.attributes.account_type || null);
        setBranchCode(bankAcc.attributes.branch_code || '');
      }
    } catch (error: any) {
      if (!error?.__handledGlobally) {
        Toast.error('Failed to load bank details');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload: any = {
        data: {
          bank_details: {
            bank_name: bankName,
            account_number: accountNumber.trim(),
            account_holder_name: accountHolderName.trim(),
            account_type: accountType,
            branch_code: branchCode.trim().toUpperCase(),
            is_primary: true,
          },
        },
      };

      if (bankAccountId) {
        payload.data.bank_details.id = bankAccountId;
      }

      await axiosPrivate.put('/user_bank_accounts/bulk_upsert', payload);
      Toast.success('Bank details updated successfully');
      navigation.goBack();
    } catch (error: any) {
      if (!error?.__handledGlobally) {
        const msg =
          error?.response?.data?.errors?.join(', ') ||
          error?.response?.data?.message ||
          'Failed to update bank details. Please try again.';
        Toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: top }]}>
        <LoanScreenHeader
          title="My Bank Account"
          onBack={() => navigation.goBack()}
          containerStyle={s.header}
          titleStyle={s.headerTitle}
        />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color="#099453" />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="My Bank Account"
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <UITypography variant="medium" style={s.subtitle}>
          Provide details of your bank account(s) for fund disbursement
        </UITypography>

        {/* Bank Details Card */}
        <View style={s.card}>
          <SectionHeader title="Bank Details" />

          <PickerField
            label="Bank Name"
            placeholder="Select your bank"
            options={BANK_OPTIONS}
            selectedValue={bankName}
            onValueChange={v => { setBankName(v); v ? clearError('bankName') : setErrors(prev => ({ ...prev, bankName: 'Please select a bank.' })); }}
            error={errors.bankName}
          />

          <FormInput
            label="Account Number"
            placeholder="1234567890"
            value={accountNumber}
            onChangeText={t => { setAccountNumber(t); clearError('accountNumber'); }}
            onBlur={() => blurField('accountNumber')}
            keyboardType="numeric"
            maxLength={20}
            error={errors.accountNumber}
          />

          <FormInput
            label="Account Holder Name"
            placeholder="John Doe"
            value={accountHolderName}
            onChangeText={t => { setAccountHolderName(t); clearError('accountHolderName'); }}
            onBlur={() => blurField('accountHolderName')}
            error={errors.accountHolderName}
            maxLength={256}
          />

          <PickerField
            label="Account Type"
            placeholder="Select account type"
            options={ACCOUNT_TYPE_OPTIONS}
            selectedValue={accountType}
            onValueChange={v => { setAccountType(v); v ? clearError('accountType') : setErrors(prev => ({ ...prev, accountType: 'Select an account type.' })); }}
            error={errors.accountType}
          />

          <FormInput
            label="Branch Code"
            placeholder="123456"
            value={branchCode}
            onChangeText={t => { setBranchCode(t); clearError('branchCode'); }}
            onBlur={() => blurField('branchCode')}
            keyboardType="numeric"
            maxLength={6}
            error={errors.branchCode}
          />
        </View>

        <View style={s.updateButtonWrapper}>
          <UIContainedButton
            onPress={handleUpdate}
            loading={saving}
            disabled={isFormIncomplete || hasErrors}
            size="large"
            key={isFormIncomplete || hasErrors ? 'disabled' : 'enabled'}
          >
            Update
          </UIContainedButton>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#404040',
    lineHeight: 22,
    letterSpacing: 0.1,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 20,
    shadowColor: '#6D6D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#1D3A70',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionHeaderText: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
  },
  requiredStar: {
    fontSize: 13,
    color: '#F32735',
    lineHeight: 20,
  },
  fieldInput: {
    fontSize: 14,
    color: '#101010',
    lineHeight: 22,
    paddingVertical: 0,
    fontFamily: 'Poppins-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 12,
  },
  dividerError: {
    backgroundColor: '#F32735',
  },
  fieldInputError: {
    color: '#F32735',
  },
  errorText: {
    fontSize: 11,
    color: '#F32735',
    lineHeight: 16,
    marginTop: 4,
  },
  updateButtonWrapper: {
    marginTop: 12,
  },
});
