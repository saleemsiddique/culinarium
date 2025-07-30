"use client";
import { useRouter } from "next/navigation";

interface ButtonSecondaryProps {
  route: string;
  description: string;
}

export default function ButtonSecondary({
  route,
  description,
}: ButtonSecondaryProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };
  return (
    <button 
  onClick={handleClick} 
  className="
    bg-transparent 
    hover:bg-orange-50 
    active:bg-orange-100
    text-orange-600 
    hover:text-orange-700
    font-bold 
    px-6 py-3 
    rounded-lg 
    shadow-md 
    hover:shadow-lg 
    transition-all 
    duration-200 
    transform 
    hover:scale-105
    border-2 border-orange-500
    hover:border-orange-600
    focus:outline-none 
    focus:ring-2 
    focus:ring-orange-400
    focus:ring-opacity-50
    cursor-pointer
  "
>
  {description}
</button>
  );
}
