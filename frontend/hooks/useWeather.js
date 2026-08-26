"use client";
import { weather } from "@/mocks/weather";
export default function useWeather(){ return {data:weather,isLoading:false}; }
