"use client";
import { useMemo } from "react";
import { fields } from "@/mocks/fields";
export default function useFields(){ return useMemo(()=>({fields,isLoading:false,error:null}),[]); }
