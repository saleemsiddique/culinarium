"use client";
import { motion } from "framer-motion";
import { PiCookingPotFill } from "react-icons/pi";
import { GiMeal, GiWeightScale } from "react-icons/gi";
import { RiSparklingFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";




export default function InfoBox() {
  const { t } = useTranslation();

  const features = [
    {
      name: t("infoBox.features.recipeGeneration.name"),
      description: t("infoBox.features.recipeGeneration.description"),
      icon: PiCookingPotFill,
      gradient: 'linear-gradient(135deg, #E67E22 0%, #C2651A 100%)',
    },
    {
      name: t("infoBox.features.adaptedRecipes.name"),
      description: t("infoBox.features.adaptedRecipes.description"),
      icon: GiMeal,
      gradient: 'linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)',
    },
    {
      name: t("infoBox.features.enhancedExperience.name"),
      description: t("infoBox.features.enhancedExperience.description"),
      icon: RiSparklingFill,
      gradient: 'linear-gradient(135deg, #E67E22 20%, #2C3E50 80%)',
    },
    {
      name: t("infoBox.features.macrosCalculation.name"),
      description: t("infoBox.features.macrosCalculation.description"),
      icon: GiWeightScale,
      gradient: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)',
    }
  ];

  return (
    <div style={{
      backgroundColor: '#FDF5E6',
      color: '#4A2C2A',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingTop: '50px',
      paddingBottom: '50px'
    }}>
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              background: 'linear-gradient(135deg, #E67E22, #C2651A)',
              borderRadius: '50px',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {t("infoBox.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              color: '#2C3E50',
              lineHeight: '1.1',
              marginBottom: '1.5rem'
            }}
          >
            {t("infoBox.title")}{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E67E22, #C2651A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t("infoBox.cooking")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              fontSize: '1.2rem',
              color: '#4A2C2A',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            {t("infoBox.description")}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          margin: '4rem 0 0 0'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                border: '2px solid rgba(230, 126, 34, 0.2)',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: `conic-gradient(from 0deg at 50% 50%, ${feature.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')}, transparent 70%)`,
                opacity: '0.05',
                transform: 'rotate(-45deg)'
              }} />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '80px',
                  height: '80px',
                  background: feature.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              >
                <feature.icon size={40} color="white" />
              </motion.div>

              {/* Content */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2C3E50',
                marginBottom: '1rem',
                lineHeight: '1.3'
              }}>
                {feature.name}
              </h3>

              <p style={{
                fontSize: '1rem',
                color: '#4A2C2A',
                lineHeight: '1.6',
                opacity: '0.8'
              }}>
                {feature.description}
              </p>

              {/* Decorative element */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '60px' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                style={{
                  height: '4px',
                  background: feature.gradient,
                  borderRadius: '2px',
                  marginTop: '1.5rem'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}