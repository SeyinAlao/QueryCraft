
import type { Schema } from '@/types/query'

export const SCHEMAS: Schema[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'Customer and user account data',
    fields: [
      {
        key: 'name',
        label: 'Full Name',
        type: 'string',
        description: 'The user\'s full name',
      },
      {
        key: 'email',
        label: 'Email Address',
        type: 'string',
        description: 'Primary email address',
      },
      {
        key: 'age',
        label: 'Age',
        type: 'number',
        description: 'User age in years',
      },
      {
        key: 'country',
        label: 'Country',
        type: 'enum',
        enumOptions: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia', 'United States', 'United Kingdom', 'Canada', 'Germany'],
        description: 'Country of residence',
      },
      {
        key: 'status',
        label: 'Account Status',
        type: 'enum',
        enumOptions: ['active', 'inactive', 'suspended', 'pending'],
        description: 'Current account status',
      },
      {
        key: 'purchases',
        label: 'Total Purchases',
        type: 'number',
        description: 'Number of completed purchases',
      },
      {
        key: 'createdAt',
        label: 'Created At',
        type: 'date',
        description: 'Account creation date',
      },
      {
        key: 'verified',
        label: 'Email Verified',
        type: 'boolean',
        description: 'Whether the email has been verified',
      },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Purchase orders and transaction data',
    fields: [
      {
        key: 'orderId',
        label: 'Order ID',
        type: 'string',
      },
      {
        key: 'customerName',
        label: 'Customer Name',
        type: 'string',
      },
      {
        key: 'amount',
        label: 'Order Amount',
        type: 'number',
        description: 'Total order value in USD',
      },
      {
        key: 'status',
        label: 'Order Status',
        type: 'enum',
        enumOptions: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      },
      {
        key: 'paymentMethod',
        label: 'Payment Method',
        type: 'enum',
        enumOptions: ['card', 'bank_transfer', 'crypto', 'paypal', 'cash'],
      },
      {
        key: 'itemCount',
        label: 'Item Count',
        type: 'number',
        description: 'Number of items in the order',
      },
      {
        key: 'createdAt',
        label: 'Order Date',
        type: 'date',
      },
      {
        key: 'isPriority',
        label: 'Priority Order',
        type: 'boolean',
      },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Product catalogue and inventory data',
    fields: [
      {
        key: 'name',
        label: 'Product Name',
        type: 'string',
      },
      {
        key: 'category',
        label: 'Category',
        type: 'enum',
        enumOptions: ['Electronics', 'Clothing', 'Food & Beverage', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Automotive'],
      },
      {
        key: 'price',
        label: 'Price',
        type: 'number',
        description: 'Price in USD',
      },
      {
        key: 'stock',
        label: 'Stock Count',
        type: 'number',
        description: 'Units currently in stock',
      },
      {
        key: 'rating',
        label: 'Average Rating',
        type: 'number',
        description: 'Customer rating out of 5',
      },
      {
        key: 'inStock',
        label: 'In Stock',
        type: 'boolean',
      },
      {
        key: 'createdAt',
        label: 'Listed Date',
        type: 'date',
      },
      {
        key: 'sku',
        label: 'SKU',
        type: 'string',
        description: 'Stock keeping unit identifier',
      },
    ],
  },
]

export const SCHEMA_MAP = Object.fromEntries(
  SCHEMAS.map(schema => [schema.id, schema])
) as Record<string, Schema>

export function getSchemaField(schemaId: string, fieldKey: string) {
  return SCHEMA_MAP[schemaId]?.fields.find(f => f.key === fieldKey)
}
