"use client";
import { useRouter } from "next/navigation";

interface ButtonPrimaryProps {
  route: string;
  description: string;
}

export default function ButtonPrimary({
  route,
  description,
}: ButtonPrimaryProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <button
  onClick={handleClick}
  className="
    bg-orange-500 
    hover:bg-orange-600  
    active:bg-orange-700
    text-white 
    font-bold 
    px-6 py-3 
    rounded-lg 
    shadow-md 
    hover:shadow-lg 
    transition-all 
    duration-200 
    transform 
    hover:scale-105
    border border-orange-600
    focus:outline-none 
    focus:ring-2 
    focus:ring-orange-400
    
    cursor-pointer
  "
>
  {description}
</button>
  );
}
