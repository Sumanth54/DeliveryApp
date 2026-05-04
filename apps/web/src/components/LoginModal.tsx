import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { requestOtp, verifyOtp } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  async function handleRequestOtp() {
    try {
      setLoading(true);
      setError("");
      const code = await requestOtp(phone, name);
      setDebugOtp(code);
      setStep("otp");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to request OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    try {
      setLoading(true);
      setError("");
      await verifyOtp(phone, otp, name);
      onClose();
      setStep("phone");
      setOtp("");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              OTP Login
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate">Welcome to Namma Basket</h2>
          </div>
          <button className="text-stone-500" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">
          Demo admin phone: <strong>9876500000</strong>. Mock OTP for all users: <strong>123456</strong>.
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate">
            Name
            <input
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-500"
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              value={name}
            />
          </label>

          <label className="block text-sm font-medium text-slate">
            Phone number
            <input
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-500"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="9876543210"
              value={phone}
            />
          </label>

          {step === "otp" ? (
            <label className="block text-sm font-medium text-slate">
              OTP
              <input
                className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-500"
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                value={otp}
              />
            </label>
          ) : null}
        </div>

        {debugOtp ? (
          <p className="mt-4 text-sm text-brand-600">Use OTP <strong>{debugOtp}</strong> to continue.</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          {step === "phone" ? (
            <button
              className="flex-1 rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white hover:bg-brand-600"
              disabled={loading}
              onClick={handleRequestOtp}
              type="button"
            >
              {loading ? "Sending..." : "Request OTP"}
            </button>
          ) : (
            <>
              <button
                className="rounded-2xl border border-stone-200 px-4 py-3 font-semibold text-slate"
                onClick={() => setStep("phone")}
                type="button"
              >
                Back
              </button>
              <button
                className="flex-1 rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white hover:bg-brand-600"
                disabled={loading}
                onClick={handleVerifyOtp}
                type="button"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
