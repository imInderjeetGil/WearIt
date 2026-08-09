import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createPaymentOrder,
  verifyPayment,
} from "../../payments/api/payment";
import { cancelOrder } from "../api/order";
import useCartStore from "../../cart/store/cart-store";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    subtotal,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  function openRazorpay(payment) {
    const options = {
      key: payment.razorpay_key_id,
      amount: payment.amount,
      currency: "INR",
      name: "WearIt",
      description: `Order #${payment.order_id}`,
      order_id: payment.razorpay_order_id,
      handler(response) {
        verifyPayment({
          order_id: payment.order_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
          .then(() => {
            navigate("/order-success", {
              state: { orderId: payment.order_id },
            });
          })
          .catch((err) => {
            toast.error(
              err.response?.data?.detail ??
                "Payment verification failed."
            );
          });
      },
      modal: {
        ondismiss() {
          // Abandoned payment → cancel the pending order to restore stock
          cancelOrder(payment.order_id).catch(() => {});
          toast.error("Payment cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      cancelOrder(payment.order_id).catch(() => {});
      toast.error(
        response.error?.description ?? "Payment failed."
      );
    });

    rzp.open();
  }

  async function handlePlaceOrder() {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.pincode.trim()
    ) {
      toast.error("Please fill all shipping details.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await createPaymentOrder({
        full_name: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      });

      setLoading(false);

      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        toast.error(
          "Payment gateway failed to load. Please try again."
        );
        return;
      }

      openRazorpay(data);
    } catch (err) {
      setLoading(false);
      toast.error(
        err.response?.data?.detail ??
          "Unable to start payment."
      );
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-12">

      <h1 className="mb-6 sm:mb-10 text-2xl sm:text-4xl font-black">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* Shipping */}

        <div className="space-y-4 sm:space-y-5">

          <input
    name="fullName"
    value={form.fullName}
    onChange={handleChange}
    placeholder="Full Name"
    className="h-14 w-full rounded-xl border px-4"
  />

          <input
    name="phone"
    value={form.phone}
    onChange={handleChange}
    placeholder="Phone Number"
    className="h-14 w-full rounded-xl border px-4"
  />

          <textarea
    name="address"
    value={form.address}
    onChange={handleChange}
    placeholder="Address"
    className="h-36 w-full rounded-xl border p-4"
  />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <input
    name="city"
    value={form.city}
    onChange={handleChange}
    placeholder="City"
    className="h-14 w-full rounded-xl border px-4"
  />

            <input
    name="pincode"
    value={form.pincode}
    onChange={handleChange}
    placeholder="Pincode"
    className="h-14 w-full rounded-xl border px-4"
  />

          </div>

        </div>

        {/* Summary */}

        <div className="rounded-2xl border p-6">

          <h2 className="text-2xl font-bold">
            Order Summary
          </h2>

          <div className="mt-8 flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal()}</span>
          </div>

          <div className="mt-4 flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <hr className="my-6" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>₹{subtotal()}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-8 h-14 w-full rounded-xl bg-black text-white"
          >
            {loading
              ? "Preparing Payment..."
              : "Proceed to Pay"}
          </button>

        </div>

      </div>

    </section>
  );
}
