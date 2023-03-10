import { Tooltip } from 'flowbite-react';

interface Props {
  label: string;
  tooltip: string;
  value: string;
  setValue: (_: string) => any;
}

export default function Textbox(props: Props) {
  return (
    <div className="relative text-sm">
      <Tooltip content={props.tooltip} style="light" placement="top">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-2 mb-6">
        <input
          type="text"
          className="transparent text-sm"
          value={props.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value.trim()) }
          />
      </div>
    </div>
  );
}

