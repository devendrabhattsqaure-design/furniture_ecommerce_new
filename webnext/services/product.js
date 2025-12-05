const API_BASE = 'http://localhost:5000/api';
const SHOP_ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ;

export const fetchProducts = async (filters = {}) => {
  try {
    const { category_id, min_price, max_price, search, page = 1, limit = 100 } = filters;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category_id && { category_id }),
      ...(min_price && { min_price: min_price.toString() }),
      ...(max_price && { max_price: max_price.toString() }),
      ...(search && { search }),
    });

    const response = await fetch(`${API_BASE}/products?${params}`, {
      headers: {
        'x-org-id': SHOP_ORG_ID, // Add org_id header
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: {
        'x-org-id': SHOP_ORG_ID, // Add org_id header
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};