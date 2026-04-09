import { WeatherService } from '@service/weather';
import { createBinding } from 'ags';

const weather = WeatherService.get_default();

export default () => (
  <box spacing={2}>
    <label
      cssClasses={[
        'symbols',
        'symbol-s2',
      ]}
      label={createBinding(weather, 'icon')}
    />
    <label label='・'/>
    <label
      cssClasses={[
        'label',
        'label-body-l',
      ]}
      label={createBinding(weather, 'temperature').as(t => `${t}°C`)}
    />
  </box>
);
