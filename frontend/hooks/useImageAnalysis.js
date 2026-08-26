"use client";
import { useState } from "react";
export default function useImageAnalysis(){const [loading,setLoading]=useState(false);const analyze=async(file)=>{setLoading(true);await new Promise(r=>setTimeout(r,500));setLoading(false);return {status:"demo",message:"Connect services/imageService.js to the AI image endpoint."};};return {analyze,loading};}
