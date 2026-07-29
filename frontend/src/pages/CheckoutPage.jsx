import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { placeOrder } from "../api/order";
import useCartStore from "../store/cartStore";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
  subtotal,
  fetchCart,
} = useCartStore();

  const [loading, setLoading] = useState(false);
const [form, setForm] = useState({
  fullName: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
});
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

    console.log("1. Placing order...");

    await placeOrder();

    console.log("2. Order placed");

    navigate("/order-success");

    console.log("3. Navigation called");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.detail ?? err.message);
  } finally {
    setLoading(false);
  }
}
function handleChange(e) {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
}
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">

      <h1 className="mb-10 text-4xl font-black">
        Checkout
      </h1>

      <div className="grid gap-10 lg:grid-cols-2">

        {/* Shipping */}

        <div className="space-y-5">

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

          <div className="grid grid-cols-2 gap-4">

            <input
  name="city"
  value={form.city}
  onChange={handleChange}
  placeholder="City"
  className="h-14 rounded-xl border px-4"
/>

            <input
  name="pincode"
  value={form.pincode}
  onChange={handleChange}
  placeholder="Pincode"
  className="h-14 rounded-xl border px-4"
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
              ? "Placing Order..."
              : "Place Order"}
          </button>

        </div>

      </div>

    </section>
  );
}