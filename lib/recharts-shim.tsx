"use client";

import type { ReactNode, SVGProps } from "react";

type CommonProps = {
  children?: ReactNode;
  className?: string;
  data?: unknown[];
  dataKey?: string;
  nameKey?: string;
  value?: unknown;
  fill?: string;
  stroke?: string;
  cx?: string | number;
  cy?: string | number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  [key: string]: unknown;
};

function ChartBox({ children, className }: CommonProps) {
  return <div className={className ?? "h-full w-full"}>{children}</div>;
}

export function ResponsiveContainer({ children, className }: CommonProps) {
  return <ChartBox className={className}>{children}</ChartBox>;
}

export function AreaChart({ children, className }: CommonProps) {
  return <ChartBox className={className}>{children}</ChartBox>;
}

export function PieChart({ children, className }: CommonProps) {
  return <ChartBox className={className}>{children}</ChartBox>;
}

export function Area(_props: CommonProps) {
  return null;
}

export function XAxis(_props: CommonProps) {
  return null;
}

export function YAxis(_props: CommonProps) {
  return null;
}

export function CartesianGrid(_props: CommonProps) {
  return null;
}

export function Tooltip(_props: CommonProps) {
  return null;
}

export function Legend(_props: CommonProps) {
  return null;
}

export function Pie({ children }: CommonProps) {
  return <>{children}</>;
}

export function Cell(props: SVGProps<SVGElement>) {
  return <span hidden data-fill={props.fill} />;
}
