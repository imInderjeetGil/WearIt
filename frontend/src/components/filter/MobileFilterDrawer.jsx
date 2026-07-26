import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({
  open,
  onClose,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" />

      {/* Drawer */}
      <div className="fixed inset-0 flex items-end">
        <DialogPanel className="w-full rounded-t-3xl bg-white max-h-[85vh] overflow-y-auto">

          {/* Handle */}
          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-14 rounded-full bg-zinc-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b">

            <h2 className="text-lg font-semibold">
              Filters
            </h2>

            <button onClick={onClose}>
              <X size={22} />
            </button>

          </div>

          {/* Filters */}
          <div className="px-6 py-6">

            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
            />

          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">

            <button
              onClick={() => {
                setMinPrice(null);
                setMaxPrice(null);
              }}
              className="flex-1 h-12 rounded-xl border"
            >
              Clear
            </button>

            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-black text-white"
            >
              Apply
            </button>

          </div>

        </DialogPanel>
      </div>
    </Dialog>
  );
}