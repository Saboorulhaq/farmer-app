import CheckIcon from '@/components/icons/CheckIcon';
import CrossIcon from '@/components/icons/CrossIcon';
import ExclamationCircleIcon from '@/components/icons/ExclamationCircleIcon';
import InfoCircleIcon from '@/components/icons/InfoCircleIcon';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ToastConfigParams } from 'toastify-react-native/utils/interfaces';
import Typography from '../typography';
import { styles } from './index.styled';

export const toastConfig = {
  error: (props: ToastConfigParams) => (
    <View style={styles.errorToast}>
      <View>
        <ExclamationCircleIcon />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && (
          <Typography style={styles.message}>{props.text2}</Typography>
        )}
      </View>
      <TouchableOpacity onPress={props.hide}>
        <CrossIcon />
      </TouchableOpacity>
    </View>
  ),
  success: (props: ToastConfigParams) => (
    <View style={styles.successToast}>
      <View
        style={{
          width: 30,
          height: 30,
          borderWidth: 2,
          borderColor: 'green',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
        }}
      >
        <CheckIcon color="green" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && (
          <Typography style={styles.message}>{props.text2}</Typography>
        )}
      </View>
      <TouchableOpacity onPress={props.hide}>
        <CrossIcon />
      </TouchableOpacity>
    </View>
  ),
  info: (props: ToastConfigParams) => (
    <View style={styles.infoToast}>
      <View
        style={{
          width: 30,
          height: 30,
          borderWidth: 2,
          borderColor: '#3B82F6',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
        }}
      >
        <InfoCircleIcon color="#3B82F6" width={18} height={18} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && (
          <Typography style={styles.message}>{props.text2}</Typography>
        )}
      </View>
      <TouchableOpacity onPress={props.hide}>
        <CrossIcon />
      </TouchableOpacity>
    </View>
  ),
};

const UIToast = () => null;

export default UIToast;
