import React from 'react';
import Layout from './Layout';
import MobileLayout from './MobileLayout';
import { useMobile } from '../hooks/useMobile';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
    const isMobile = useMobile();

    if (isMobile) {
        return <MobileLayout>{children}</MobileLayout>;
    }

    return <Layout>{children}</Layout>;
};

export default ResponsiveLayout;
