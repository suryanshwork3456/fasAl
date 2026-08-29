"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Upload, Camera, Loader2, ImageIcon, AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { fields } from "@/mocks/fields";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUALITY_TIPS_KEYS = [
  "tipGoodLighting", "tipKeepFocus", "tipCaptureAffectedLeaves", "tipAvoidBlur",
];

export default function Assistant(){
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const preselectedField = searchParams.get("field");
  const [messages, setMessages] = useState([{ role: "ai", text: t.assistantWelcome }]);
  const [text, setText] = useState("");
  const [fieldId, setFieldId] = useState(
    fields.find(f => f.id === preselectedField)?.id || fields[0]?.id || ""
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    const q = text.trim();
    setMessages(m => [...m, { role: "user", text: q }, { role: "ai", text: t.assistantDemoResponse }]);
    setText("");
  };

  const analyzeFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessages(m => [...m, { role: "ai", type: "error", text: "Please upload an image file (JPG, PNG, or WEBP)." }]);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const field = fields.find(f => f.id === fieldId);
    const fieldName = field ? field.name : "";

    setMessages(m => [...m, { role: "user", type: "image", imageUrl: previewUrl, fieldName }]);
    setAnalyzing(true);
    setMessages(m => [...m, { role: "ai", type: "analyzing" }]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/v1/crop/analyze`, {
        method: "POST",
        body: formData,
      });

      const withoutSpinner = () => setMessages(m => m.filter(msg => msg.type !== "analyzing"));

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        withoutSpinner();
        setMessages(m => [...m, {
          role: "ai", type: "error",
          text: detail?.detail || "Crop analysis is currently unavailable. Please try again later.",
        }]);
        return;
      }

      const data = await res.json();
      withoutSpinner();
      setMessages(m => [...m, { role: "ai", type: "result", data, fieldName }]);
    } catch (err) {
      setMessages(m => m.filter(msg => msg.type !== "analyzing"));
      setMessages(m => [...m, { role: "ai", type: "error", text: "Couldn't reach the server. Check your connection and try again." }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    analyzeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (analyzing) return;
    const file = e.dataTransfer.files?.[0];
    analyzeFile(file);
  };

  const showDropzone = messages.length <= 1;

  return <div>
    <div className="card flex min-h-[560px] flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fasai-100"><Bot className="text-fasai-700"/></div>
        <div><b>{t.askAssistant}</b><div className="text-xs text-emerald-600">● {t.assistantDemo}</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-4 py-2">
        <span className="text-xs font-bold text-slate-500">{t.uploadForField || "Uploading for:"}</span>
        <select value={fieldId} onChange={e=>setFieldId(e.target.value)} className="min-h-9 rounded-lg border bg-white px-2 text-xs font-bold text-fasai-700">
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {showDropzone && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => !analyzing && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-10 ${
                dragActive ? "border-fasai-500 bg-fasai-50" : "border-slate-300 bg-slate-50 hover:border-fasai-300 hover:bg-fasai-50/50"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fasai-100 text-fasai-700">
                <Upload size={26} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{t.dropImageHere || "Drag & drop a leaf photo here"}</p>
                <p className="mt-1 text-xs text-slate-500">{t.orClickToBrowse || "or click to browse from your device"}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="btn-primary pointer-events-none px-4 py-2 text-sm"><Upload size={16}/>{t.uploadImage}</span>
                <span className="btn-secondary pointer-events-none px-4 py-2 text-sm"><Camera size={16}/>{t.takePhoto || "Take Photo"}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t.supportedFormats || "JPG, PNG, or WEBP · up to 10MB"}</p>
            </div>

            <div className="rounded-2xl border border-fasai-100 bg-fasai-50 p-4 text-sm text-fasai-800">
              <div className="mb-2 flex items-center gap-2 font-bold"><Camera size={16}/>{t.beforeYouUpload || "Before you upload"}</div>
              <ul className="list-inside list-disc space-y-1 text-xs">
                {QUALITY_TIPS_KEYS.map(k => <li key={k}>{t[k] || defaultTip(k)}</li>)}
              </ul>
            </div>
          </>
        )}

        {messages.map((m,i) => <MessageBubble key={i} msg={m} t={t} />)}
      </div>

      <div className="border-t p-3">
        {!showDropzone && (
          <div className="mb-2 flex gap-2">
            <label className="btn-secondary cursor-pointer px-3 py-2 text-sm">
              <Upload size={16}/>{t.uploadAnother || "Upload another photo"}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={analyzing}/>
            </label>
          </div>
        )}
        {showDropzone && (
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={analyzing}/>
        )}
        <div className="flex flex-wrap gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={t.typeMessage} className="min-w-0 flex-1 rounded-xl border p-3 outline-none"/>
          <button onClick={send} className="btn-primary px-4"><Send size={18}/><span className="hidden sm:inline">{t.send}</span></button>
        </div>
      </div>
    </div>
  </div>;
}

function defaultTip(key) {
  const fallback = {
    tipGoodLighting: "Use good lighting.",
    tipKeepFocus: "Keep the plant in focus.",
    tipCaptureAffectedLeaves: "Capture affected leaves clearly.",
    tipAvoidBlur: "Avoid blurry images.",
  };
  return fallback[key] || "";
}

function MessageBubble({ msg, t }) {
  if (msg.type === "image") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] overflow-hidden rounded-2xl bg-fasai-600 sm:max-w-[80%]">
          <img src={msg.imageUrl} alt="Uploaded crop" className="max-h-64 w-full object-cover" />
          {msg.fieldName && <div className="px-3 py-2 text-xs font-bold text-white/90">{msg.fieldName}</div>}
        </div>
      </div>
    );
  }

  if (msg.type === "analyzing") {
    return (
      <div className="flex gap-2">
        <div className="flex max-w-[90%] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 sm:max-w-[80%]">
          <Loader2 size={16} className="animate-spin" />
          {t.analyzingImage || "Analyzing image..."}
        </div>
      </div>
    );
  }

  if (msg.type === "error") {
    return (
      <div className="flex gap-2">
        <div className="flex max-w-[90%] items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:max-w-[80%]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{msg.text}</span>
        </div>
      </div>
    );
  }

  if (msg.type === "result") {
    const data = msg.data || {};
    const {
      crop_name,
      status,
      disease_name,
      confidence,
      symptoms,
      treatment,
    } = data;

    const isHealthy = (status || "").toLowerCase() === "healthy";
    const confidenceStyles = {
      high: "bg-emerald-100 text-emerald-700",
      medium: "bg-amber-100 text-amber-700",
      low: "bg-red-100 text-red-700",
    };
    const confKey = (confidence || "").toLowerCase();

    return (
      <div className="flex gap-2">
        <div className="max-w-[95%] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:max-w-[90%]">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <ImageIcon size={14} />{t.aiAssistedAssessment || "AI-Assisted Assessment"}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black ${isHealthy ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {isHealthy ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {status || "Unknown"}
            </div>
            {confidence && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${confidenceStyles[confKey] || "bg-slate-100 text-slate-600"}`}>
                {confidence} confidence
              </span>
            )}
          </div>

          <div className="mb-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t.cropName || "Crop"}</p>
              <p className="font-bold text-slate-800">{crop_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t.diseaseName || "Disease"}</p>
              <p className="font-bold text-slate-800">{disease_name || "N/A"}</p>
            </div>
          </div>

          {symptoms && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-bold text-slate-500">{t.symptoms || "Symptoms"}</p>
              <p className="text-sm leading-6 text-slate-700">{symptoms}</p>
            </div>
          )}

          {treatment && (
            <div className="mb-3 rounded-xl border border-fasai-100 bg-fasai-50 p-3">
              <p className="mb-1 text-xs font-bold text-fasai-700">{t.recommendedTreatment || "Recommended Treatment"}</p>
              <p className="text-sm leading-6 text-fasai-900">{treatment}</p>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">
            {t.notGuaranteedDiagnosis || "This is an AI-assisted assessment, not a guaranteed diagnosis. Consider expert verification before taking action."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${msg.role==="user" ? "justify-end" : ""}`}>
      <div className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${msg.role==="user" ? "bg-fasai-600 text-white" : "bg-slate-100 text-slate-700"}`}>{msg.text}</div>
    </div>
  );
}