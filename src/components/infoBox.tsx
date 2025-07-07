"use client";
import { PiCookingPotFill } from "react-icons/pi";

export default function InfoBox() {
  return (
    <div className="w-3xs text-center">
      <div className="flex justify-center">
        <PiCookingPotFill size={100} />
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. In rem commodi
        accusamus illo! Eaque quia corporis, excepturi corrupti necessitatibus
        provident quod cupiditate totam nisi, architecto inventore pariatur
        molestias, nobis molestiae.
      </div>
    </div>
  );
}
