import { createBinding } from 'ags';
import { defineComponent } from './component';
import weather from '@service/weather';

export default () => weather && defineComponent('weather', () => (
  <box
    spacing={6}
    tooltipText={createBinding(weather, 'temperature').as(t => `${t}°C`)}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-lg',
      ]}
      label={createBinding(weather, 'icon')}
    />
  </box>
));
