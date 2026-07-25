import { useState } from "react";
import { toast } from "react-toastify";
import { Mail, MapPin, Phone, Snowflake } from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent — Cool Breeze support will reply soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-sky-50/50">
      <section className="relative h-[25vh] min-h-[220px] overflow-hidden bg-sky-50">
        <img
          src={getOptimizedImageUrl("https://images.unsplash.com/photo-1584622650111-993a426fbf0a", { width: 1200, quality: 75 })}
          alt="Modern Air Conditioner"
          width={1200}
          height={300}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/10 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 relative z-10">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-700">
              <Snowflake size={16} /> Cool Breeze
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">Contact Us</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mt-2 max-w-xl text-slate-500">
          Questions about tonnage, energy ratings, or your order? We typically reply within one business day.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4 border border-slate-200 bg-white p-6 sm:p-8">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Send message
            </button>
          </form>

          <div className="space-y-6">
            <div className="flex gap-4 border border-slate-200 bg-white p-5">
              <Mail className="shrink-0 text-sky-600" size={22} />
              <div>
                <h3 className="font-semibold text-slate-900">Email</h3>
                <p className="mt-1 text-sm text-slate-500">support@coolbreeze.com</p>
              </div>
            </div>
            <div className="flex gap-4 border border-slate-200 bg-white p-5">
              <Phone className="shrink-0 text-sky-600" size={22} />
              <div>
                <h3 className="font-semibold text-slate-900">Phone</h3>
                <p className="mt-1 text-sm text-slate-500">+1 (555) 014-2200</p>
              </div>
            </div>
            <div className="flex gap-4 border border-slate-200 bg-white p-5">
              <MapPin className="shrink-0 text-sky-600" size={22} />
              <div>
                <h3 className="font-semibold text-slate-900">Showroom</h3>
                <p className="mt-1 text-sm text-slate-500">120 Climate Avenue, Suite 400</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
