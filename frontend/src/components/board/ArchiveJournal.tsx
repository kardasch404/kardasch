'use client';
import { useState } from 'react';
import type { RoomEvent, RoomFile } from './InteractiveStudy';
import type { Locale } from './CvLebenslauf';
import translations from '@/data/translations.json';

export default function ArchiveJournal({ events, locale = 'de', onOpen }: { events: RoomEvent[]; locale?: Locale; onOpen: (file: RoomFile) => void }) {
  const [filter, setFilter] = useState('all');
  const t = translations[locale].ui;
  const eventLocs = translations[locale].events as Record<string, { title?: string; description?: string; outline?: string[] }>;
  const visible = events.filter(event => filter === 'all' || (filter === 'photos' ? event.photos.length > 0 : event.recordType === filter));
  const filterItems: [string, string][] = [
    ['all', t.journalFilterAll],
    ['presentations', t.journalFilterPres],
    ['events', t.journalFilterEvents],
    ['photos', t.journalFilterPhotos],
  ];

  return (
    <div className="document-content">
      <p className="document-kicker">{t.journalKicker}</p>
      <h2 id="document-title">{t.journalTitle}</h2>
      <p className="document-deck">{t.journalDeck}</p>
      <div className="journey-category-filters" aria-label="Filter journal">
        {filterItems.map(([value, label]) => (
          <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      <div className="journal-cards">
        {visible.map(event => {
          const eLoc = eventLocs?.[event.id];
          const title = eLoc?.title ?? event.title;
          return (
            <button key={event.id} onClick={() => onOpen({ kind: 'event', id: event.id })}>
              {event.photos[0] ? (
                <img src={event.photos[0].url} alt={event.photos[0].alt} loading="lazy" />
              ) : (
                <span className="journal-text-cover">{event.topics?.slice(0, 2).join(' / ') || t.journalNotesLabel}</span>
              )}
              <span className="journal-card-copy">
                <small>
                  {event.recordType === 'presentations' ? t.journalTypePres : t.journalTypeEvent} /{' '}
                  {event.photos.length ? t.journalPhotosCount.replace('{count}', String(event.photos.length)) : t.journalNotesLabel}
                </small>
                <strong>{title}</strong>
                <span>{[event.date, event.city].filter(Boolean).join(' · ') || t.journalFromArchive}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
