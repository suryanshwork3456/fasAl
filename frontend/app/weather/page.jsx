"use client";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import PageHeader from "@/components/ui/PageHeader";
import { CloudRain, Wind, Droplets, ThermometerSun } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import useWeather from "@/hooks/useWeather";

const CONDITION_ICON = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
};

export default function Weather() {
  const { t } = useLanguage();
  const { data: weather, isLoading, error } = useWeather();

  return (
    <>
      <Navbar dashboard />
      <Sidebar />
      <main className="lg:ml-64">
        <div className="container-fasai py-5">
          <PageHeader title={t.weatherTitle} description={t.weatherDescription} />

          {isLoading && (
            <p className="mt-4 text-sm text-slate-500">{t.loading ?? "Loading..."}</p>
          )}

          {error && !isLoading && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          {!isLoading && !error && weather && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric l={t.temperature} v={`${weather.current.temperature}°C`} I={ThermometerSun} />
                <Metric l={t.humidity} v={`${weather.current.humidity}%`} I={Droplets} />
                <Metric l={t.rainfall} v={`${weather.current.rainfall} mm`} I={CloudRain} />
                <Metric l={t.wind} v={`${weather.current.wind_speed} km/h`} I={Wind} />
              </div>

              <div className="card mt-5 p-5">
                <h2 className="text-lg font-black">{t.forecast}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {weather.forecast.map((x, i) => (
                    <div key={`${x.day}-${i}`} className="rounded-2xl bg-fasai-50 p-4 text-center">
                      <div className="font-bold">{i === 0 ? t.today : x.day}</div>
                      <div className="my-3 text-3xl">{CONDITION_ICON[x.condition] ?? "🌤️"}</div>
                      <div className="text-xl font-black">{x.temp}°</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {x.rain_probability}% {t.rainChance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">{weather.note}</p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Metric({ l, v, I }) {
  return (
    <div className="card p-5">
      <I className="text-fasai-600" />
      <div className="mt-4 text-sm text-slate-500">{l}</div>
      <div className="text-2xl font-black">{v}</div>
    </div>
  );
}