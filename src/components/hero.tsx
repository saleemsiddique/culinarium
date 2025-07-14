"use client";
import ButtonPrimary from "@/components/buttonPrimary";
import ButtonSecondary from "@/components/buttonSecondary";

export default function HeroSection() {
  return (
    <>
      <video
        className="absolute top-15 left-0 w-full h-full object-cover z-0 "
        autoPlay
        muted
        loop
      >
        <source src="/test-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-15 left-0 w-full h-full bg-black opacity-50 z-5"></div>

      <div className="relative text-center z-10 text-white px-4">
        <div className="font-bold font-mono text-4xl md:text-6xl">
          WELCOME TO CULINARIUM
        </div>
        <div className="text-sm font-semibold mt-2">
          Tu proxima receta, a un clic de distancia
        </div>
        <div className="mt-6 space-x-4">
          <ButtonPrimary route={"/auth/login"} description={"Get Started"}/>
          <ButtonSecondary route={"#pricing"} description={"See Pricing"}/>
          
        </div>
      </div>
    </>
  );
}
