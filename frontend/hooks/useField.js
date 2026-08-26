"use client";
import { fields } from "@/mocks/fields";
export default function useField(id){ return {field: fields.find(f=>f.id===id) || fields[0], isLoading:false}; }
