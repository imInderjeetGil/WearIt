import { Package, ShoppingCart, Shapes, IndianRupee } from "lucide-react";

const stats = [
  {
    title: "Products",
    value: 0,
    icon: Package,
  },
  {
    title: "Orders",
    value: 0,
    icon: ShoppingCart,
  },
  {
    title: "Categories",
    value: 0,
    icon: Shapes,
  },
  {
    title: "Revenue",
    value: "₹0",
    icon: IndianRupee,
  },
];

export default function Dashboard() {
  return (
    <>
      <div className="mb-10">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Dashboard
        </h1>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (

            <div
              key={stat.title}
              className="
                rounded-2xl
                border
                bg-white
                p-6
                shadow-sm
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-zinc-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-black">
                    {stat.value}
                  </h2>

                </div>

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                  "
                >
                  <Icon size={26} />
                </div>

              </div>

            </div>

          );

        })}

      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border bg-white p-6">

          <h2 className="text-xl font-bold">
            Recent Orders
          </h2>

          <p className="mt-4 text-zinc-500">
            Orders will appear here.
          </p>

        </div>

        <div className="rounded-2xl border bg-white p-6">

          <h2 className="text-xl font-bold">
            Low Stock Products
          </h2>

          <p className="mt-4 text-zinc-500">
            Products running low on stock will appear here.
          </p>

        </div>

      </div>
    </>
  );
}