import { Dialog, DialogPanel } from "@headlessui/react";
import { Check, X } from "lucide-react";

const options = [
  {
    label: "Newest",
    value: "-created_at",
  },
  {
    label: "Price: Low to High",
    value: "price",
  },
  {
    label: "Price: High to Low",
    value: "-price",
  },
];

export default function SortDrawer({
  open,
  onClose,
  sort,
  setSort,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50 lg:hidden"
    >
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-end">

        <DialogPanel className="w-full rounded-t-3xl bg-white">

          {/* Handle */}

          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-14 rounded-full bg-zinc-300" />
          </div>

          {/* Header */}

          <div className="flex items-center justify-between border-b px-6 py-5">

            <h2 className="text-lg font-semibold">
              Sort By
            </h2>

            <button onClick={onClose}>
              <X size={22} />
            </button>

          </div>

          {/* Options */}

          <div className="py-2">

            {options.map((item) => (

              <button
                key={item.value}
                onClick={() => {
                  setSort(item.value);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-6 py-5 hover:bg-zinc-50 transition"
              >

                <span>

                  {item.label}

                </span>

                {sort === item.value && (

                  <Check
                    size={20}
                    className="text-black"
                  />

                )}

              </button>

            ))}

          </div>

        </DialogPanel>

      </div>

    </Dialog>
  );
}