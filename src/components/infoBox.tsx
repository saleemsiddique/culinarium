"use client";
import { PiCookingPotFill } from "react-icons/pi";

const features = [
  {
    name: 'Generación de recetas con IA',
    description:
      'Crea recetas personalizadas a partir de los ingredientes que tienes en casa, gracias a nuestra inteligencia artificial culinaria.',
    icon: PiCookingPotFill,
  },
  {
    name: 'Planificación semanal de comidas',
    description: 'Organiza tus menús semanales de forma sencilla, guarda tus platos favoritos y recibe recomendaciones automáticas.',
    icon: PiCookingPotFill,
  }
];

export default function InfoBox() {
  return (
    <div className="bg-white pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600">Cocina inteligente</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-black sm:text-5xl">
                Una nueva forma de crear y disfrutar recetas
              </p>
          <p className="mt-6 text-lg/8 text-gray-900">
                Culinarium te ayuda a cocinar de forma más creativa y eficiente. Nuestra app combina inteligencia
                artificial y colaboración entre usuarios para ofrecerte recetas adaptadas a tus gustos.
              </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}