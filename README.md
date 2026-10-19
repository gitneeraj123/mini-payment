# Mini Payment Gateway 💳

A simple payment gateway project built using **HTML, Tailwind CSS, JavaScript, Node.js, Express.js, Razorpay, and MongoDB**. It demonstrates how an online payment system creates orders, processes payments, verifies payment signatures, and stores payment records in a database.

## 🚀 Features

- Product checkout interface for Wireless Headphones.
- Razorpay Checkout integration.
- Backend order creation using the Razorpay Node.js SDK.
- HMAC-SHA256 payment signature verification.
- Payment status verification through the Razorpay API.
- MongoDB integration for persistent order storage.
- Secure environment variable configuration using `.env`.
- Payment success and failure handling.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML | Structure of the checkout page |
| Tailwind CSS | Styling and responsive UI |
| JavaScript | Frontend payment handling |
| Node.js | Backend runtime |
| Express.js | API routes and static file serving |
| Razorpay | Order creation and payment processing |
| MongoDB Atlas | Persistent order and payment storage |
| Mongoose | MongoDB schema and database operations |
| dotenv | Loading environment variables |

## 📂 Project Structure

```text
mini-payment/
├── models/
│   └── Order.js
├── public/
│   ├── index.html
│   └── script.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## ⚙️ How the Payment Process Works

### 1. Customer opens the checkout page

The frontend displays the product name, Wireless Headphones, its price of ₹500, and a **Pay Now** button.

### 2. Frontend requests an order

When the customer clicks Pay Now, `script.js` sends a POST request to the backend endpoint `/create-order`.

### 3. Backend creates a Razorpay order

The Express.js server uses the Razorpay SDK to create an order with an amount of `50000` paise, equivalent to ₹500, and currency `INR`.

Razorpay returns an order ID, such as `order_...`.

### 4. Order is saved in MongoDB

The backend stores the order details in the `mini_payment` database and `orders` collection.

The record contains the Razorpay order ID, amount, currency, payment status, and payment ID when available.

### 5. Razorpay Checkout opens

The backend returns the order details to the frontend. The frontend uses the Razorpay Checkout SDK to open the payment window.

The customer completes a payment attempt using Razorpay's supported payment options in Test Mode.

### 6. Payment response is received

After a successful Checkout response, Razorpay provides:

- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

The frontend sends these values to the backend endpoint `/verify-payment`.

### 7. Backend verifies the signature

The backend generates an HMAC-SHA256 signature using the order ID, payment ID, and Razorpay Key Secret.

It compares the generated signature with the signature returned by Razorpay. This helps verify that the payment response is authentic.

### 8. Payment details are checked

After signature verification, the backend fetches the payment details directly from Razorpay.

It checks that the payment belongs to the expected order and that the amount and currency match the original order.

### 9. MongoDB is updated

The backend updates the corresponding order record with the Razorpay payment ID and actual payment status.

The application reports payment success only when the payment status is `captured`.

### 10. Frontend displays the result

The frontend displays a success message when verification and the captured-status check pass. Otherwise, it displays an appropriate error message.

## 🔄 Payment Flow Diagram

```text
Customer
   |
   v
Frontend (HTML + JavaScript)
   |
   | POST /create-order
   v
Node.js + Express Backend
   |
   v
Razorpay Order API
   |
   | Returns Order ID
   v
MongoDB: Save Order
   |
   v
Razorpay Checkout
   |
   | Payment Response
   v
POST /verify-payment
   |
   v
Verify Signature on Backend
   |
   v
Fetch Payment Status from Razorpay
   |
   v
Update Order in MongoDB
   |
   v
Display Payment Result
```

## 🗄️ Database Design

**Database:** `mini_payment`

**Collection:** `orders`

| Field | Description |
|---|---|
| `razorpayOrderId` | Unique Razorpay order identifier |
| `amount` | Order amount in paise |
| `currency` | Order currency, usually INR |
| `paymentStatus` | Current payment status |
| `razorpayPaymentId` | Razorpay payment identifier, when available |
| `createdAt` | Record creation timestamp |
| `updatedAt` | Last update timestamp |

MongoDB stores the order before payment and updates its payment details after the backend verifies the response.

## 💻 Installation and Setup

### Prerequisites

- Node.js and npm installed.
- A MongoDB Atlas account and database user.
- A Razorpay account with Test Mode API keys.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mini-payment-gateway.git
cd mini-payment-gateway
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholders with your actual credentials. Use Razorpay Test Mode keys while developing.

### 4. Run the server

```bash
node server.js
```

Open the following URL in your browser:

```text
http://localhost:3000
```

## 🔐 Security Considerations

- Keep Razorpay Key Secret and MongoDB credentials on the backend.
- Never commit `.env` to GitHub.
- Use Razorpay's official test payment details while testing.
- Never trust a frontend success message as proof of payment.
- Verify the payment signature on the backend.
- Check the actual payment status and order details before fulfilling an order.
- Use a database to persist order records rather than relying only on in-memory storage.
- For production, implement proper error handling, authenticated order access, idempotent updates, and payment webhook handling.

## 🧪 Testing

1. Start the Node.js server.
2. Open the checkout page.
3. Click **Pay Now**.
4. Complete a test payment through Razorpay Checkout.
5. Confirm that the backend verifies the signature and checks the payment status.
6. Inspect the `orders` collection in MongoDB Atlas to confirm the order and payment details are saved.

Test successful payments, failed payments, and checkout cancellation separately.

## 📚 Key Learning Outcomes

- Understanding the client-server architecture.
- Integrating a third-party payment gateway.
- Creating orders through a backend API.
- Understanding payment IDs, order IDs, and payment signatures.
- Performing server-side payment verification.
- Connecting Node.js to MongoDB using Mongoose.
- Persisting and updating payment records.
- Managing credentials using environment variables.

## ⚠️ Disclaimer

This is a learning project intended for development and testing. It is not a production-ready payment system. Production use requires additional security, monitoring, error handling, and payment lifecycle management.

