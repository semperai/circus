import { Tooltip } from 'flowbite-react';

interface RangeSliderTextboxProps {
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  value: number;
  // onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: any;
}

export default function RangeSliderTextbox(props: RangeSliderTextboxProps) {
  return (
    <div>
      <Tooltip content={props.tooltip} style="light" placement="left">
        <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-2">
        <input
          type="number"
          value={props.value}
          onChange={props.onChange}
          />
        <input
          type="range"
          className="transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={props.onChange}
          />
      </div>
    </div>
  );
}
