import { PriceTag } from "@strapi/icons";

export const KeywordIcon = () => (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '16px', gap:'8px'}}>
      <PriceTag width={20} height={20}/>
      <span>{"Blog Keywords"}</span>
    </div>
);
