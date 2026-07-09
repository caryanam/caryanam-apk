import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Circle, Path, Line, Text as SvgText, G } from "react-native-svg";

const { width } = Dimensions.get("window");

interface ChartData {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  height?: number;
}

export function BarChart({
  data,
  height = 180,
  color = "#3b82f6",
  formatValue,
}: ChartProps & { color?: string; formatValue?: (v: number) => string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartWidth = width - 64;
  const paddingLeft = 45;
  const paddingRight = 10;
  const paddingTop = 25;
  const paddingBottom = 25;

  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const steps = 4;

  const getBarX = (index: number) => {
    const stepX = drawableWidth / (data.length || 1);
    return paddingLeft + index * stepX + (stepX - 20) / 2;
  };

  const getBarY = (val: number) => {
    const valHeight = (val / maxVal) * drawableHeight;
    return height - paddingBottom - valHeight;
  };

  const getBarHeight = (val: number) => {
    return (val / maxVal) * drawableHeight;
  };

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines & Y labels */}
        {Array.from({ length: steps + 1 }).map((_, idx) => {
          const ratio = idx / steps;
          const val = Math.round(maxVal * ratio);
          const y = height - paddingBottom - ratio * drawableHeight;
          const label = formatValue ? formatValue(val) : String(val);

          return (
            <G key={idx}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fontSize={9}
                fill="#64748b"
                textAnchor="end"
                fontWeight="600"
              >
                {label}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const barX = getBarX(idx);
          const barY = getBarY(item.value);
          const barH = Math.max(getBarHeight(item.value), 2);

          return (
            <G key={idx} onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}>
              {/* Invisible large touch target */}
              <Rect
                x={barX - 4}
                y={paddingTop}
                width={28}
                height={drawableHeight}
                fill="transparent"
              />
              <Rect
                x={barX}
                y={barY}
                width={20}
                height={barH}
                fill={selectedIndex === idx ? "#f43f5e" : color}
                rx={4}
                ry={4}
              />
            </G>
          );
        })}

        {/* Tooltip Overlay */}
        {selectedIndex !== null && data[selectedIndex] && (() => {
          const item = data[selectedIndex];
          const barX = getBarX(selectedIndex);
          const barY = getBarY(item.value);

          const tooltipW = 50;
          const tooltipH = 20;
          const tooltipX = barX + 10 - tooltipW / 2;
          const tooltipY = barY - tooltipH - 6;

          return (
            <G>
              <Rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipW}
                height={tooltipH}
                fill="#0f172a"
                rx={4}
                ry={4}
              />
              <SvgText
                x={tooltipX + tooltipW / 2}
                y={tooltipY + 13}
                fontSize={8}
                fill="#fff"
                textAnchor="middle"
                fontWeight="bold"
              >
                {formatValue ? formatValue(item.value) : item.value}
              </SvgText>
            </G>
          );
        })()}

        {/* X Axis Labels */}
        {data.map((item, idx) => {
          const stepX = drawableWidth / (data.length || 1);
          const labelX = paddingLeft + idx * stepX + stepX / 2;

          return (
            <SvgText
              key={idx}
              x={labelX}
              y={height - 8}
              fontSize={9}
              fill="#64748b"
              textAnchor="middle"
              fontWeight="600"
            >
              {item.label.substring(0, 3)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

export function LineChart({
  data,
  height = 180,
  color = "#1e293b",
}: ChartProps & { color?: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartWidth = width - 64;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 25;

  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const steps = 4;

  const getPointX = (index: number) => {
    const stepX = drawableWidth / Math.max(data.length - 1, 1);
    return paddingLeft + index * stepX;
  };

  const getPointY = (val: number) => {
    const valHeight = (val / maxVal) * drawableHeight;
    return height - paddingBottom - valHeight;
  };

  // Build SVG path
  let pathD = "";
  data.forEach((item, idx) => {
    const x = getPointX(idx);
    const y = getPointY(item.value);
    if (idx === 0) {
      pathD = `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines & Y labels */}
        {Array.from({ length: steps + 1 }).map((_, idx) => {
          const ratio = idx / steps;
          const val = Math.round(maxVal * ratio);
          const y = height - paddingBottom - ratio * drawableHeight;

          return (
            <G key={idx}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fontSize={9}
                fill="#64748b"
                textAnchor="end"
                fontWeight="600"
              >
                {val}
              </SvgText>
            </G>
          );
        })}

        {/* Path line */}
        {pathD ? <Path d={pathD} fill="none" stroke={color} strokeWidth={3} /> : null}

        {/* Dots */}
        {data.map((item, idx) => {
          const x = getPointX(idx);
          const y = getPointY(item.value);

          return (
            <G key={idx} onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}>
              {/* Invisible large touch target */}
              <Circle cx={x} cy={y} r={16} fill="transparent" />
              <Circle
                cx={x}
                cy={y}
                r={selectedIndex === idx ? 6 : 4}
                fill={selectedIndex === idx ? "#f43f5e" : "#fff"}
                stroke={selectedIndex === idx ? "#f43f5e" : color}
                strokeWidth={2}
              />
            </G>
          );
        })}

        {/* Tooltip Overlay */}
        {selectedIndex !== null && data[selectedIndex] && (() => {
          const item = data[selectedIndex];
          const x = getPointX(selectedIndex);
          const y = getPointY(item.value);

          const tooltipW = 50;
          const tooltipH = 20;
          const tooltipX = x - tooltipW / 2;
          const tooltipY = y - tooltipH - 6;

          return (
            <G>
              <Rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipW}
                height={tooltipH}
                fill="#0f172a"
                rx={4}
                ry={4}
              />
              <SvgText
                x={tooltipX + tooltipW / 2}
                y={tooltipY + 13}
                fontSize={8}
                fill="#fff"
                textAnchor="middle"
                fontWeight="bold"
              >
                {item.value}
              </SvgText>
            </G>
          );
        })()}

        {/* X Axis Labels */}
        {data.map((item, idx) => {
          const x = getPointX(idx);

          return (
            <SvgText
              key={idx}
              x={x}
              y={height - 8}
              fontSize={9}
              fill="#64748b"
              textAnchor="middle"
              fontWeight="600"
            >
              {item.label.substring(0, 3)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
