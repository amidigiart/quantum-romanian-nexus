
import React from 'react';
import { LazySection } from './LazySection';

interface ContentSection {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  priority: 'high' | 'medium' | 'low';
  delay?: number;
}

interface ContentPrioritizerProps {
  sections: ContentSection[];
  className?: string;
}

export const ContentPrioritizer: React.FC<ContentPrioritizerProps> = ({
  sections,
  className = ''
}) => {
  // Sort sections by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedSections = [...sections].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className={className}>
      {sortedSections.map((section) => {
        const Component = section.component;
        return (
          <LazySection
            key={section.id}
            priority={section.priority}
            delay={section.delay}
          >
            <Component {...(section.props || {})} />
          </LazySection>
        );
      })}
    </div>
  );
};
