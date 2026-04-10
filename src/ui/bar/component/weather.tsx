import { WeatherService } from '@service/weather';
import { createBinding } from 'ags';

const weather = WeatherService.get_default();

export default () => (
  <box spacing={2}>
    <label
      cssClasses={[
        'symbols',
        'symbols-lg',
      ]}
      label={createBinding(weather, 'icon')}
    />
    <label label='・'/>
    <label
      cssClasses={[
        'label',
        'text-base',
      ]}
      label={createBinding(weather, 'temperature').as(t => `${t}°C`)}
    />
  </box>
);
