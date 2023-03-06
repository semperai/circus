import { Tooltip } from 'flowbite-react';

interface CheckboxProps {
  label: string;
  tooltip: string;
  value: boolean;
  setValue: any;
}

export default function Checkbox(props: CheckboxProps) {
  return (
    <div className="relative text-sm">
      <Tooltip content={props.tooltip} style="light" placement="top">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-0 mb-6 absolute top-0 right-0">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
          checked={props.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setValue(! props.value) }
          />
      </div>
    </div>
  );
}


