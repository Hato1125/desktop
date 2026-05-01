import Adw from 'gi://Adw?version=1';
import { createBinding, createMemo } from 'ags';
import { defineComponent } from './component';
import weather from '@service/weather';

export default () => {
  if (!weather) return null;
  const w = weather;

  const available = createBinding(w, 'available');
  const loading = createMemo(() => !available());

  return defineComponent('weather', () => (
    <box
      class='weather'
      spacing={6}
      tooltipText={createBinding(w, 'temperature').as(t => `${t}°C`)}
    >
      <Adw.Spinner
        visible={loading}
        widthRequest={10}
        heightRequest={10}
      />
      <label
        visible={available}
        cssClasses={['filled', 'symbols', 'symbols-lg']}
        label={createBinding(w, 'icon')}
      />
    </box>
  ));
};
