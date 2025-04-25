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
  const serviceId = 'service_5cab3lf';
  const templateId = 'template_5memb9k';
  const publicKey = 'aOIQKlmQa3fhR3cYN';

  let email = userEmail;

  if (!email || !validateEmail(email)) {
    try {
      const storedUserData = localStorage.getItem("useralldata");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData?.Email && validateEmail(userData.Email)) {
          email = userData.Email;
        }
      }
    } catch (error) {
      console.error("Error parsing useralldata:", error);
    }
  }

  if (!email || !validateEmail(email)) {
    email = "brokiller91@gmail.com"; // fallback for testing
  }

  // Format each item as a "sub-object" for EmailJS dynamic rendering
  const formattedItems = orderItems.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    total_price: item.totalPrice.toLocaleString('hu-HU'),
    image_url: item.product.imageUrl || 'https://example.com/default-product-image.jpg'
  }));

  const templateParams = {
    order_id: orderId,
    orders: formattedItems, // this is now an array
    to_name: userName,
    email: email,
    userEmail: email,
    order_date: new Date(orderDate).toLocaleDateString(),
    delivery_address: deliveryAddress || 'Address not provided',
    cost: totalAmount.toLocaleString('hu-HU', {
      style: 'currency',
      currency: 'HUF',
    })
  };

  console.log('Sending confirmation email to:', email);
  console.log('Email parameters:', templateParams);

  return emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then((response) => {
      console.log('Order confirmation email sent successfully', response);
    })
    .catch((error) => {
      console.error('Failed to send order confirmation email:', error);
      throw error;
    });
};

function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
