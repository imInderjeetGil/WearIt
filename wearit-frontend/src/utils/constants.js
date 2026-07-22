export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const CATEGORIES = [
  { id: 'men', name: 'Men', image: 'https://images.unsplash.com/photo-1617137968427-8590f7c8c45a?w=600&q=80' },
  { id: 'women', name: 'Women', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80' },
  { id: 'kids', name: 'Kids', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dcfe8?w=600&q=80' },
  { id: 'ethnic', name: 'Ethnic', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80' },
  { id: 'sports', name: 'Sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80' },
]

export const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
  { value: '-name', label: 'Name: Z-A' },
]

export const ORDER_STATUS = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  delivered: 'Delivered',
}
