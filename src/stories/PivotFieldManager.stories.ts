import PivotFieldManager from '@/pivot/PivotFieldManager';

import type { Meta, StoryObj } from '@storybook/react';
// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/PivotFieldManager',
  component: PivotFieldManager,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // initialConfig: { control: 'color' },
    // fields: { control: 'color' },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { fields: [], aggregations: [] },
} satisfies Meta<typeof PivotFieldManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const PivotFieldManagerEmpty: Story = {};

export const PivotFieldManagerDefaultFields: Story = {
  args: {
    fields: ['country', 'city', 'sales', 'date', 'category'],
  },
};

export const PivotFieldManagerEmptyInitialConfig: Story = {
  args: {
    fields: ['country', 'city', 'sales', 'date', 'category'],
    initialConfig: [
      { id: 'country', zone: 'rows' },
      { id: 'sales', zone: 'values', aggregation: 'sum' },
    ],
  },
};
