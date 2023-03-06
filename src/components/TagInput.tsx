import { Tooltip } from 'flowbite-react';
import { useState } from 'react';
import { render } from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';

const DelimiterKeyCodes = {
  tab: 9,
};

interface Props {
  label: string;
  tooltip: string;
  tags: string[];
  setTags: (_: string[]) => any;
}

interface Tag {
  id: string;
  text: string;
}

export default function TagInput(props: Props) {
  function handleDelete(i: number) {
    props.setTags(props.tags.filter((tag, index) => index !== i));
  }

  function handleAddition(tag: Tag) {
    if (props.tags.length >= 4) {
      return;
    }

    props.setTags([...props.tags, tag.id]);
  }

  return (
    <div className="relative text-sm">
      <Tooltip content={props.tooltip} style="light" placement="top">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </label>
      </Tooltip>
      <div className="mt-2 mb-6">
        <ReactTags
          tags={props.tags.map((t) => ({ id: t, text: t }))}
          delimiters={Object.values(DelimiterKeyCodes)}
          placeholder="Press tab, max 4"
          autofocus={false}
          autocomplete={false}
          allowDragDrop={false}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          inputFieldPosition="bottom"
          classNames={{
            tag: 'bg-slate-200 p-1 pl-3 pr-3 m-1 rounded-md text-sm',
            tagInput: 'mt-3',
            tagInputField: 'transparent text-sm',
          }}
        />
      </div>
    </div>
  );
}
