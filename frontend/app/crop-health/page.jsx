"use client";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar"; import Sidebar from "@/components/dashboard/Sidebar"; import PageHeader from "@/components/ui/PageHeader"; import CropHealthPanel from "@/components/crop/CropHealthPanel"; import {useLanguage} from "@/hooks/useLanguage";
import { useSearchParams } from "next/navigation";

function CropHealthContent(){const {t}=useLanguage();const params=useSearchParams();const fieldId=params.get("field");return <><PageHeader title={t.cropHealthTitle} description={t.cropHealthDescription}/><CropHealthPanel fieldId={fieldId}/></>}

export default function CropHealth(){return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><Suspense fallback={null}><CropHealthContent/></Suspense></div></main></>}