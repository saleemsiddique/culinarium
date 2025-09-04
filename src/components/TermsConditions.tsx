"use client";

import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TermsContent = () => {
  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            Términos y Condiciones
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>Última actualización:</strong> 9 de agosto de 2025 —{" "}
            <strong>Versión:</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 space-y-8 text-gray-400"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">1. Partes</h2>
            <p className="mt-2">
              Contrato entre el usuario (tú) y{" "}
              <strong>Equipo Culinarium</strong> (Saleem Siddique, Hakeem
              Siddique y Wassim Atiki). Al crear una cuenta y usar el servicio
              aceptas estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              2. Descripción del servicio
            </h2>
            <p className="mt-2">
              Culinarium permite generar recetas a partir de un formulario donde
              indicas ingredientes, tiempo disponible, momento del día,
              restricciones dietéticas y estilo culinario. Cada receta cuesta{" "}
              <strong>10 tokens</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              3. Modelos y contenido generado
            </h2>
            <p className="mt-2">
              Las recetas se generan mediante la API de OpenAI u otros modelos
              que podamos utilizar. La selección del modelo puede cambiar con el
              tiempo. Las recetas son sugerencias culinarias y el usuario es
              responsable de verificar alérgenos, seguridad alimentaria y
              adecuación de ingredientes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              4. Tokens y planes
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li>
                <strong>Plan gratuito:</strong> 50 tokens al mes (equivalente a
                5 recetas/mes).
              </li>
              <li>
                <strong>Suscripción:</strong> por suscripción mensual se otorgan
                300 tokens + funcionalidades extra. Los tokens de suscripción{" "}
                <em>expiran</em> al finalizar cada periodo de suscripción (no
                son permanentes).
              </li>
              <li>
                <strong>Packs de tokens (1–6):</strong> paquetes de tokens que
                se compran por separado; esos tokens extra permanecen
                disponibles mientras el servicio exista.
              </li>
              <li>
                <strong>Orden de gasto:</strong> los tokens de suscripción se
                consumen antes que los tokens comprados en packs.
              </li>
              <li>
                <strong>Costos de generación:</strong> generar una nueva receta
                cuesta 10 tokens, regenerar una receta existente cuesta 5
                tokens.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              5. Pagos y facturación
            </h2>
            <p className="mt-2">
              Todos los pagos se gestionan mediante <strong>Stripe</strong>. Al
              pagar aceptas los términos de Stripe. Las suscripciones se renuevan
              automáticamente salvo cancelación previa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              6. Derecho de desistimiento y comienzo inmediato del servicio
            </h2>
            <p className="mt-2">
              Debido a que el servicio se presta de forma inmediata (generación
              de recetas y consumición de tokens en el momento), el usuario
              deberá aceptar expresamente, en el momento del pago, que el
              servicio comience inmediatamente y renuncia al derecho de
              desistimiento cuando la ley lo permita. Esto se hará mediante una
              casilla (checkbox) visible en el proceso de compra que el usuario
              debe marcar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">7. Reembolsos</h2>
            <p className="mt-2">
              <strong>No ofrecemos reembolsos en ningún caso.</strong> Esta
              política aplica a compras de tokens y suscripciones, salvo que la
              ley exija lo contrario en un caso concreto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              8. Cancelación y gestión de tokens
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li>
                Si cancelas la suscripción, las funcionalidades extra se
                mantienen hasta el fin del periodo ya pagado; los tokens de
                suscripción no son acumulables ni permanentes.
              </li>
              <li>
                Los tokens comprados en packs se mantendrán mientras el servicio
                esté activo (hasta posible cierre del servicio).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              9. Suspensión y terminación
            </h2>
            <p className="mt-2">
              Culinarium se reserva el derecho a suspender o terminar cuentas
              por fraude, actividad ilícita o violación de estos términos. En
              caso de terminación razonada intentaremos notificar al usuario.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              10. Limitación de responsabilidad
            </h2>
            <p className="mt-2">
              Las recetas son sugerencias; no garantizamos resultados concretos.
              Equipo Culinarium no será responsable por daños derivados de
              seguir una receta (intoxicaciones, alergias, etc.). Nuestra
              responsabilidad, en la medida permitida por la ley, queda limitada
              a lo pagado por el usuario en los 12 meses previos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              11. Aviso sobre salud y nutrición
            </h2>
            <p className="mt-2">
              No somos médicos, dietistas ni nutricionistas titulados. El
              contenido y las recetas que genera Culinarium son únicamente
              sugerencias culinarias con fines informativos y recreativos. No
              constituyen asesoramiento médico, nutricional ni profesional. El
              usuario es responsable de comprobar la idoneidad de los
              ingredientes en función de sus alergias, intolerancias,
              restricciones médicas o necesidades personales. Ante cualquier
              duda relacionada con tu salud o alimentación, consulta siempre con
              un profesional sanitario cualificado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              12. Uso aceptable
            </h2>
            <p className="mt-2">
              El usuario se compromete a no utilizar el servicio para fines
              ilegales, fraudulentos o que perjudiquen a terceros, ni para
              intentar dañar, sobrecargar o interferir con la operatividad de la
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              13. Exención de garantía técnica
            </h2>
            <p className="mt-2">
              No garantizamos que el servicio funcione sin interrupciones, libre
              de errores o permanentemente disponible. Podrán existir
              interrupciones por mantenimiento, actualizaciones o causas ajenas
              a nuestro control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              14. Modificación del servicio
            </h2>
            <p className="mt-2">
              Nos reservamos el derecho a modificar, suspender o interrumpir
              parte o la totalidad de las funcionalidades del servicio en
              cualquier momento, avisando con antelación razonable cuando sea
              posible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              15. Edad mínima de uso
            </h2>
            <p className="mt-2">
              Para usar Culinarium debes tener al menos <strong>18 años</strong>.
              Al registrarte declaras que cumples con este requisito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              16. Propiedad intelectual
            </h2>
            <p className="mt-2">
              Los usuarios conservan derechos sobre el contenido que suban. Al
              enviar ingredientes y preferencias otorgas a Culinarium una
              licencia no exclusiva para procesar, almacenar y generar recetas.
              El uso de las recetas generadas para fines comerciales u otros usos
              debe consultarse si hay restricciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              17. Protección de datos
            </h2>
            <p className="mt-2">
              Tratamos tus datos conforme a nuestra{" "}
              <a
                href="/consent/privacy"
                className="text-orange-400 hover:underline"
              >
                Política de Privacidad
              </a>
              . Procesadores principales: OpenAI, Stripe, Firebase, Vercel,
              GitHub.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              18. Ley aplicable y jurisdicción
            </h2>
            <p className="mt-2">
              Estos términos se rigen por la ley española. Cualquier
              controversia será sometida a los tribunales competentes
              establecidos por la ley aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              19. Cambios en los Términos
            </h2>
            <p className="mt-2">
              Podemos modificar estos términos; publicaremos la nueva versión
              con fecha y avisaremos de cambios sustanciales con antelación
              razonable.
            </p>
          </section>

          <footer>
            <p className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-8">
              Contacto: culinariumofficial@gmail.com — Dirección: 03502, España.
            </p>
          </footer>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default TermsContent;
