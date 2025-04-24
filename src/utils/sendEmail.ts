import emailjs from '@emailjs/browser';
import { OrderItem } from './types';

export const sendOrderConfirmation = (
  userEmail: string,
  orderItems: OrderItem[],
  userName: string,
  orderId: number,
  orderDate: string,
  totalAmount: number,
  deliveryAddress: string,
): Promise<void> => {
  // EmailJS credentials
  const serviceId = 'service_5cab3lf';
  const templateId = 'template_5memb9k';
  const publicKey = 'aOIQKlmQa3fhR3cYN';

  // Try to get email directly from localStorage first (most reliable source)
  let email = userEmail;
  
  // Get from useralldata if passed email is not valid
  if (!email || !validateEmail(email)) {
    try {
      const storedUserData = localStorage.getItem("useralldata");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData && userData.Email && validateEmail(userData.Email)) {
          email = userData.Email;
          console.log("Using email from useralldata:", email);
        }
      }
    } catch (error) {
      console.error("Error parsing useralldata:", error);
    }
  }

  // If still no valid email, use a fallback for testing
  if (!email || !validateEmail(email)) {
    email = "brokiller91@gmail.com"; // Use a fallback email for testing
    console.log("Using fallback email:", email);
  }

  // Format items for email
  const formattedItems = orderItems.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    totalPrice: item.totalPrice,
    imageUrl: item.product.imageUrl
  }));

  // Create a string representation of items for the email
  const ordersText = formattedItems
    .map(item => `${item.name} x${item.quantity} - $${item.totalPrice.toFixed(0)}`)
    .join('\n');

  // Get a sample image URL for the email header if available
  const sampleImageUrl = formattedItems.length > 0 && formattedItems[0].imageUrl 
    ? formattedItems[0].imageUrl 
    : 'https://example.com/default-product-image.jpg';

  // Match EXACTLY the parameter names EmailJS is expecting
  const templateParams = {
    order_id: orderId,
    orders: ordersText,
    image_url: sampleImageUrl,
    to_name: userName || 'Valued Customer',
    units: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
    price: formattedItems.length > 0 ? formattedItems[0].price : 0,
    cost: totalAmount,
    email: email,          // Include both email and userEmail as requested
    userEmail: email,
    order_date: new Date(orderDate).toLocaleDateString(),
    delivery_address: deliveryAddress || 'Address not provided'
  };

  console.log('Sending confirmation email to:', email);
  console.log('Email parameters:', templateParams);

  return emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then((response) => {
      console.log('Order confirmation email sent successfully', response);
    })
    .catch((error) => {
      console.error('Failed to send order confirmation email:', error);
      console.error('Error details:', error.text);
      throw error;
    });
};

// Email validation
function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}


