import React from 'react';
import TestRenderer from 'react-test-renderer';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const UserDetailsSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  issue_date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use format YYYY-MM-DD', excludeEmptyString: true })
    .optional(),
  expiry_date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use format YYYY-MM-DD', excludeEmptyString: true })
    .test('expiry-after-issue', 'Expiry date must be later than the card issue date', function (value) {
      if (!value) return true;
      const issueDate = this.parent.issue_date;
      if (!issueDate) return true;
      return value > issueDate;
    })
    .optional(),
});

const initialValues = {
  name: 'John',
  ghana_card_number: '',
  phone_number: '',
  email: '',
  residential_address: '',
  issue_date: '2024-01-15',
  expiry_date: '',
  full_name_native: '',
  parent_or_spouse_name: '',
  parent_or_spouse_name_native: '',
  present_address_native: '',
  present_address_romanized: '',
  permanent_address_native: '',
  permanent_address_romanized: '',
  pin: '',
  confirm_pin: '',
};

function createFormik() {
  let formik;
  const Harness = () => {
    formik = useFormik({
      initialValues,
      validationSchema: UserDetailsSchema,
      validateOnMount: true,
      validateOnChange: true,
      enableReinitialize: true,
      onSubmit: async () => {},
    });
    return null;
  };
  return { Harness, getFormik: () => formik };
}

test('expiry error triggers immediately when touched then value are set in same event', async () => {
  const { Harness, getFormik } = createFormik();
  await TestRenderer.act(async () => {
    TestRenderer.create(<Harness />);
  });

  await TestRenderer.act(async () => {
    getFormik().setFieldTouched('expiry_date', true);
    getFormik().setFieldValue('expiry_date', '2024-01-15');
  });

  expect(getFormik().errors.expiry_date).toBe(
    'Expiry date must be later than the card issue date',
  );
  expect(getFormik().touched.expiry_date).toBe(true);
});

test('expiry error clears when a later date is selected', async () => {
  const { Harness, getFormik } = createFormik();
  await TestRenderer.act(async () => {
    TestRenderer.create(<Harness />);
  });

  await TestRenderer.act(async () => {
    getFormik().setFieldTouched('expiry_date', true);
    getFormik().setFieldValue('expiry_date', '2024-01-15');
  });
  await TestRenderer.act(async () => {
    getFormik().setFieldValue('expiry_date', '2025-06-01');
  });

  expect(getFormik().errors.expiry_date).toBeUndefined();
});