import keylock from '@service/keylock';
import { createBinding, createMemo } from 'ags';
import { defineComponent } from './component';

export default () => {
  if (!keylock) return null;

  const capsLock = createBinding(keylock, 'capsLock');
  const numLock = createBinding(keylock, 'numLock');
  const hasLock = createMemo(() => capsLock() || numLock());

  return defineComponent('keylock', () => (
    <box visible={hasLock}>
      <label
        visible={capsLock}
        cssClasses={[
          'filled',
          'symbols',
          'symbols-lg',
        ]}
        label='shift_lock'
      />
      <label
        visible={numLock}
        cssClasses={[
          'filled',
          'symbols',
          'symbols-lg',
        ]}
        label='grid_view'
      />
    </box>
  ));
}
