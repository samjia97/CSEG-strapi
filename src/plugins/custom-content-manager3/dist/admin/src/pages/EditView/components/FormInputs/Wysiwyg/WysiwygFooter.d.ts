import { Button } from '@strapi/design-system';
import { ComponentProps } from 'react';
type ButtonComponentProps = ComponentProps<typeof Button>;
interface WysiwygFooterProps {
    onToggleExpand: ButtonComponentProps['onClick'];
}
declare const WysiwygFooter: ({ onToggleExpand }: WysiwygFooterProps) => import("react/jsx-runtime").JSX.Element;
export { WysiwygFooter };
export type { WysiwygFooterProps };
