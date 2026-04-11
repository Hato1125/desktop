import { WeatherService } from '@service/weather';
import { createBinding } from 'ags';

const weather = WeatherService.get_default();

export default () => (
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
);
