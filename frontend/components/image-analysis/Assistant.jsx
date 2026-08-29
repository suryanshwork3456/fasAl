"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Upload, Camera, Loader2, ImageIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { fields } from "@/mocks/fields";
import { analyzeLeafImage } from "@/mocks/leafScan";

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
  const fileInputRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    const q = text.trim();
    setMessages(m => [...m, { role: "user", text: q }, { role: "ai", text: t.assistantDemoResponse }]);
    setText("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const field = fields.find(f => f.id === fieldId);
    const fieldName = field ? field.name : "";

    setMessages(m => [...m, { role: "user", type: "image", imageUrl: previewUrl, fieldName }]);
    setAnalyzing(true);
    setMessages(m => [...m, { role: "ai", type: "analyzing" }]);

    const response = await analyzeLeafImage({ fieldId });
    setAnalyzing(false);
    setMessages(m => {
      const withoutSpinner = m.filter(msg => msg.type !== "analyzing");
      return [...withoutSpinner, { role: "ai", type: "result", data: response, fieldName }];
    });
  };

  return <div>
    <div className="card flex min-h-[560px] flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fasai-100"><Bot className="text-fasai-700"/></div>
        <div><b>{t.askAssistant}</b><div className="text-xs text-emerald-600">● {t.assistantDemo}</div></div>
      </div>

      <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-2">
        <span className="text-xs font-bold text-slate-500">{t.uploadForField || "Uploading for:"}</span>
        <select value={fieldId} onChange={e=>setFieldId(e.target.value)} className="min-h-9 rounded-lg border bg-white px-2 text-xs font-bold text-fasai-700">
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.length <= 1 && (
          <div className="rounded-2xl border border-fasai-100 bg-fasai-50 p-4 text-sm text-fasai-800">
            <div className="mb-2 flex items-center gap-2 font-bold"><Camera size={16}/>{t.beforeYouUpload || "Before you upload"}</div>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {QUALITY_TIPS_KEYS.map(k => <li key={k}>{t[k] || defaultTip(k)}</li>)}
            </ul>
          </div>
        )}

        {messages.map((m,i) => <MessageBubble key={i} msg={m} t={t} />)}
      </div>

      <div className="border-t p-3">
        <div className="mb-2 flex gap-2">
          <label className="btn-secondary cursor-pointer px-3 py-2 text-sm">
            <Upload size={16}/>{t.uploadImage}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={analyzing}/>
          </label>
        </div>
        <div className="flex gap-2">
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
        <div className="max-w-[80%] overflow-hidden rounded-2xl bg-fasai-600">
          <img src={msg.imageUrl} alt="Uploaded crop" className="max-h-64 w-full object-cover" />
          {msg.fieldName && <div className="px-3 py-2 text-xs font-bold text-white/90">{msg.fieldName}</div>}
        </div>
      </div>
    );
  }

  if (msg.type === "analyzing") {
    return (
      <div className="flex gap-2">
        <div className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <Loader2 size={16} className="animate-spin" />
          {t.analyzingImage || "Analyzing image..."}
        </div>
      </div>
    );
  }

  if (msg.type === "result") {
    const { result, data_source } = msg.data;
    return (
      <div className="flex gap-2">
        <div className="max-w-[90%] rounded-2xl bg-slate-100 p-4 text-slate-700">
          <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <ImageIcon size={14} />{t.aiAssistedAssessment || "AI-Assisted Assessment"}
          </div>
          <div className="mb-3 text-base font-black text-fasai-800">
            {result.label} <span className="ml-1 text-sm font-bold text-fasai-600">{Math.round(result.confidence * 100)}%</span>
          </div>
          {result.others?.length > 0 && (
            <div className="mb-3 space-y-1">
              <div className="text-xs font-bold text-slate-500">{t.otherPossibilities || "Other possibilities"}</div>
              {result.others.map(o => (
                <div key={o.label} className="flex items-center justify-between text-xs text-slate-500">
                  <span>{o.label}</span><span className="font-bold">{Math.round(o.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs leading-5 text-slate-500">
            {t.notGuaranteedDiagnosis || "This is an AI-assisted assessment, not a guaranteed diagnosis. Consider expert verification before taking action."}
          </p>
          {data_source === "mock" && (
            <p className="mt-2 text-[11px] font-bold text-amber-600">{t.demoDataLabel || "Demo data — not a real satellite reading."}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${msg.role==="user" ? "justify-end" : ""}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role==="user" ? "bg-fasai-600 text-white" : "bg-slate-100 text-slate-700"}`}>{msg.text}</div>
    </div>
  );
}