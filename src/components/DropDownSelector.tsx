import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react'
import { Tooltip } from 'flowbite-react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface SelectionItem {
  id: string;
  name: string;
}

interface DropDownSelectorProps {
  label: string;
  tooltip: string;
  choices: SelectionItem[];
  selected: SelectionItem;
  setSelected: any;
}

export default function DropDownSelector(props: DropDownSelectorProps) {
  return (
    <div>
      <Tooltip content={props.tooltip} style="light" placement="left">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-2">
        <Listbox value={props.selected} onChange={props.setSelected}>
          {({ open }) => (
            <>
              <div className="relative mt-2">
            	  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
            	    <span className="block truncate">{props.selected.name}</span>
            	    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            	  	<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            	    </span>
            	  </Listbox.Button>
        
            	  <Transition
            	    show={open}
            	    as={Fragment}
            	    leave="transition ease-in duration-100"
            	    leaveFrom="opacity-100"
            	    leaveTo="opacity-0"
            	  >
            	    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            	  	{props.choices.map((choice) => (
            	  	  <Listbox.Option
            	  		key={choice.id}
            	  		className={({ active }) => (active ? 'bg-indigo-600 text-white' : 'text-gray-900') + ' relative cursor-default select-none py-2 pl-3 pr-9'}
            	  		value={choice}
            	  	  >
            	  		{({ selected, active }) => (
            	  		  <>
            	  			<span className={(props.selected ? 'font-semibold' : 'font-normal') + ' block truncate'}>
            	  			  {choice.name}
            	  			</span>
        
            	  			{props.selected ? (
            	  			  <span
            	  				className={(active ? 'text-white' : 'text-indigo-600') + ' absolute inset-y-0 right-0 flex items-center pr-4'}
            	  			  >
            	  				<CheckIcon className="h-5 w-5" aria-hidden="true" />
            	  			  </span>
            	  			) : null}
            	  		  </>
            	  		)}
            	  	  </Listbox.Option>
            	  	))}
            	    </Listbox.Options>
            	  </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
}
