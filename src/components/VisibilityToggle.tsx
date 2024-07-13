import { FiEye, FiEyeOff } from 'solid-icons/fi';
import { Accessor } from 'solid-js';

interface VisibilityToggleProps {
  visible: Accessor<boolean>;
  onChange: (visible: boolean) => void;
}

const VisibilityToggle = (props: VisibilityToggleProps) => {
  return (
    <div
      class="cursor-pointer ml-2"
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        props.onChange(!props.visible());
      }}
    >
      {props.visible() ? (
        <FiEye class="w-4 h-4 text-dark-text" />
      ) : (
        <FiEyeOff class="w-4 h-4 text-dark-textMuted" />
      )}
    </div>
  );
};

export default VisibilityToggle;