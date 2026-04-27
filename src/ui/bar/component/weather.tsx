import { createBinding } from 'ags';
import { defineComponent } from './component';
import weather from '@service/weather';

export default () => {
  if (!weather) return null;
  const w = weather;

  return defineComponent('weather', () => (
    <box
      spacing={6}
      tooltipText={createBinding(w, 'temperature').as(t => `${t}°C`)}
    >
      <label
        cssClasses={[
          'filled',
          'symbols',
          'symbols-lg',
        ]}
        label={createBinding(w, 'icon')}
      />
    </box>
  ));
};
