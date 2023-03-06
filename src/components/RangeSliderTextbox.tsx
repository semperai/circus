import { Tooltip } from 'flowbite-react';

interface RangeSliderTextboxProps {
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  value: number;
  // onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: any;
}

export default function RangeSliderTextbox(props: RangeSliderTextboxProps) {
  return (
    <div className="relative text-sm">
      <Tooltip content={props.tooltip} style="light" placement="left">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-2 mb-6">
        <input
          type="number"
		  className="absolute top-0 right-0 text-sm p-0 pl-1 mt-1 w-14 border-transparent outline-transparent hover:border-slate-200 focus:border-slate-200 text-right"
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value)}
          />
        <input
          type="range"
          className="transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value)}
          />
      </div>
    </div>
  );
}
