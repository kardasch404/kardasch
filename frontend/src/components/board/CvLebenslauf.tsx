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
  const [scale, setScale] = useState(1);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  useEffect(() => {
    // Dynamic responsive scale calculation for phone, tablet, and laptop
    const updateScale = () => {
      const A4_WIDTH_PX = 794; // 210mm in pixels at 96 DPI
      const availableW = window.innerWidth - 32;
      if (availableW < A4_WIDTH_PX) {
        const nextScale = Math.min(1, Math.max(0.32, availableW / A4_WIDTH_PX));
        setScale(nextScale);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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

      // Always capture at true unscaled A4 dimensions (794px width)
      // regardless of whether user is on phone, tablet or desktop
      const canvas = await window.html2canvas(pageElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 1200,
        onclone: (clonedDoc: Document) => {
          const scaler = clonedDoc.querySelector('.cv-scaler-inner') as HTMLElement | null;
          if (scaler) {
            scaler.style.transform = 'none';
          }
          const page = clonedDoc.querySelector('.cv-a4-page') as HTMLElement | null;
          if (page) {
            page.style.width = '794px';
            page.style.minWidth = '794px';
            page.style.maxWidth = '794px';
            page.style.minHeight = '1123px';
            page.style.transform = 'none';
            page.style.margin = '0 auto';
            page.style.boxShadow = 'none';
          }
        },
        imageTimeout: 0,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      // Preserve exact aspect ratio without squashing
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297), '', 'FAST');

      // Map clickable links with true unscaled coordinates relative to pageElement
      const baseW = pageElement.offsetWidth || 794;
      const baseH = pageElement.offsetHeight || 1123;
      const scaleX = pdfWidth / baseW;
      const scaleY = Math.min(pdfHeight, 297) / baseH;
      const allLinks = pageElement.querySelectorAll<HTMLAnchorElement>('a[href]');
      allLinks.forEach((link) => {
        let cur: HTMLElement | null = link;
        let top = 0;
        let left = 0;
        while (cur && cur !== pageElement) {
          top += cur.offsetTop;
          left += cur.offsetLeft;
          cur = cur.offsetParent as HTMLElement | null;
        }
        const x = left * scaleX;
        const y = top * scaleY;
        const width = link.offsetWidth * scaleX;
        const height = link.offsetHeight * scaleY;
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

      <div
        className="cv-scaler-wrapper"
        style={{
          minHeight: scale < 1 ? `${Math.ceil(1123 * scale) + 40}px` : undefined,
        }}
      >
        <div
          className="cv-scaler-inner"
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
          }}
        >
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
  </div>
</div>
  );
}
