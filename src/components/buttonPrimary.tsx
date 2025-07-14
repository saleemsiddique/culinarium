"use client";
import Link from 'next/link'; /* THIS IS A TEST TO NAVIGATE DELETE LATER */

export default function ButtonPrimary() {
  return (
    <Link href="/kitchen" className="bg-amber-400 text-black px-4 py-2 rounded shadow hover:bg-amber-600">
      Primary Action
    </Link >
  );
}
