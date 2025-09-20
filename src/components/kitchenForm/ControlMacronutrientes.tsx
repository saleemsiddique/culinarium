import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronUpCircleOutline, IoChevronDownCircleOutline } from "react-icons/io5";

type MacroPercents = { protein: number; carbs: number; fats: number };
type Mode = "basic" | "pro";
type BasicGoal = "gain_muscle" | "more_carbs" | "more_fats";

interface Props {
    initialMode?: Mode;
    initialCalories?: number;
    initialPercents?: MacroPercents;
    initialBasicGoal?: BasicGoal | null;
    onChange?: (state: {
        mode: Mode;
        basicGoal: BasicGoal | null;
        calories: number;
        percents: MacroPercents;
    }) => void;
    className?: string;

    /** controla el acceso premium (pasa user?.isSubscribed desde el padre) */
    isSubscribed?: boolean;
    /** callback cuando el usuario intenta acceder a Pro sin ser premium */
    onRequestUpgrade?: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v)));
const calcGrams = (kcal: number, percent: number, kcalPerGram: number) =>
    Math.round(((percent / 100) * kcal) / kcalPerGram);

// Limits recommended
const LIMITS = {
    kcal: { min: 100, max: 2000 },
    protein: { min: 10, max: 60 },
    carbs: { min: 20, max: 70 },
    fats: { min: 10, max: 40 },
} as const;

const BASIC_PRESETS: Record<BasicGoal, { calories: number; percents: MacroPercents }> = {
    gain_muscle: { calories: 700, percents: { protein: 40, carbs: 40, fats: 20 } },
    more_carbs: { calories: 600, percents: { protein: 25, carbs: 60, fats: 15 } },
    more_fats: { calories: 650, percents: { protein: 25, carbs: 35, fats: 40 } },
};

export default function ControlMacronutrientes({
    initialMode = "basic",
    initialCalories = 500,
    initialPercents = { protein: 30, carbs: 50, fats: 20 },
    initialBasicGoal = null,
    onChange,
    className = "",
    isSubscribed = false,
    onRequestUpgrade,
}: Props) {
    const [show, setShow] = useState(true);
    const [mode, setMode] = useState<Mode>(initialMode);
    const [basicGoal, setBasicGoal] = useState<BasicGoal | null>(initialBasicGoal ?? null);
    const [calories, setCalories] = useState<number>(
        clamp(initialCalories, LIMITS.kcal.min, LIMITS.kcal.max)
    );
    const [percents, setPercents] = useState<MacroPercents>({
        protein: clamp(initialPercents.protein, LIMITS.protein.min, LIMITS.protein.max),
        carbs: clamp(initialPercents.carbs, LIMITS.carbs.min, LIMITS.carbs.max),
        fats: clamp(initialPercents.fats, LIMITS.fats.min, LIMITS.fats.max),
    });

    // Nota: permitimos que el usuario vea Pro aunque no sea premium (por eso no forzamos a basic).
    // Solo mostramos controles inactivos.

    // Notify parent on changes
    useEffect(() => {
        if (mode === "basic") {
            if (basicGoal && BASIC_PRESETS[basicGoal]) {
                const preset = BASIC_PRESETS[basicGoal];
                onChange?.({
                    mode,
                    basicGoal,
                    calories: preset.calories,
                    percents: preset.percents,
                });
            } else {
                // ningún objetivo → receta libre, no fijar macros
                onChange?.({
                    mode,
                    basicGoal: null,
                    calories: 0,
                    percents: { protein: 0, carbs: 0, fats: 0 },
                });
            }
        } else {
            if (!isSubscribed) {
                onChange?.({ mode, basicGoal, calories: 0, percents: { protein: 0, carbs: 0, fats: 0 } });
            } else {
                onChange?.({ mode, basicGoal, calories, percents });
            }
        }
    }, [mode, basicGoal, calories, percents, onChange]);

    // Safe setter that enforces bounds and redistributes remainder proportionally
    const setMacroSafe = (changed: keyof MacroPercents, valueRaw: number) => {
        setPercents((prev) => {
            const v = clamp(valueRaw, LIMITS[changed].min, LIMITS[changed].max);
            // remaining to distribute
            const remaining = 100 - v;
            const keys = ["protein", "carbs", "fats"] as (keyof MacroPercents)[];
            const others = keys.filter((k) => k !== changed);
            const prevA = prev[others[0]];
            const prevB = prev[others[1]];
            const curOthersSum = prevA + prevB || 1;

            // Proportional distribution based on previous split
            let first = Math.round((prevA / curOthersSum) * remaining);
            let second = remaining - first;

            // Clamp others to their bounds; then adjust iteratively if sum mismatch
            first = clamp(first, LIMITS[others[0]].min, LIMITS[others[0]].max);
            second = clamp(second, LIMITS[others[1]].min, LIMITS[others[1]].max);

            let sum = v + first + second;

            // If sum != 100, try to correct by changing 'first' and 'second' within their bounds
            if (sum !== 100) {
                let diff = 100 - (v + first + second);
                // Prefer to adjust second, then first, then decrease 'v' if needed
                const canIncSecond = LIMITS[others[1]].max - second;
                const canDecSecond = second - LIMITS[others[1]].min;
                if (diff > 0) {
                    const inc = Math.min(canIncSecond, diff);
                    second += inc;
                    diff -= inc;
                    const canIncFirst = LIMITS[others[0]].max - first;
                    const incF = Math.min(canIncFirst, diff);
                    first += incF;
                    diff -= incF;
                } else if (diff < 0) {
                    let need = -diff;
                    const dec = Math.min(canDecSecond, need);
                    second -= dec;
                    need -= dec;
                    const decF = Math.min(first - LIMITS[others[0]].min, need);
                    first -= decF;
                    need -= decF;
                    if (need > 0) {
                        // reduce v if still mismatch
                        const newV = clamp(v - need, LIMITS[changed].min, LIMITS[changed].max);
                        // recompute remaining and redistribute
                        const rem = 100 - newV;
                        const totalPrev = first + second || 1;
                        first = clamp(Math.round((first / totalPrev) * rem), LIMITS[others[0]].min, LIMITS[others[0]].max);
                        second = rem - first;
                        return { ...prev, [changed]: newV, [others[0]]: first, [others[1]]: second } as MacroPercents;
                    }
                }
                return { ...prev, [changed]: v, [others[0]]: first, [others[1]]: second } as MacroPercents;
            } else {
                return { ...prev, [changed]: v, [others[0]]: first, [others[1]]: second } as MacroPercents;
            }
        });
    };

    // Handler para cambiar modo (permitimos ver Pro aunque no se esté suscrito)
    const handleSetMode = (m: Mode) => {
        setMode(m);
    };

    const proBlocked = mode === "pro" && !isSubscribed;

    // Helper para el overlay que captura clics en controles Pro bloqueados
    const UpgradeOverlay: React.FC<{ label?: string }> = ({ label }) => (
        <button
            type="button"
            onClick={() => onRequestUpgrade?.()}
            className="absolute inset-0 bg-transparent"
            aria-label={label ? `Acceder a ${label} (Premium)` : "Función Premium"}
        />
    );

    return (
        <section className={`bg-[var(--background)] p-4 rounded-xl form-custom-shadow ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                        <div className="font-bold text-[var(--foreground)]">Macronutrientes</div>
                        <div className="text-xs text-[var(--muted)]">Usar responsablemente ⚠️</div>
                    </div>
                </div>
                <motion.button
                    onClick={() => setShow((s) => !s)}
                    aria-expanded={show}
                    className="flex items-center"
                    initial={false}
                    animate={{ rotate: show ? 180 : 0 }}
                >
                    {show ? (
                        <IoChevronUpCircleOutline className="w-6 h-6 text-[var(--muted)]" />
                    ) : (
                        <IoChevronDownCircleOutline className="w-6 h-6 text-[var(--muted)]" />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="overflow-hidden text-sm"
                    >
                        {/* mode switch */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSetMode("basic")}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold ${mode === "basic" ? "bg-[var(--highlight)]/20 border-[var(--highlight)]" : "bg-[var(--background)] border border-[var(--primary)]"}`}
                                >
                                    Básico
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetMode("pro")}
                                    aria-pressed={mode === "pro"}
                                    title={!isSubscribed ? "Pro (vista previa) — necesita suscripción para editar" : undefined}
                                    className={`relative px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-2
                    ${mode === "pro" ? "bg-[var(--highlight)]/20 border-[var(--highlight)]" : "bg-[var(--background)] border border-[var(--primary)]"}
                    ${!isSubscribed ? "opacity-80" : ""}`}
                                >
                                    Pro
                                    {!isSubscribed && (
                                        <span className="ml-1 inline-block text-[10px] px-2 py-0.5 font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-full">
                                            PREMIUM
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="text-xs text-[var(--muted)]">
                                {mode === "basic"
                                    ? basicGoal
                                        ? basicGoal === "gain_muscle"
                                            ? "🏋️ Ganar músculo"
                                            : basicGoal === "more_carbs"
                                                ? "⚡ Más energía"
                                                : "🥑 Más saciante"
                                        : "Modo rápido"
                                    : `${calories} kcal`}
                            </div>
                        </div>

                        {mode === "basic" ? (
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBasicGoal((prev) => (prev === "gain_muscle" ? null : "gain_muscle"))}
                                    className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${basicGoal === "gain_muscle" ? "border-[var(--highlight)] bg-[var(--highlight)]/20" : "border border-[var(--primary)]"}`}
                                >
                                    <div className="text-lg">🏋️</div>
                                    <div className="mt-1">Ganar músculo</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setBasicGoal((prev) => (prev === "more_carbs" ? null : "more_carbs"))}
                                    className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${basicGoal === "more_carbs" ? "border-[var(--highlight)] bg-[var(--highlight)]/20" : "border border-[var(--primary)]"}`}
                                >
                                    <div className="text-lg">⚡</div>
                                    <div className="mt-1">Más energía</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setBasicGoal((prev) => (prev === "more_fats" ? null : "more_fats"))}
                                    className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${basicGoal === "more_fats" ? "border-[var(--highlight)] bg-[var(--highlight)]/20" : "border border-[var(--primary)]"}`}
                                >
                                    <div className="text-lg">🥑</div>
                                    <div className="mt-1">Más saciante</div>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 relative">
                                    <label className="text-xs font-medium w-28">Calorías</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={LIMITS.kcal.min}
                                            max={LIMITS.kcal.max}
                                            value={calories}
                                            onChange={(e) => setCalories(clamp(Number(e.target.value || 0), LIMITS.kcal.min, LIMITS.kcal.max))}
                                            className={`w-28 p-1 rounded-md border border-[var(--primary)] text-sm ${proBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                            aria-label="Calorías objetivo"
                                            disabled={proBlocked}
                                            title={proBlocked ? "Función Pro — requiere suscripción para editar" : undefined}
                                        />
                                        {proBlocked && <UpgradeOverlay label="Editar calorías (Pro)" />}
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">{calories} kcal</div>
                                </div>

                                <div className="grid gap-2">
                                    {/* Proteínas */}
                                    <div className="relative">
                                        <div className="flex justify-between items-baseline text-xs mb-1">
                                            <span>Proteínas 🥩</span>
                                            <span className="text-[var(--muted)]">{percents.protein}% • {calcGrams(calories, percents.protein, 4)} g</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min={LIMITS.protein.min}
                                                max={LIMITS.protein.max}
                                                value={percents.protein}
                                                onChange={(e) => {
                                                    if (proBlocked) {
                                                        onRequestUpgrade?.();
                                                        return;
                                                    }
                                                    setMacroSafe("protein", Number(e.target.value));
                                                }}
                                                className={`w-full ${proBlocked ? "opacity-50" : ""}`}
                                            />
                                            {proBlocked && <UpgradeOverlay label="Editar proteínas (Pro)" />}
                                        </div>
                                    </div>

                                    {/* Carbs */}
                                    <div className="relative">
                                        <div className="flex justify-between items-baseline text-xs mb-1">
                                            <span>Carbohidratos 🍚</span>
                                            <span className="text-[var(--muted)]">{percents.carbs}% • {calcGrams(calories, percents.carbs, 4)} g</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min={LIMITS.carbs.min}
                                                max={LIMITS.carbs.max}
                                                value={percents.carbs}
                                                onChange={(e) => {
                                                    if (proBlocked) {
                                                        onRequestUpgrade?.();
                                                        return;
                                                    }
                                                    setMacroSafe("carbs", Number(e.target.value));
                                                }}
                                                className={`w-full ${proBlocked ? "opacity-50" : ""}`}
                                            />
                                            {proBlocked && <UpgradeOverlay label="Editar carbohidratos (Pro)" />}
                                        </div>
                                    </div>

                                    {/* Fats */}
                                    <div className="relative">
                                        <div className="flex justify-between items-baseline text-xs mb-1">
                                            <span>Grasas 🥑</span>
                                            <span className="text-[var(--muted)]">{percents.fats}% • {calcGrams(calories, percents.fats, 9)} g</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min={LIMITS.fats.min}
                                                max={LIMITS.fats.max}
                                                value={percents.fats}
                                                onChange={(e) => {
                                                    if (proBlocked) {
                                                        onRequestUpgrade?.();
                                                        return;
                                                    }
                                                    setMacroSafe("fats", Number(e.target.value));
                                                }}
                                                className={`w-full ${proBlocked ? "opacity-50" : ""}`}
                                            />
                                            {proBlocked && <UpgradeOverlay label="Editar grasas (Pro)" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs mt-1">
                                    <div className="text-[var(--muted)]">
                                        Total: <span className="font-medium text-[var(--foreground)]">{percents.protein + percents.carbs + percents.fats}%</span>
                                    </div>
                                    <div className="text-[var(--muted)]">Valores aproximados</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
