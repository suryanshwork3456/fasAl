"use client";
import * as Icons from "lucide-react";
export default function Icon({ name, size = 20, ...props }) {
  const C = Icons[name] || Icons.Circle;
  return <C size={size} {...props} />;
}
