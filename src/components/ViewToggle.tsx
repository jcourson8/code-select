import { Component } from 'solid-js';

interface ViewToggleProps {
  view: 'code' | 'output';
  setView: (view: 'code' | 'output') => void;
}

const ViewToggle: Component<ViewToggleProps> = (props) => {
  return (
    <div class="flex justify-center p-2 bg-dark-bg border-b border-dark-border">
      <button
        class={`px-4 py-2 rounded-l-md ${
          props.view === 'code'
            ? 'bg-dark-selected text-white'
            : 'bg-dark-bg text-dark-text'
        }`}
        onClick={() => props.setView('code')}
      >
        Code
      </button>
      <button
        class={`px-4 py-2 rounded-r-md ${
          props.view === 'output'
            ? 'bg-dark-selected text-white'
            : 'bg-dark-bg text-dark-text'
        }`}
        onClick={() => props.setView('output')}
      >
        Output
      </button>
    </div>
  );
};

export default ViewToggle;