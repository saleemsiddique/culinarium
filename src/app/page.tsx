import Image from "next/image";
import ButtonPrimary from "@/components/buttonPrimary";
import ButtonSecondary from "@/components/buttonSecondary";
import InfoBox from "@/components/infoBox";
import { FaCheck } from "react-icons/fa";
export default function Home() {
  return (
    <div className="h-screen w-full bg-[var(--background)]">
      {/*Video Introduction*/}
      <section className="relative flex justify-center items-center pt-40 h-[720px]">
        <video
          className="absolute top-15 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
        >
          <source src="/test-video.mp4" type="video/mp4" />
        </video>
        <div className="relative text-center z-10 text-white px-4">
          <div className="font-bold font-mono text-4xl md:text-6xl">
            WELCOME TO CULINARIUM
          </div>
          <div className="text-sm font-semibold mt-2">
            Tu proxima receta, a un clic de distancia
          </div>
          <div className="mt-6 space-x-4">
            <ButtonPrimary />
            <ButtonSecondary />
          </div>
        </div>
      </section>

      {/* Key Features */}

      <section className="flex flex-col justify-between items-center pt-20 h-[720px] mx-20 md:mx-5 md:flex-row md:h-[520px] md:pt-0">
        <InfoBox></InfoBox>
        <InfoBox></InfoBox>
        <InfoBox></InfoBox>
      </section>

      {/* Pricing */}

      <section className="flex flex-col justify-between items-center mx-20 md:mx-5">
        <div className="text-center">
          <div className="font-bold font-mono text-xl md:text-2xl">PRICING</div>
          <div className="font-bold font-mono text-2xl md:text-4xl">
            Bibendum amet at molestie mattis.
          </div>
        </div>

        <div className="flex flex-row mt-10">
          <div className="text-center flex flex-col border p-7 bg-gray-600 h-auto">
            <div className="pb-5">
              <div className="font-semibold text-3xl">Basico</div>
              <div className="text-sm">Mas texto por rellenar</div>
            </div>

            <div>
              <p className="line-through">7,99€</p>
              <p className="">3,99€</p>
            </div>

            <ButtonPrimary />
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2">
                <FaCheck className="text-green-500 mt-1" />
                First Item
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-green-500 mt-1" />
                Second Item
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-green-500 mt-1" />
                Third Item
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
