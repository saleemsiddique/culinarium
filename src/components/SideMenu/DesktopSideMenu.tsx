import React from "react";
import Link from "next/link";
import { Plus, BookOpen, Hammer, Zap, Crown } from "lucide-react";
import { CustomUser } from "@/context/user-context";

interface DesktopSideMenuProps {
  onOpenTokens: () => void;
  onOpenPremium: () => void;
  user: CustomUser | null;
  className?: string;
}

export const DesktopSideMenu: React.FC<DesktopSideMenuProps> = ({ onOpenTokens, onOpenPremium, className = "", user }) => {
  const totalTokens = user ? user.monthly_tokens + user.extra_tokens : 0;
  const tokensUsed = user ? Math.max(0, 30 - user.monthly_tokens) : 0;
  const remainingTokens = totalTokens - tokensUsed;

  return (
    <aside className={`hidden md:flex fixed top-16 bottom-20 left-0 w-20 bg-white flex-col items-center justify-between py-6 border-r border-gray-200 ${className}`}>
      <div className="space-y-4">
        <Link href="/kitchen" className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition">
          <Plus className="w-6 h-6 text-gray-700" /><span className="sr-only">Nuevo Receta</span>
        </Link>
        <Link href="/kitchen/recipes" className="w-16 h-16 flex items-center justify-center bg-orange-400 rounded-lg hover:opacity-90 transition">
          <BookOpen className="w-6 h-6 text-white" /><span className="sr-only">Mis Recetas</span>
        </Link>
      </div>

      <div className="border-t border-gray-200 pt-4 flex flex-col items-center space-y-3">
        <button onClick={onOpenPremium} className={`w-16 h-16 flex items-center justify-center border-2 rounded-lg hover:bg-gray-100 transition ${user?.isSubscribed ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg" : "bg-gray-50 border-dashed border-amber-400 hover:bg-amber-50"}`}>
          <Crown className={`w-6 h-6 ${user?.isSubscribed ? "text-white" : "text-amber-500"}`} />
        </button>
        <button onClick={onOpenTokens} className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex flex-col items-center justify-center relative group">
          <Zap className="w-6 h-6 text-white mb-0.5" />
          <span className="text-xs font-bold text-white">{user?.isSubscribed ? "∞" : remainingTokens}</span>
          {!user?.isSubscribed && remainingTokens <= 5 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>
        <div className="text-center">
          <div className={`text-xs font-bold ${user?.isSubscribed ? "text-amber-600" : "text-gray-500"}`}>{user?.isSubscribed ? "PRO" : "FREE"}</div>
        </div>
      </div>

      <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"><Hammer className="w-5 h-5" /><span className="sr-only">Ajustes</span></button>
    </aside>
  );
};