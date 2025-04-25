import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/backend-conf";
import { Orders } from "../../utils/types";
import "./OrderDetails.css";
import useAuth from "../../hooks/UseAuth";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Orders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { auth } = useAuth(); // Use the custom hook to get the auth token

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        // First check if we have order details in sessionStorage
        const storedOrderData = sessionStorage.getItem("currentOrderDetails");

        if (storedOrderData) {
          console.log("Using stored order data from session");
          const parsedOrder = JSON.parse(storedOrderData);

          // Only use stored data if it matches the requested order ID
          if (parsedOrder && parsedOrder.id.toString() === id) {
            setOrder(parsedOrder);
            setLoading(false);
            return;
          }
        }

        // If no stored data or ID doesn't match, fetch from API
        console.log("Fetching order data from API");
        const response = await fetch(`${BASE_URL}/api/Orders/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load order details (Status: ${response.status})`
          );
        }

        const data = await response.json();

        // Process data to ensure all required fields exist
        const processedOrder = {
          id: data.id || 0,
          orderDate: data.orderDate || new Date().toISOString(),
          totalAmount: data.totalAmount || 0,
          status: data.status || "Pending",
          deliveryAddress: data.deliveryAddress || "",
          // Ensure orderItems exists and has required structure
          orderItems: Array.isArray(data.orderItems)
            ? data.orderItems.map((item: any) => ({
                id: item.id || 0,
                productId: item.productId || "",
                product: item.product
                  ? {
                      id: item.product.id || "",
                      name: item.product.name || "Unknown Product",
                      description: item.product.description || "",
                      price: item.product.price || 0,
                      imageUrl:
                        item.product.imageUrl || "/pizza-placeholder.jpg",
                      isAvailable:
                        typeof item.product.isAvailable === "boolean"
                          ? item.product.isAvailable
                          : true,
                      category: item.product.category || "",
                    }
                  : {
                      id: "",
                      name: "Unknown Product",
                      description: "",
                      price: 0,
                      imageUrl: "/pizza-placeholder.jpg",
                      isAvailable: true,
                      category: item.category || "",
                    },
                quantity: item.quantity || 0,
                price: item.price || 0,
                totalPrice: item.totalPrice || 0,
              }))
            : [],
        };

        // Store this processed order in sessionStorage for future use
        sessionStorage.setItem(
          "currentOrderDetails",
          JSON.stringify(processedOrder)
        );

        setOrder(processedOrder);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, auth.accessToken]);

  const updateOrderStatus = async (newStatus: Orders["status"]) => {
    if (!order) return;

    try {
      setStatusUpdating(true);

      const response = await fetch(`${BASE_URL}/api/Orders/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update local state
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Parse the delivery address safely
  let deliveryAddress = order?.deliveryAddress || "";
  try {
    if (
      deliveryAddress &&
      typeof deliveryAddress === "string" &&
      deliveryAddress.includes("{")
    ) {
      const addressObj = JSON.parse(deliveryAddress);
      if (addressObj && typeof addressObj === "object") {
        deliveryAddress = `${addressObj.fullName || ""}, ${
          addressObj.address || ""
        }, ${addressObj.city || ""}, ${addressObj.zipCode || ""}`;
      }
    }
  } catch (e) {
    console.warn("Failed to parse delivery address:", e);
    // Use the address as-is if it's not valid JSON
  }

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/admin")} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="not-found">
        <h2>Order Not Found</h2>
        <p>The requested order could not be found.</p>
        <button onClick={() => navigate("/admin")} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate order totals with fallbacks
  const subtotal =
    order?.orderItems?.reduce(
      (sum, item) => sum + (item?.totalPrice || 0),
      0
    ) || 0;

  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <button onClick={() => navigate("/admin")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Order #{order.id}</h1>
        <div className="order-meta">
          <span>Date: {new Date(order.orderDate).toLocaleString()}</span>
        </div>
      </div>

      <div className="order-details-grid">
        <div className="order-info-panel">
          <div className="status-section">
            <h2>Status</h2>
            <div className="status-control">
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={(e) =>
                  updateOrderStatus(e.target.value as Orders["status"])
                }
                disabled={statusUpdating}
                className="status-select"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="delivery-section">
            <h2>Delivery Information</h2>
            <p className="delivery-address">{deliveryAddress}</p>
          </div>

          <div className="payment-section">
            <h2>Payment Details</h2>
            <p className="payment-method">Method: Cash on Delivery</p>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{subtotal} Ft</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>{total} Ft</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-items-panel">
          <h2>Order Items</h2>
          <div className="order-items-list">
            {order.orderItems.map((item) => (
              <div key={item.id} className="order-item-card">
                <div className="item-image-container">
                  <img
                    src={item.product.imageUrl || "/pizza-placeholder.jpg"}
                    alt={item.product.name}
                    className="item-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("pizza-placeholder.jpg")) {
                        target.src = "/pizza-placeholder.jpg";
                      }
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-description">{item.product.description}</p>
                  <div className="item-meta">
                    <span className="item-price">
                      {item.price} Ft × {item.quantity}
                    </span>
                    <span className="item-total">
                      {item.totalPrice} Ft
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
