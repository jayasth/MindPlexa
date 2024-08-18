import { ReactNode } from 'react';
import cn from 'classnames';
import styles from './Card.module.css';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'elevated' | 'gradient';
}

export default function Card({
  title,
  description,
  footer,
  children,
  className,
  variant = 'default'
}: Props) {
  return (
    <div className={cn(styles.card, styles[variant], className)}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>
      <div className={styles.cardBody}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
}
