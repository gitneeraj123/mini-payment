const pay = document.getElementById("pay");
const message = document.getElementById("message");

pay.addEventListener("click", async () => {
    pay.disabled = true;
    pay.textContent = "Processing...";
    message.textContent = "Creating your order...";

    try {
        // 1. Get the public Key ID
        const keyResponse = await fetch("/key");

        if (!keyResponse.ok) {
            throw new Error("Could not get Razorpay Key ID");
        }

        const { key } = await keyResponse.json();

        // 2. Create an order on the backend
        const orderResponse = await fetch("/create-order", {
            method: "POST"
        });

        if (!orderResponse.ok) {
            throw new Error("Could not create order");
        }

        const order = await orderResponse.json();


        // 3. Open Razorpay Checkout
        const options = {
            key: key,
            amount: order.amount,
            currency: order.currency,
            name: "Mini Store",
            description: "Wireless Headphones",
            order_id: order.id,

           
        handler: async function (response) {
            message.textContent = 'Verifying payment...';

            try {
                const verifyResponse = await fetch('/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(response)
                });

                const result = await verifyResponse.json();

                if (!verifyResponse.ok || !result.success) {
                    throw new Error(
                        result.message || 'Verification failed'
                    );
                }

                message.textContent = 'Payment signature verified!';
                message.className =
                    'mt-4 text-center text-sm text-green-600';

                pay.textContent = 'Payment Verified';
                // Keep the button disabled after verification.

            } catch (error) {
                console.error('Verification error:', error);

                message.textContent =
                    'Could not verify payment. Contact support.';
                message.className =
                    'mt-4 text-center text-sm text-red-600';

                pay.disabled = false;
                pay.textContent = 'Pay Now';
            }
        },


            modal: {
                ondismiss: function () {
                    message.textContent = "Checkout closed.";
                    pay.disabled = false;
                    pay.textContent = "Pay Now";
                }
            }
        };

        const rzp = new Razorpay(options);

        rzp.on("payment.failed", function (response) {
            console.log("Payment failed:", response.error);

            message.textContent = "Payment failed. Please try again.";
            pay.disabled = false;
            pay.textContent = "Pay Now";
        });

        rzp.open();

    } catch (error) {
        console.error("Checkout error:", error);

        message.textContent = "Unable to start payment.";
        pay.disabled = false;
        pay.textContent = "Pay Now";
    }
});
