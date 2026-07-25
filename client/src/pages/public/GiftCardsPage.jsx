import { Link } from "react-router-dom";
import { Mail, Truck, Printer, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

function GiftCardsPage() {
  const giftCards = [
    { title: "eGift Cards", icon: <Mail size={48} className="text-blue-500" />, desc: "Delivered instantly by email or text." },
    { title: "Physical Gift Cards", icon: <Truck size={48} className="text-green-500" />, desc: "Delivered by mail with free shipping." },
    { title: "Print at Home", icon: <Printer size={48} className="text-orange-500" />, desc: "Printable PDF delivered in minutes." },
    { title: "Corporate Gift Cards", icon: <Briefcase size={48} className="text-purple-500" />, desc: "Reward employees and engage customers." },
  ];

  return (
    <div className="bg-[#eaeded] min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-[250px] md:h-[350px] w-full relative overflow-hidden flex items-center p-8 md:p-16">
            <img
              src="https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Gift Cards"
              width={1200}
              height={350}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-white max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 shadow-sm">Give the perfect gift</h1>
              <p className="text-lg md:text-xl font-medium mb-6">FashionHouse Gift Cards never expire and carry no fees.</p>
              <Link to="/shop?category=gift-cards" className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-black px-6 py-2 rounded-md font-bold text-sm transition-colors">
                Shop all Gift Cards
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by delivery method</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {giftCards.map((card, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center cursor-pointer border border-gray-200">
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center mb-4 overflow-hidden rounded-md">
                {card.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.desc}</p>
              <Link to="/shop?category=gift-cards" className="mt-auto text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-semibold">
                Shop now
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Redeem a Gift Card</h2>
            <p className="text-gray-600 mb-4">Have a gift card? Apply the claim code to your balance to use it on your next purchase.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter claim code" className="flex-1 border border-gray-400 rounded-md px-3 py-2 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]" />
              <button 
                onClick={() => toast.info("Applying gift card to balance...")}
                className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-md font-medium text-sm transition-colors border border-gray-300"
              >
                Apply to Balance
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 text-center border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
            <h3 className="text-lg font-bold mb-2">Check Gift Card Balance</h3>
            <button 
              onClick={() => toast.info("Checking gift card balance...")}
              className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-semibold"
            >
              View balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GiftCardsPage;
