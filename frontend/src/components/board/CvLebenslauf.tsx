'use client';

import React, { useRef, useState, useEffect } from 'react';
import translations from '@/data/translations.json';

export type Locale = 'de' | 'en' | 'fr';

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: Record<string, unknown>
    ) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (options?: Record<string, unknown>) => {
        addImage: (
          imageData: string,
          format: string,
          x: number,
          y: number,
          width: number,
          height: number,
          alias?: string,
          compression?: string
        ) => void;
        link: (
          x: number,
          y: number,
          w: number,
          h: number,
          options: { url: string }
        ) => void;
        save: (filename: string) => void;
      };
    };
  }
}

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function CvLebenslauf({
  locale,
  onChangeLocale,
  onClose,
}: {
  locale: Locale;
  onChangeLocale?: (lang: Locale) => void;
  onClose?: () => void;
}) {
  const cv = translations[locale].cv;
  const ui = translations[locale].ui;
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  useEffect(() => {
    // Preload html2canvas & jsPDF just like cv.html so download is instant
    void Promise.all([
      loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
    ]).catch(() => {
      // Fallback handled in handleDownloadPdf
    });
  }, []);

  const handleDownloadPdf = async () => {
    if (pdfStatus === 'generating') return;
    const pageElement = pageRef.current;
    if (!pageElement) return;

    setPdfStatus('generating');
    const filename =
      locale === 'de'
        ? 'Zakaria_Kardache_Lebenslauf_DE.pdf'
        : locale === 'fr'
          ? 'Zakaria_Kardache_CV_FR.pdf'
          : 'Zakaria_Kardache_CV_EN.pdf';

    try {
      await Promise.all([
        loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
        loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      ]);

      if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error('PDF libraries unavailable');
      }

      const canvas = await window.html2canvas(pageElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: pageElement.scrollWidth,
        windowHeight: pageElement.scrollHeight,
        imageTimeout: 0,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

      // Map all clickable links onto the A4 PDF page (1:1 with cv.html)
      const pageRect = pageElement.getBoundingClientRect();
      const scaleX = pdfWidth / pageElement.offsetWidth;
      const scaleY = pdfHeight / pageElement.offsetHeight;
      const allLinks = pageElement.querySelectorAll<HTMLAnchorElement>('a[href]');
      allLinks.forEach((link) => {
        const rect = link.getBoundingClientRect();
        const x = (rect.left - pageRect.left) * scaleX;
        const y = (rect.top - pageRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        if (link.href) {
          pdf.link(x, y, width, height, { url: link.href });
        }
      });

      pdf.save(filename);
      setPdfStatus('done');
      window.setTimeout(() => setPdfStatus('idle'), 2000);
    } catch {
      window.print();
      setPdfStatus('idle');
    }
  };

  const buttonLabel =
    pdfStatus === 'generating'
      ? ui.cvGeneratingPdf
      : pdfStatus === 'done'
        ? ui.cvDownloadedPdf
        : cv.downloadPdf;

  return (
    <div className="cv-fresh-shell">
      <div className="cv-fresh-floating-bar">
        <div className="cv-lang-pills" role="group" aria-label="CV Language">
          {(['de', 'en', 'fr'] as Locale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`cv-lang-pill ${locale === lang ? 'is-active' : ''}`}
              onClick={() => onChangeLocale?.(lang)}
            >
              {lang.toUpperCase()} — {translations[lang].langName}
            </button>
          ))}
        </div>
        <div className="cv-fresh-right-btns">
          <button
            type="button"
            className="cv-print-btn"
            onClick={handleDownloadPdf}
            disabled={pdfStatus === 'generating'}
          >
            {buttonLabel}
          </button>
          {onClose && (
            <button
              type="button"
              className="cv-close-btn"
              onClick={onClose}
              aria-label="Close CV"
            >
              {ui.closeBtn} ×
            </button>
          )}
        </div>
      </div>

      <div ref={pageRef} className="cv-a4-page">
        {/* HEADER */}
        <div className="cv-header">
          <div className="cv-header-left">
            <div className="cv-name">{cv.name}</div>
            <div className="cv-title">{cv.title}</div>
            <div className="cv-contact-row">
              <span>+212 613-450-087</span>
              <span>
                <a href="mailto:kardasch.zakaria@outlook.de">
                  kardasch.zakaria@outlook.de
                </a>
              </span>
              <span>
                <a
                  href="https://www.linkedin.com/in/zakaria-kardache/"
                  target="_blank"
                  rel="noreferrer"
                >
                  linkedin.com/in/zakaria-kardache
                </a>
              </span>
              <span>
                {cv.location} ·{' '}
                <a
                  href="https://github.com/kardasch404"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/kardasch404
                </a>
              </span>
              <span>
                <a href="https://kardasch.me/" target="_blank" rel="noreferrer">
                  kardasch.me
                </a>
              </span>
              <span>
                <a
                  href="https://www.xing.com/profile/Zakaria_Kardache081184"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xing: Zakaria Kardache
                </a>
              </span>
            </div>
          </div>
          <div className="cv-header-right">
            <a
              className="cv-profile-link"
              href="https://www.complyworld.com/indexEN.html"
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="cv-profile-photo"
                src="/photos/kardache-zakaria.jpg"
                alt="Zakaria Kardache"
                crossOrigin="anonymous"
              />
            </a>
          </div>
        </div>

        {/* TECHNISCHE KENNTNISSE */}
        <div className="cv-sec-title">{cv.secSkills}</div>
        <div className="cv-skills-grid">
          {cv.skills.map((skill) => (
            <div key={skill.label} className="cv-skill-row">
              <span className="cv-skill-label">{skill.label}</span>
              <span className="cv-skill-val">{skill.val}</span>
            </div>
          ))}
        </div>

        {/* BERUFSERFAHRUNG */}
        <div className="cv-sec-title">{cv.secExperience}</div>
        {cv.jobs.map((job) => (
          <div key={`${job.role}-${job.dates}`} className="cv-job">
            <div className="cv-job-header">
              <div className="cv-job-role">
                {job.role} —{' '}
                <span className="cv-job-co">
                  <a href={job.companyUrl} target="_blank" rel="noreferrer">
                    {job.company}
                  </a>
                </span>
              </div>
              <div className="cv-job-dates">{job.dates}</div>
            </div>
            <div className="cv-job-loc">{job.location}</div>
            <ul className="cv-bullets">
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="cv-stack">{job.stack}</div>
          </div>
        ))}

        {/* PROJEKTE */}
        <div className="cv-sec-title">{cv.secProjects}</div>
        {cv.projects.map((proj) => (
          <div key={proj.name} className="cv-proj">
            <div className="cv-proj-header">
              <div className="cv-proj-name">{proj.name}</div>
            </div>
            <div className="cv-proj-tech">{proj.tech}</div>
          </div>
        ))}

        {/* AUSBILDUNG & WEITERBILDUNG */}
        <div className="cv-sec-title">{cv.secEducation}</div>
        {cv.education.map((edu) => (
          <div key={edu.degree} className="cv-edu">
            <div className="cv-edu-header">
              <div className="cv-edu-deg">
                <a href={edu.degreeUrl} target="_blank" rel="noreferrer">
                  {edu.degree}
                </a>
              </div>
              <div className="cv-edu-dates">{edu.dates}</div>
            </div>
            <div className="cv-edu-school">
              <a href={edu.schoolUrl} target="_blank" rel="noreferrer">
                {edu.school}
              </a>
            </div>
            {'note' in edu && edu.note && (
              <div className="cv-edu-school">{edu.note}</div>
            )}
          </div>
        ))}

        {/* WEITERE INFORMATIONEN */}
        <div className="cv-sec-title">{cv.secMore}</div>
        <p className="cv-skill-val cv-more-line">
          <strong>{cv.languagesLabel}</strong> {cv.languagesVal}
        </p>
        <p className="cv-skill-val cv-more-line">
          <strong>{cv.strengthsLabel}</strong> {cv.strengthsVal}
        </p>
        <p className="cv-skill-val cv-more-line">
          <strong>{cv.interestsLabel}</strong>{' '}
          <a
            href="https://www.chess.com/member/zackkardasch"
            target="_blank"
            rel="noopener noreferrer"
            className="cv-chess-link"
          >
            {cv.interestsChess}
          </a>
          {cv.interestsRest}
        </p>
      </div>
    </div>
  );
}
