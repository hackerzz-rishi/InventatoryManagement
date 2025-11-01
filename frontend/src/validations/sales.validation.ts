import { object, string, number, array, InferType } from 'yup';

export const salesFormSchema = object({
  customer_id: number()
    .required('Customer is required')
    .min(1, 'Please select a customer'),
  invoice_number: string()
    .required('Invoice number is required')
    .max(50, 'Invoice number is too long'),
  invoice_date: string()
    .required('Invoice date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  total_amount: number()
    .required('Total amount is required')
    .min(0, 'Total amount cannot be negative'),
  gst_amount: number()
    .required('GST amount is required')
    .min(0, 'GST amount cannot be negative'),
  net_amount: number()
    .required('Net amount is required')
    .min(0, 'Net amount cannot be negative'),
  notes: string()
    .optional()
    .max(500, 'Notes cannot exceed 500 characters'),
  details: array()
    .of(
      object({
        product_id: number()
          .required('Product is required')
          .min(1, 'Please select a product'),
        quantity: number()
          .required('Quantity is required')
          .min(0.01, 'Quantity must be greater than 0'),
        unit_price: number()
          .required('Unit price is required')
          .min(0, 'Unit price cannot be negative'),
        gst_rate: number()
          .required('GST rate is required')
          .min(0, 'GST rate cannot be negative')
          .max(100, 'GST rate cannot exceed 100%'),
      })
    )
    .min(1, 'At least one product is required'),
});

export type SalesFormSchema = InferType<typeof salesFormSchema>;