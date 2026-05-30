
export const MOCK_USERS = [
  { name: 'Seyin Alao', email: 'seyin@gmail.com', age: 28, country: 'Nigeria', status: 'active', purchases: 14, createdAt: '2023-03-12', verified: true },
  { name: 'Kwame Mensah', email: 'kwame@example.com', age: 34, country: 'Ghana', status: 'active', purchases: 7, createdAt: '2022-11-05', verified: true },
  { name: 'Fatima Al-Rashid', email: 'fatima@example.com', age: 22, country: 'Egypt', status: 'pending', purchases: 0, createdAt: '2024-01-20', verified: false },
  { name: 'Chidi Eze', email: 'chidi@example.com', age: 41, country: 'Nigeria', status: 'active', purchases: 32, createdAt: '2021-07-18', verified: true },
  { name: 'Aisha Kamara', email: 'aisha@example.com', age: 19, country: 'Kenya', status: 'active', purchases: 3, createdAt: '2024-02-14', verified: true },
  { name: 'David Osei', email: 'david@example.com', age: 16, country: 'Ghana', status: 'inactive', purchases: 0, createdAt: '2024-03-01', verified: false },
  { name: 'Ngozi Adeyemi', email: 'ngozi@example.com', age: 29, country: 'Nigeria', status: 'active', purchases: 21, createdAt: '2022-08-30', verified: true },
  { name: 'Omar Hassan', email: 'omar@example.com', age: 37, country: 'Ethiopia', status: 'suspended', purchases: 5, createdAt: '2021-12-09', verified: true },
  { name: 'Blessing Nwosu', email: 'blessing@example.com', age: 25, country: 'Nigeria', status: 'active', purchases: 11, createdAt: '2023-06-22', verified: true },
  { name: 'Kofi Asante', email: 'kofi@example.com', age: 31, country: 'Ghana', status: 'active', purchases: 18, createdAt: '2022-04-17', verified: true },
  { name: 'Zara Diallo', email: 'zara@example.com', age: 24, country: 'South Africa', status: 'active', purchases: 6, createdAt: '2023-09-11', verified: false },
  { name: 'Emmanuel Otieno', email: 'emmanuel@example.com', age: 45, country: 'Kenya', status: 'inactive', purchases: 42, createdAt: '2020-05-23', verified: true },
  { name: 'Nkechi Obi', email: 'nkechi@example.com', age: 33, country: 'Nigeria', status: 'active', purchases: 9, createdAt: '2023-01-08', verified: true },
  { name: 'Abebe Girma', email: 'abebe@example.com', age: 27, country: 'Ethiopia', status: 'pending', purchases: 2, createdAt: '2024-04-05', verified: false },
  { name: 'Sarah Mitchell', email: 'sarah@example.com', age: 38, country: 'United Kingdom', status: 'active', purchases: 27, createdAt: '2021-10-14', verified: true },
]

export const MOCK_ORDERS = [
  { orderId: 'ORD-001', customerName: 'Amara Okafor', amount: 245.99, status: 'delivered', paymentMethod: 'card', itemCount: 3, createdAt: '2024-01-15', isPriority: false },
  { orderId: 'ORD-002', customerName: 'Kwame Mensah', amount: 89.50, status: 'shipped', paymentMethod: 'bank_transfer', itemCount: 1, createdAt: '2024-02-20', isPriority: true },
  { orderId: 'ORD-003', customerName: 'Chidi Eze', amount: 1250.00, status: 'processing', paymentMethod: 'card', itemCount: 8, createdAt: '2024-03-01', isPriority: true },
  { orderId: 'ORD-004', customerName: 'Ngozi Adeyemi', amount: 34.99, status: 'pending', paymentMethod: 'paypal', itemCount: 1, createdAt: '2024-03-10', isPriority: false },
  { orderId: 'ORD-005', customerName: 'Blessing Nwosu', amount: 567.00, status: 'delivered', paymentMethod: 'card', itemCount: 4, createdAt: '2024-01-28', isPriority: false },
  { orderId: 'ORD-006', customerName: 'Kofi Asante', amount: 199.99, status: 'cancelled', paymentMethod: 'crypto', itemCount: 2, createdAt: '2024-02-05', isPriority: false },
  { orderId: 'ORD-007', customerName: 'Sarah Mitchell', amount: 3499.00, status: 'delivered', paymentMethod: 'bank_transfer', itemCount: 12, createdAt: '2024-01-05', isPriority: true },
  { orderId: 'ORD-008', customerName: 'Nkechi Obi', amount: 75.00, status: 'refunded', paymentMethod: 'card', itemCount: 1, createdAt: '2024-02-14', isPriority: false },
  { orderId: 'ORD-009', customerName: 'Emmanuel Otieno', amount: 920.50, status: 'shipped', paymentMethod: 'card', itemCount: 5, createdAt: '2024-03-08', isPriority: true },
  { orderId: 'ORD-010', customerName: 'Zara Diallo', amount: 45.00, status: 'pending', paymentMethod: 'cash', itemCount: 1, createdAt: '2024-03-12', isPriority: false },
]

export const MOCK_PRODUCTS = [
  { name: 'MacBook Pro 16"', category: 'Electronics', price: 2499.00, stock: 12, rating: 4.8, inStock: true, createdAt: '2023-11-01', sku: 'ELEC-MBP-001' },
  { name: 'Ankara Print Dress', category: 'Clothing', price: 89.99, stock: 45, rating: 4.5, inStock: true, createdAt: '2023-12-15', sku: 'CLTH-ANK-002' },
  { name: 'Suya Spice Mix', category: 'Food & Beverage', price: 12.99, stock: 0, rating: 4.9, inStock: false, createdAt: '2024-01-10', sku: 'FOOD-SUY-003' },
  { name: 'React Deep Dive', category: 'Books', price: 39.99, stock: 78, rating: 4.7, inStock: true, createdAt: '2023-10-20', sku: 'BOOK-RDD-004' },
  { name: 'Sony WH-1000XM5', category: 'Electronics', price: 349.99, stock: 8, rating: 4.6, inStock: true, createdAt: '2023-09-05', sku: 'ELEC-SNY-005' },
  { name: 'Garden Hoe Set', category: 'Home & Garden', price: 54.99, stock: 23, rating: 4.2, inStock: true, createdAt: '2024-02-01', sku: 'GARD-HOS-006' },
  { name: 'Nike Air Max 270', category: 'Sports', price: 149.99, stock: 0, rating: 4.4, inStock: false, createdAt: '2023-08-18', sku: 'SPRT-NAM-007' },
  { name: 'Shea Butter Cream', category: 'Beauty', price: 24.99, stock: 156, rating: 4.8, inStock: true, createdAt: '2024-01-25', sku: 'BEAU-SBC-008' },
  { name: 'Car Dash Camera', category: 'Automotive', price: 79.99, stock: 34, rating: 4.1, inStock: true, createdAt: '2023-11-30', sku: 'AUTO-CDC-009' },
  { name: 'iPad Pro 12.9"', category: 'Electronics', price: 1099.00, stock: 5, rating: 4.7, inStock: true, createdAt: '2023-10-01', sku: 'ELEC-IPD-010' },
]

export const MOCK_DATA_MAP: Record<string, Record<string, unknown>[]> = {
  users: MOCK_USERS,
  orders: MOCK_ORDERS,
  products: MOCK_PRODUCTS,
}
