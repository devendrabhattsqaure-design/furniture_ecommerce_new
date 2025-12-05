const API_BASE = 'http://localhost:5000/api';

const SHOP_ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ; 

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': SHOP_ORG_ID, 
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};