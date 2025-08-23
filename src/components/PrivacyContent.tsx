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

const PrivacyContent = () => {
  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen flex flex-col justify-center px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl w-full mx-auto flex flex-col overflow-y-auto">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>Última actualización:</strong> 9 de agosto de 2025 — <strong>Versión:</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 space-y-8 text-gray-400">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">1. Responsable y datos de contacto</h2>
            <p className="mt-2">
              Responsable: <strong>Equipo Culinarium</strong> — desarrolladores: Saleem Siddique, Hakeem Siddique y Wassim Atiki.<br />
              Dirección de contacto: <strong>03502, España</strong>.<br />
              Email de contacto (privacidad): <strong>culinariumofficial@gmail.com</strong>.<br />
              No disponemos de Delegado de Protección de Datos (DPO).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">2. Introducción</h2>
            <p className="mt-2">
              Culinarium es una aplicación SaaS que genera recetas a partir de los ingredientes y preferencias que los usuarios introducen.
              Esta política explica qué datos recogemos, con qué finalidad, quién los procesa, dónde se almacenan y cómo puedes ejercer tus derechos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">3. Datos que recogemos</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li><strong>Datos de cuenta y perfil:</strong> email, firstName, lastName, uid, created_at, campos de suscripción y tokens (monthly_tokens, extra_tokens, subscriptionId, stripeCustomerId, subscriptionStatus, subscriptionCanceled, lastRenewal, tokens_reset_date).</li>
              <li><strong>Historial y uso:</strong> recetas generadas (created_recipes), ingredientes, instrucciones, timestamps, momento_del_dia, porciones, restricciones, img_url.</li>
              <li><strong>Datos técnicos:</strong> IP (logs), user_agent, datos de dispositivo y métricas de uso (solo si das consentimiento).</li>
              <li><strong>Datos de pago:</strong> no almacenamos números de tarjeta; Stripe gestiona datos de pago. Guardamos identificadores de Stripe (stripeCustomerId) y metadatos necesarios para facturación.</li>
              <li><strong>Cookies y consentimiento:</strong> registro del consentimiento de cookies y preferencias (colección `consents`).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">4. Finalidades y bases legales</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li><strong>Prestación del servicio (ejecución de contrato):</strong> creación y gestión de cuenta, generación de recetas, uso de tokens y suscripciones.</li>
              <li><strong>Pagos y facturación (ejecución de contrato / obligación legal):</strong> gestión a través de Stripe.</li>
              <li><strong>Analítica y mejora del servicio (consentimiento):</strong> recogida de métricas si el usuario lo autoriza expresamente.</li>
              <li><strong>Seguridad y soporte (interés legítimo):</strong> detección de fraude y atención al usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">5. Encargados del tratamiento / terceros</h2>
            <p className="mt-2">Los siguientes terceros procesan datos en nombre de Culinarium:</p>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li><strong>OpenAI</strong> — generación de recetas vía API.</li>
              <li><strong>Stripe</strong> — pagos y suscripciones.</li>
              <li><strong>Firebase (Firestore y Auth)</strong> — base de datos y autenticación (ubicación: <em>europe-southwest1</em>).</li>
              <li><strong>Vercel</strong> — hosting y Vercel Analytics (solo si das consentimiento).</li>
              <li><strong>GitHub</strong> — repositorio y CI/CD (metadatos de despliegue).</li>
            </ul>
            <p className="mt-2">Con estos proveedores mantenemos acuerdos contractuales (DPA) cuando corresponde. Algunos pueden procesar datos fuera del EEE; aplicamos salvaguardas (SCCs u otras medidas) cuando sea necesario.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">6. Transferencias internacionales</h2>
            <p className="mt-2">
              Algunos proveedores pueden procesar datos fuera del EEE. En tales casos aplicaremos las garantías adecuadas (p. ej. cláusulas contractuales tipo / SCCs) para proteger tus datos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">7. Plazos de conservación</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              <li><strong>Datos de usuario / cuenta:</strong> hasta cancelación de la cuenta.</li>
              <li><strong>Historial de recetas:</strong> conservadas mientras exista la cuenta; máximo 5 años si procede.</li>
              <li><strong>Registros de pago / contabilidad:</strong> 5 años.</li>
              <li><strong>Registros de consentimientos:</strong> 2 años.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">8. Derechos del interesado</h2>
            <p className="mt-2">
              Tienes derecho a acceder, rectificar, suprimir, limitar el tratamiento, oponerte y solicitar portabilidad. Para ejercerlos contacta a <strong>culinariumofficial@gmail.com</strong> indicando tu nombre, email y UID (si procede).
              Responderemos en el plazo legal (normalmente 1 mes; puede ampliarse en casos complejos).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">9. Menores</h2>
            <p className="mt-2">El servicio está destinado a mayores de <strong>18 años</strong>. No permitimos el registro de menores de 18 años. Si detectamos una cuenta de un menor la suspenderemos y procederemos según la normativa aplicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">10. Seguridad</h2>
            <p className="mt-2">Implementamos medidas técnicas y organizativas razonables: TLS, controles de acceso a Firestore, backups y buenas prácticas de desarrollo. Para datos de pago usamos exclusivamente Stripe.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">11. Ejercicio de reclamaciones</h2>
            <p className="mt-2">Si no estás satisfecho con nuestra respuesta puedes presentar una reclamación ante la autoridad de control competente (en España: <strong>AEPD</strong>).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">12. Cambios en la política</h2>
            <p className="mt-2">Publicaremos la fecha de la última actualización en la cabecera de esta política. Si hay cambios importantes te los comunicaremos y solicitaremos consentimientos adicionales si procede.</p>
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

export default PrivacyContent;
