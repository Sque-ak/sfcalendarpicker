import type { ChartProps } from "@superset-ui/core";

export default function transformProps(chartProps: ChartProps) {
  const { formData, height, width, filterState, hooks } = chartProps;
  const { setDataMask = () => {} } = hooks;

  return {
    formData,
    height,
    width,
    filterState: filterState || {},
    setDataMask,
  };
}
