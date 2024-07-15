import { Show } from 'solid-js';
import { Accessor } from 'solid-js';

interface CustomCheckboxProps {
  checked: Accessor<boolean>;
  onChange: (checked: boolean) => void;
}

const CustomCheckbox = (props: CustomCheckboxProps) => {
  return (
    <div
      class="w-3 h-3 rounded-full border border-dark-textMuted flex items-center justify-center cursor-pointer flex-shrink-0"
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        props.onChange(!props.checked());
      }}
    >
      <Show when={props.checked()}>
        <div class="w-1.5 h-1.5 rounded-full bg-dark-text"></div>
      </Show>
    </div>
  );
};

export default CustomCheckbox;