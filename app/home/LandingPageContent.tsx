'use client';

import Button from '@/ui/Button/Button';
import Link from 'next/link';
import TypewriterEffect from '@/ui/TypewriterEffect/TypewriterEffect';
import Card from '@/ui/Card/Card';
import { FaBrain, FaProjectDiagram, FaRobot } from 'react-icons/fa';
import styles from './LandingPageContent.module.css';

export default function LandingPageContent() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            MindePlexa: <br />
            <TypewriterEffect text="Transform Ideas into Reality" delay={500} />
          </h1>
          <p className={styles.heroDescription}>
            MindePlexa is an AI-powered platform that revolutionizes project
            management. Create, organize, and collaborate on ideas using
            intuitive canvases and intelligent nodes.
          </p>
          <Link href="/signin/signup">
            <Button variant="sleek" className={styles.ctaButton}>
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featureGrid}>
          <Card
            title="Interactive Canvases"
            description="Create dynamic workspaces for your projects"
            variant="gradient"
            className={styles.featureCard}
          >
            <FaProjectDiagram className={styles.featureIcon} />
          </Card>
          <Card
            title="Intelligent Nodes"
            description="Organize information with interconnected, customizable nodes"
            variant="gradient"
            className={styles.featureCard}
          >
            <FaBrain className={styles.featureIcon} />
          </Card>
          <Card
            title="AI-Powered Assistance"
            description="Generate project layouts and get intelligent suggestions"
            variant="gradient"
            className={styles.featureCard}
          >
            <FaRobot className={styles.featureIcon} />
          </Card>
        </div>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.sectionTitle}>Ready to Transform Your Ideas?</h2>
        <p className={styles.ctaDescription}>
          Join MindePlexa today and experience a new way of managing projects
          and ideas.
        </p>
        <Link href="/signin/signup">
          <Button variant="sleek" className={styles.ctaButton}>
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
