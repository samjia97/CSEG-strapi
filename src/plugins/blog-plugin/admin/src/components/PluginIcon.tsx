import { File } from '@strapi/icons';

const PluginIcon = () => (
  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', gap: '8px' }}>
    <File width={20} height={20} />
    <span>Blogs</span>
  </div>
);

export { PluginIcon };
