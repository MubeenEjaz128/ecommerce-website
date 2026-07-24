import { Search, Heart, Baby, Gift } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function RegistryPage() {
  return (
    <div className="bg-[#eaeded] min-h-screen">
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Registry or Gift List</h1>
          <p className="text-gray-600 mb-6">Search for a Wedding, Baby, or Birthday registry by name or email.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">Registrant name</label>
              <input type="text" placeholder="e.g. John Doe" className="w-full border border-gray-400 rounded-md px-3 py-2 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow" />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-bold text-gray-900 mb-1">Event type</label>
              <select className="w-full border border-gray-400 rounded-md px-3 py-2 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] bg-white cursor-pointer transition-shadow">
                <option>Wedding</option>
                <option>Baby</option>
                <option>Birthday</option>
                <option>Custom Gift List</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => toast.info("Searching registries...")}
                className="w-full md:w-auto h-10 px-8 bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] rounded-md font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} /> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Wedding Registry</h3>
            <p className="text-sm text-gray-600 mb-4 flex-1">Register for everything you need to start your new life together.</p>
            <Link to="/login" className="text-sm font-bold text-[#007185] hover:text-[#C7511F] hover:underline">Create a Wedding Registry</Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-pink-500">
              <Baby size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Baby Registry</h3>
            <p className="text-sm text-gray-600 mb-4 flex-1">Get ready for your little one with a comprehensive list of essentials.</p>
            <Link to="/login" className="text-sm font-bold text-[#007185] hover:text-[#C7511F] hover:underline">Create a Baby Registry</Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-500">
              <Gift size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Birthday Gift List</h3>
            <p className="text-sm text-gray-600 mb-4 flex-1">Share your birthday wishes with friends and family easily.</p>
            <Link to="/login" className="text-sm font-bold text-[#007185] hover:text-[#C7511F] hover:underline">Create a Birthday List</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistryPage;
