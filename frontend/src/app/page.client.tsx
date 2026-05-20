"use client";

import { Search, Star, X, Building, Icon } from "lucide-react";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LandingPageClient() {
  const [searchValue, setSearchValue] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim()
      ? `?q=${encodeURIComponent(searchValue.trim())}`
      : "";
    router.push(`/dashboard${query}`);
  };

  const tags = [
    "Ascenseur PMR",
    "Soutien LSF",
    "Espace calme",
    "Hôpital",
    "Pédiatrie",
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f4f8ff] font-sans overflow-x-hidden flex flex-col pb-[100px]"
    >
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center pt-24 pb-40 lg:pt-28 lg:pb-40">
        {/* Background decorative circles */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[800px] h-[800px] border border-blue-200/50 rounded-full" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] border border-blue-200/60 rounded-full" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] border border-blue-200/70 rounded-full" />

        <div className="container mx-auto px-6 relative z-10 ">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 lg:pr-12 text-center lg:text-left z-20 p-10">
              <h1 className="text-5xl lg:text-[4rem] leading-[1.1] font-extrabold text-[#14284b] mb-6 tracking-tight">
                Trouvez facilement un centre médical{" "}
                <span className="text-primary block mt-1">accessible</span>
              </h1>
              <p className="text-lg text-[#556987] mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Sur MyAccess, nous simplifions la recherche des médecins,
                spécialistes et hôpitaux les plus adaptés à vos besoins
                d'accessibilité et à votre famille.
              </p>

              {/* Badges */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-lg shadow-xl shadow-blue-900/10">
                  <div className="bg-white p-2 rounded-md">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">
                      Des infos d'accessibilité
                    </p>
                    <p className="text-xs text-white/80">
                      pour chaque établissement
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-lg shadow-xl shadow-blue-900/10">
                  <div className="bg-white p-2 rounded-md">
                    <Star
                      className="w-5 h-5 text-primary"
                      fill="currentColor"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">
                      Des avis de patients
                    </p>
                    <p className="text-xs text-white/80">
                      Authentiques et vérifiés
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image Placeholder */}
            <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative">
              {/* Doctor Placeholder Box */}
              <div className="relative w-full max-w-[500px] mx-auto z-10 flex flex-col items-center justify-end h-[500px] bg-blue-100 rounded-b-[40px] rounded-t-[200px] overflow-hidden shadow-2xl">
                {/* TO REPLACE: Place actual image here */}
                <div className="w-full h-full bg-gradient-to-t from-blue-600 to-transparent flex items-center justify-center">
                  <span className="opacity-100 mt-5">
                    <Image
                      src="/france2.png"
                      alt="Illustration de la France"
                      width={500}
                      height={500}
                    />
                  </span>
                </div>
              </div>

              {/* Floating Icons */}
              <div
                className="absolute top-20 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-blue-50 text-blue-500 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <span className="text-xl">💊</span>
              </div>
              <div
                className="absolute bottom-40 -left-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-blue-50 text-blue-500 animate-bounce"
                style={{ animationDuration: "4s" }}
              >
                <span className="text-2xl">🩺</span>
              </div>
              <div
                className="absolute top-40 right-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-blue-50 text-blue-500 animate-bounce"
                style={{ animationDuration: "2.5s" }}
              >
                <span className="text-xl">❤️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-[1000px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 z-30 border border-slate-100">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Spécialité, pathologie, nom d'établissement..."
                className="pl-12 h-14 bg-slate-50 border-transparent rounded-xl focus-visible:ring-primary focus-visible:bg-white text-base font-medium placeholder:font-normal"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="h-14 w-full md:w-16 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 transition-all shrink-0"
              aria-label="Rechercher"
            >
              <Search className="h-6 w-6" />
            </button>
          </form>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm font-bold text-[#14284b] whitespace-nowrap">
              Suggestions :
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#556987] text-sm font-medium transition-colors border border-slate-100"
                  onClick={() => setSearchValue(tag)}
                  type="button"
                >
                  {tag}
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-[#e5edff] text-primary hover:bg-primary/20 text-sm font-bold transition-colors"
              >
                Plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for floating search bar overlap */}
      <div className="h-32 w-full shrink-0"></div>
    </main>
  );
}
