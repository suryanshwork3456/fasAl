"use client";
import Navbar from "@/components/layout/Navbar"; import Sidebar from "@/components/dashboard/Sidebar"; import PageHeader from "@/components/ui/PageHeader"; import CropHealthPanel from "@/components/crop/CropHealthPanel"; import {useLanguage} from "@/hooks/useLanguage";
export default function CropHealth(){const {t}=useLanguage();return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><PageHeader title={t.cropHealthTitle} description={t.cropHealthDescription}/><CropHealthPanel/></div></main></>}
