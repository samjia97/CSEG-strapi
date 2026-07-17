import { User } from '@strapi/icons';

const PluginIcon = () =>
  <div style={{display: 'flex', alignItems: 'center', fontSize: '16px', gap:'8px'}}>
    <User width={20} height={20}/>
    <span>{"User accounts"}</span>
  </div>;

export { PluginIcon };
