import type { ControlPanelConfig } from "@superset-ui/chart-controls";

const controlPanel: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: "Calendar Configuration",
      expanded: true,
      controlSetRows: [
        [
          {
            name: "mode",
            config: {
              type: "SelectControl",
              label: "Selection mode",
              default: "single",
              choices: [
                ["single", "Single Date"],
                ["range", "Date Range"],
              ],
              description: "Pick a single date or a date range",
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: "dateFormat",
            config: {
              type: "TextControl",
              label: "Date display format",
              default: "YYYY-MM-DD",
              description: "dayjs-compatible format string",
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
};

export default controlPanel;
