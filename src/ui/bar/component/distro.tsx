import { readFile } from 'ags/file';

export default () => {
  const distro = readFile('/etc/os-release')
    .split('\n')
    .find((line) => line.startsWith('ID='))
    ?.split('=')[1] ?? 'linux';

  return (<image iconName={`${distro}-symbolic`} />);
}
