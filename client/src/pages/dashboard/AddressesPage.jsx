import { useState } from "react";
import SectionHeading from "../../components/ui/SectionHeading";
import { useGetAddressesQuery, useCreateAddressMutation, useDeleteAddressMutation } from "../../features/api/apiSlice";

function AddressesPage() {
  const { data, isLoading } = useGetAddressesQuery();
  const addresses = data?.data || [];
  const [createAddress] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [form, setForm] = useState({ fullName: "", line1: "", city: "", country: "", postalCode: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    await createAddress(form).unwrap();
    setForm({ fullName: "", line1: "", city: "", country: "", postalCode: "" });
  };

  return (
    <div>
      <SectionHeading>Addresses</SectionHeading>

      <form onSubmit={handleCreate} className="mb-4 grid gap-2 sm:grid-cols-2">
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="input" />
        <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address line" className="input" />
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input" />
        <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="Postal code" className="input" />
        <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="input" />
        <button className="btn">Add address</button>
      </form>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <ul className="space-y-2">
          {addresses.map((a) => (
            <li key={a._id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.fullName}</div>
                  <div className="text-sm text-text/80">{a.line1}, {a.city}, {a.postalCode}, {a.country}</div>
                </div>
                <div>
                  <button className="text-sm text-red-500" onClick={() => deleteAddress(a._id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressesPage;
