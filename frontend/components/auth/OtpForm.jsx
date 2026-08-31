"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";

export default function OtpForm({ mode, mobile, name, onBack , initialOtp }) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [lastOtp, setLastOtp] = useState(initialOtp ?? null); // dev-only: last demo_otp shown

  const onChange = (v, i) => {
    if (!/^\d?$/.test(v)) return;
    const a = [...otp];
    a[i] = v;
    setOtp(a);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const verify = async () => {
    setError("");
    const code = otp.join("");
    if (code.length !== 6) { setError(t.invalidOtp); return; }
    setLoading(true);
    try {
      const { access_token } = await authApi.verifyOtp(mobile, code);
      login({ name: name || t.profileRole, mobile, token: access_token });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setResending(true);
    try {
      const res = await authApi.resendOtp(mobile);
      setLastOtp(res.demo_otp); // demo mode: show the new code
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack ?? (() => location.reload())} className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-fasai-700">
        <ArrowLeft size={17}/>{t.back}
      </button>
      <div>
        <h2 className="text-2xl font-black tracking-tight text-fasai-900">{t.otpTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t.otpText}</p>
        <p className="mt-1 font-semibold text-fasai-700">+91 {mobile}</p>
      </div>
      <div className="flex justify-between gap-2">
        {otp.map((v, i) => (
          <input key={i} id={`otp-${i}`} value={v} maxLength={1} inputMode="numeric"
            onChange={e => onChange(e.target.value, i)}
            className="h-12 w-11 min-w-0 flex-1 rounded-xl border border-slate-300 text-center text-xl font-black outline-none transition focus:border-fasai-600 focus:ring-2 focus:ring-fasai-100 sm:h-14 sm:w-12 sm:flex-none"/>
        ))}
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <button onClick={verify} disabled={loading} className="btn-primary w-full disabled:opacity-60">
        <CheckCircle2 size={19}/>{loading ? "..." : t.verify}
      </button>
      <button onClick={resend} disabled={resending} className="w-full text-sm font-bold text-fasai-700 transition hover:underline disabled:opacity-60">
        {resending ? "..." : t.resend}
      </button>
      {lastOtp && <p className="text-center text-xs font-semibold text-slate-400">{t.demoMode}: {lastOtp}</p>}
    </div>
  );
}
