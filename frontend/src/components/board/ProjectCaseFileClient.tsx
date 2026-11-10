'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Project } from '@/schemas/project.schema';
import translations from '@/data/translations.json';
import type { Locale } from './CvLebenslauf';

const projectImages: Record<string, string> = {
  ostora: '/room/projects/ostora.png',
  'arch-x7': '/room/projects/arch-x7.png',
};

type ProjectTranslation = {
  category?: string;
  shortDescription?: string;
  tagline?: string;
  description?: string;
  problem?: string;
  architecture?: string;
  architectureNodes?: string[];
  technicalDecisions?: Array<{ tech: string; reason: string }>;
  backendEngineering?: string[];
  highlights?: string[];
};

function detectSmartLocale(): Locale {
  try {
    const manual = window.localStorage.getItem('kardache-locale-manual') as Locale | null;
    if (manual === 'de' || manual === 'en' || manual === 'fr') return manual;
    const saved = window.localStorage.getItem('kardache-locale') as Locale | null;
    if (saved === 'de' || saved === 'en' || saved === 'fr') return saved;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Berlin|Vienna|Zurich|Vaduz|Busingen/i.test(tz)) return 'de';
    if (/Casablanca|Paris|Brussels|Monaco|Algiers|Tunis|Luxembourg|Montreal/i.test(tz)) return 'fr';

    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
    for (const l of langs) {
      const code = l.toLowerCase();
      if (code.startsWith('de')) return 'de';
      if (code.startsWith('fr')) return 'fr';
      if (code.startsWith('en')) return 'en';
    }
  } catch {}
  return 'de';
}

export function ProjectCaseFileClient({
  project,
  caseId,
  prevProject,
  nextProject,
}: {
  project: Project;
  caseId: string;
  prevProject: Project;
  nextProject: Project;
}) {
  const [locale, setLocale] = useState<Locale>('de');

  useEffect(() => {
    setLocale(detectSmartLocale());
  }, []);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem('kardache-locale', next);
      window.localStorage.setItem('kardache-locale-manual', next);
    } catch {}
  };

  const t = translations[locale].ui;
  const trMap = translations[locale].projects as Record<string, ProjectTranslation>;
  const tr = trMap?.[project.id];
  const localizedProject: Project = tr
    ? {
        ...project,
        category: tr.category ?? project.category,
        shortDescription: tr.shortDescription ?? project.shortDescription,
        tagline: tr.tagline ?? project.tagline,
        description: tr.description ?? project.description,
        problem: tr.problem ?? project.problem,
        architecture: tr.architecture ?? project.architecture,
        architectureNodes: tr.architectureNodes ?? project.architectureNodes,
        technicalDecisions: tr.technicalDecisions ?? project.technicalDecisions,
        backendEngineering: tr.backendEngineering ?? project.backendEngineering,
        highlights: tr.highlights ?? project.highlights,
      }
    : project;

  const archNodes = localizedProject.architectureNodes?.length
    ? localizedProject.architectureNodes
    : localizedProject.stack.slice(0, 5);
  const decisions = localizedProject.technicalDecisions ?? [];
  const backendPoints = localizedProject.backendEngineering?.length
    ? localizedProject.backendEngineering
    : localizedProject.highlights;

  const returnBoardLabel =
    locale === 'de'
      ? '← ZURÜCK ZUR ERMITTLUNGSTAFEL'
      : locale === 'fr'
        ? '← RETOUR AU TABLEAU D’INVESTIGATION'
        : '← RETURN TO INVESTIGATION BOARD';

  const fullDossierTitle =
    locale === 'de'
      ? 'VOLLSTÄNDIGE FALLAKTE'
      : locale === 'fr'
        ? 'DOSSIER COMPLET D’INVESTIGATION'
        : 'FULL INVESTIGATION DOSSIER';

  const exhibitCaption =
    locale === 'de'
      ? `BEWEISSTÜCK A — ${localizedProject.name.toUpperCase()} FELDPROTOKOLL`
      : locale === 'fr'
        ? `PIÈCE À CONVICTION A — RELEVÉ DE TERRAIN ${localizedProject.name.toUpperCase()}`
        : `EVIDENCE EXHIBIT A — ${localizedProject.name.toUpperCase()} FIELD RECORD`;

  return (
    <main
      style={{
        minHeight: '100svh',
        background: '#121611',
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, #252c21 0%, #0d100c 75%)',
        padding: '40px 20px 72px',
        color: '#2c2419',
      }}
    >
      <div
        className="case-document"
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          border: '1.5px solid #8a724d',
          boxShadow: '0 32px 100px rgba(0,0,0,0.78), inset 0 0 42px rgba(94,60,22,0.14)',
        }}
      >
        <div
          className="document-toolbar"
          style={{ position: 'sticky', top: 0, flexWrap: 'wrap', gap: '10px' }}
        >
          <span>
            THE KARDACHE FILES / {t.archiveSubtitle} · {caseId} · {fullDossierTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="room-lang-switcher" role="group" aria-label="Language Switcher">
              {(['de', 'en', 'fr'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`lang-switch-btn ${locale === lang ? 'is-active' : ''}`}
                  onClick={() => changeLocale(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #746b5288',
                padding: '8px 14px',
                font: "700 11px 'Courier New', monospace",
                color: '#2c2419',
                textDecoration: 'none',
                background: '#dfd3b6',
              }}
            >
              {returnBoardLabel}
            </Link>
          </div>
        </div>

        <article className="document-content case-dossier">
          <div className="dossier-header-bar">
            <span className="dossier-kicker">
              {caseId} · {(localizedProject.category ?? 'Software Engineering').toUpperCase()}
            </span>
            <span className="dossier-status-stamp">{t.caseVerifiedStamp}</span>
          </div>

          <div className="dossier-title-row">
            <h1
              style={{
                font: '52px/1.02 Georgia, serif',
                letterSpacing: '-1.8px',
                margin: 0,
                color: '#1e150c',
              }}
            >
              {localizedProject.name}
            </h1>
            {localizedProject.github && (
              <a
                className="dossier-github-hero-btn"
                href={localizedProject.github}
                target="_blank"
                rel="noreferrer"
              >
                <span>GitHub Repository ↗</span>
              </a>
            )}
          </div>
          <p className="document-deck">
            {localizedProject.shortDescription ?? localizedProject.tagline}
          </p>

          <div className="case-index-strip">
            <div>
              <small>{t.projectIdLabel}</small>
              <strong>{caseId}</strong>
            </div>
            <div>
              <small>{t.categoryLabel}</small>
              <strong>{localizedProject.category ?? 'Backend Engineering'}</strong>
            </div>
            <div>
              <small>{t.coreStackLabel}</small>
              <strong>{localizedProject.stack.slice(0, 4).join(' · ')}</strong>
            </div>
          </div>

          {localizedProject.metrics && localizedProject.metrics.length > 0 && (
            <div className="case-metrics-grid">
              {localizedProject.metrics.map((m) => (
                <div key={m.label} className="case-metric-box">
                  <small>{m.label}</small>
                  <strong>{m.value}</strong>
                </div>
              ))}
            </div>
          )}

          {projectImages[localizedProject.id] && (
            <figure className="dossier-visual-frame">
              <img
                className="document-project-image"
                src={projectImages[localizedProject.id]}
                alt={`${localizedProject.name} evidence`}
              />
              <figcaption>{exhibitCaption}</figcaption>
            </figure>
          )}

          <section className="case-investigation-section">
            <h3>{t.secProblem}</h3>
            <p className="case-problem-text">
              {localizedProject.problem ?? localizedProject.description}
            </p>
          </section>

          <section className="case-investigation-section">
            <h3>{t.secArchitecture}</h3>
            <div className="case-arch-diagram" aria-label="System architecture flow">
              {archNodes.map((node, idx) => (
                <div key={node} className="case-arch-step">
                  <span className="case-arch-node">{node}</span>
                  {idx < archNodes.length - 1 && (
                    <span className="case-arch-arrow" aria-hidden="true">
                      ──►
                    </span>
                  )}
                </div>
              ))}
            </div>
            {localizedProject.architecture && (
              <p className="case-arch-summary">{localizedProject.architecture}</p>
            )}
          </section>

          {decisions.length > 0 && (
            <section className="case-investigation-section">
              <h3>{t.secDecisions}</h3>
              <div className="case-decisions-table">
                {decisions.map((item) => (
                  <div key={item.tech} className="case-decision-row">
                    <strong className="case-decision-tech">{item.tech}</strong>
                    <span className="case-decision-reason">{item.reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="case-investigation-section">
            <h3>{t.secBackend}</h3>
            <ul className="case-backend-list">
              {backendPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          {localizedProject.repositories && localizedProject.repositories.length > 0 && (
            <section className="case-investigation-section">
              <h3>
                {t.secRepositories} ({localizedProject.repositories.length})
              </h3>
              <div className="case-repos-grid">
                {localizedProject.repositories.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="case-repo-card"
                  >
                    <div className="case-repo-top">
                      <span className="case-repo-title-wrap">
                        <svg
                          viewBox="0 0 16 16"
                          width="14"
                          height="14"
                          fill="currentColor"
                          aria-hidden="true"
                          className="case-repo-gh-icon"
                        >
                          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                        </svg>
                        <strong>{repo.name}</strong>
                        <span className="case-repo-visibility">
                          {repo.visibility ?? 'Public'}
                        </span>
                      </span>
                      <span>↗</span>
                    </div>
                    {repo.role && <p>{repo.role}</p>}
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="case-repo-topics">
                        {repo.topics.map((topic) => (
                          <span key={topic} className="case-repo-topic-pill">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="case-repo-footer">
                      {repo.language && (
                        <span className="case-repo-lang">
                          <span
                            className="case-repo-lang-dot"
                            style={{
                              background:
                                repo.language === 'Groovy' ? '#4298b8' : '#3178c6',
                            }}
                          />
                          {repo.language}
                        </span>
                      )}
                      {typeof repo.stars === 'number' && (
                        <span className="case-repo-stars">★ {repo.stars}</span>
                      )}
                      {repo.updated && (
                        <span className="case-repo-updated">{repo.updated}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="case-investigation-section">
            <h3>06 — {t.coreStackLabel}</h3>
            <div className="document-tags dossier-tech-tags">
              {localizedProject.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </section>

          <div className="document-actions case-primary-actions">
            <Link className="open-case-file-btn" href="/">
              {returnBoardLabel}
            </Link>
            {localizedProject.github && (
              <a href={localizedProject.github} target="_blank" rel="noreferrer">
                {t.sourceCodeBtn} ↗
              </a>
            )}
            {localizedProject.demo && (
              <a href={localizedProject.demo} target="_blank" rel="noreferrer">
                {t.liveDemoBtn} ↗
              </a>
            )}
          </div>

          <div className="dossier-case-nav">
            <Link
              href={`/projects/${prevProject.slug}`}
              style={{
                textDecoration: 'none',
                padding: '12px 16px',
                background: '#e5d8b8',
                border: '1px solid #9e8860',
                borderRadius: '3px',
              }}
            >
              <small>{t.prevCaseLabel}</small>
              <strong>{prevProject.name}</strong>
            </Link>
            <Link
              href={`/projects/${nextProject.slug}`}
              style={{
                textDecoration: 'none',
                textAlign: 'right',
                padding: '12px 16px',
                background: '#e5d8b8',
                border: '1px solid #9e8860',
                borderRadius: '3px',
              }}
            >
              <small>{t.nextCaseLabel}</small>
              <strong>{nextProject.name}</strong>
            </Link>
          </div>
        </article>

        <div className="document-bottom">
          <span>Zakaria Kardache / {t.portfolioLabel}</span>
          <span>
            {t.endOfFile} · {caseId}
          </span>
        </div>
      </div>
    </main>
  );
}
