"use client";

import React, { useState } from "react";
import { useUser, CustomUser } from "@/context/user-context";
import { Menu } from "lucide-react";
import { TokensModal } from "./SideMenu/TokensModal";
import { PremiumModal } from "./SideMenu/PremiumModal";
import { MobileDrawer } from "./SideMenu/MobileDrawer";
import { DesktopSideMenu } from "./SideMenu/DesktopSideMenu";

interface SideMenuProps {
  className?: string;
}


const SideMenu: React.FC<SideMenuProps> = ({ className }) => {
  const { user } = useUser(); // user is CustomUser | null
  const [showTokens, setShowTokens] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <>
      {!drawerOpen && (
        <button onClick={() => setDrawerOpen(true)} className="fixed top-4 left-4 z-50 bg-[var(--highlight)] text-white rounded-full p-3 shadow-lg md:hidden" aria-label="Abrir menú">
          <Menu className="w-6 h-6" />
        </button>
      )}

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <DesktopSideMenu
        user={user}
        onOpenTokens={() => setShowTokens(true)}
        onOpenPremium={() => setShowPremium(true)}
        className={className}
      />

      {showTokens && <TokensModal user={user} onClose={() => setShowTokens(false)} />}
      {showPremium && <PremiumModal user={user} onClose={() => setShowPremium(false)} onSubscribe={() => setShowPremium(false)} />}
    </>
  );
};

export default SideMenu;
