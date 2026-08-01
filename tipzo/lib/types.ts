export interface TipOrderRequest {
  amount: number; // in rupees, e.g. 500
  name: string;
  message: string;
  email: string;
  username: string; // creator being tipped, from /tip/[username]
}

export interface TipOrderResponse {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  name: string;
  message: string;
  amount: number; // rupees
  username: string;
}

export interface TipAlertPayload {
  id: string;
  name: string;
  message: string;
  amount: number; // rupees
  createdAt: string;
}
