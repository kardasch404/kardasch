'use client';
import { useState } from 'react';
import type { GeneralData } from '@/schemas/general.schema';
import type { RoomFile } from './InteractiveStudy';
import type { Locale } from './CvLebenslauf';
import translations from '@/data/translations.json';

export function mapPoint(latitude: number, longitude: number, viewport: GeneralData['map']['viewport']) {
  if (viewport.bounds) {
    const { west, east, north, south } = viewport.bounds;
    const mercator = (lat: number) => Math.asinh(Math.tan(lat * Math.PI / 180));
    return { x: (longitude - west) / (east - west) * 100, y: (mercator(north) - mercator(latitude)) / (mercator(north) - mercator(south)) * 100 };
  }
  const scale = 2 ** viewport.zoom;
  return { x: ((longitude + 180) / 360 * scale - viewport.startX) / viewport.columns * 100, y: ((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * scale - viewport.startY) / viewport.rows * 100 };
}

const filterLabelsByLocale: Record<Locale, Record<string, string>> = {
  de: {
    all: 'Alle',
    education: 'Ausbildung',
    presentations: 'Präsentationen',
    events: 'Events',
    projects: 'Projekte',
    'future-goals': 'Zukunftsziel',
  },
  en: {
    all: 'All',
    education: 'Education',
    presentations: 'Presentations',
    events: 'Events',
    projects: 'Projects',
    'future-goals': 'Future goal',
  },
  fr: {
    all: 'Tous',
    education: 'Formation',
    presentations: 'Présentations',
    events: 'Événements',
    projects: 'Projets',
    'future-goals': 'Objectif futur',
  },
};

export default function JourneyMap({ data, initialCity, locale = 'de', onOpen }: { data: GeneralData; initialCity?: string; locale?: Locale; onOpen: (file: RoomFile) => void }) {
  const t = translations[locale].ui;
  const labels = filterLabelsByLocale[locale];
  const initialLocation = data.locations.find(location => location.id === initialCity || location.label === initialCity);
  const [locationId, setLocationId] = useState<string | null>(initialLocation?.id ?? null);
  const [filter, setFilter] = useState(initialLocation?.status === 'future-goal' ? 'future-goals' : 'all');
  const { viewport, futureGoal } = data.map;
  const goal = data.locations.find(location => location.id === futureGoal.destinationId)!;
  const origin = data.locations.find(location => location.id === futureGoal.originId);
  const to = mapPoint(goal.coordinates.latitude, goal.coordinates.longitude, viewport);
  const from = origin ? mapPoint(origin.coordinates.latitude, origin.coordinates.longitude, viewport) : null;
  const showGoal = futureGoal.visibleWithFilters.includes(filter);
  const selectedLocation = data.locations.find(location => location.id === locationId);
  const records = [
    ...data.education.map(entry => ({ id: entry.id, title: entry.institution, subtitle: entry.degree, locationId: entry.locationId, kind: 'education', photo: entry.media.images[0], file: { kind: 'education' } as RoomFile })),
    ...[...data.presentations, ...data.events].map(entry => ({ id: entry.id, title: entry.title, subtitle: entry.topics.join(' / ') || entry.type, locationId: entry.locationId, kind: entry.recordType, photo: entry.media.images[0], file: { kind: 'event', id: entry.id } as RoomFile })),
    ...data.projects.map(entry => ({ id: entry.id, title: entry.name, subtitle: entry.tagline, locationId: entry.locationId, kind: 'projects', photo: entry.media.images[0], file: { kind: 'project', id: entry.id } as RoomFile })),
  ].filter(entry => (filter === 'all' || entry.kind === filter) && (!locationId || entry.locationId === locationId));
  return <article className="document-content journey-document">
    <p className="document-kicker">{t.mapKicker}</p><h2 id="document-title">{t.mapTitle}</h2>
    <p>{t.mapDeck}</p>
    <div className="journey-category-filters" aria-label="Filter map by content">{data.map.filters.map(value => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); if (value === 'future-goals' || locationId === goal.id) setLocationId(null); }}>{labels[value] ?? value}</button>)}</div>
    <div className="journey-map europe-map antique-map">
      <img src={viewport.image} alt="Geographic map connecting Morocco and Germany" />
      {showGoal && from && <svg className="journey-route" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path d={`M ${from.x * 10} ${from.y * 10} Q ${from.x * 10 - 50} ${to.y * 10 + 80} ${to.x * 10} ${to.y * 10}`} /></svg>}
      {data.locations.filter(location => data.map.visibleLocationIds.includes(location.id) && (location.status !== 'future-goal' || showGoal)).map(location => {
        const position = mapPoint(location.coordinates.latitude, location.coordinates.longitude, viewport);
        const future = location.status === 'future-goal';
        const isCurrent = location.id === 'casablanca' || location.current;
        return (
          <button
            key={location.id}
            data-location={location.id}
            className={`journey-pin pin-${location.id} ${future ? 'future-pin' : ''} ${isCurrent ? 'current-pin' : ''}`}
            aria-label={`${location.label}${isCurrent ? ', Current Base' : future ? ', future relocation goal' : ', Morocco'}`}
            aria-pressed={locationId === location.id}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => { setLocationId(location.id); if (future) setFilter('future-goals'); }}
          >
            <i />
            {isCurrent && <span className="current-pin-pulse" aria-hidden="true" />}
            {isCurrent ? (
              <div className="pin-badges-group" aria-hidden="true">
                <span className="pin-badge-chip" title="Comply World · Backend & Automation Engineer">
                  <img src="/icons/complyworld.png" alt="Comply World" />
                </span>
                <span className="pin-badge-chip alx-chip" title="ALX Africa · Cybersecurity Specialization">
                  <img src="/icons/alx.webp" alt="ALX Africa" />
                </span>
                <span className="pin-badge-chip fsbm-chip" title="Faculté des Sciences Ben M'sik · MIP">
                  <img src="/icons/scbenMsik_icon.png" alt="Faculté des Sciences Ben M'sik" />
                </span>
              </div>
            ) : location.id === 'youssoufia' ? (
              <div className="pin-badges-group" aria-hidden="true">
                <span className="pin-badge-chip youcode-chip" title="YouCode (UM6P) · Full-Stack Software Development">
                  <img src="/icons/youcode.png" alt="YouCode" />
                </span>
              </div>
            ) : location.icon ? (
              <img src={location.icon} alt={location.label} className="pin-institution-icon" aria-hidden="true" />
            ) : null}
            <span>
              {location.label}
              {isCurrent && <small className="current-base-tag">★ CURRENT BASE</small>}
              {future && <small>FUTURE GOAL</small>}
            </span>
          </button>
        );
      })}
    </div>
    <p className="map-credit">Geography: <a href={data.map.credit.url} target="_blank" rel="noreferrer">{data.map.credit.label}</a></p>
    <div className="journey-city-filters" aria-label="Filter journey by city"><button aria-pressed={!locationId} onClick={() => setLocationId(null)}>{t.mapAllPlaces}</button>{data.locations.filter(location => location.countryCode === 'MA' && data.map.moroccoLocationIds.includes(location.id)).map(location => <button key={location.id} aria-pressed={locationId === location.id} onClick={() => { setLocationId(location.id); if (filter === 'future-goals') setFilter('all'); }}>{location.label}</button>)}</div>
    {(!locationId || locationId === 'casablanca') && filter !== 'future-goals' && (
      <section className="journey-current-base-card">
        <div className="base-badge-icon">
          <span className="live-radar" />
          <span className="star-pip">★</span>
        </div>
        <div className="base-info">
          <small className="base-kicker">{t.mapCurrentBaseKicker}</small>
          <h3>{t.mapCurrentBaseTitle}</h3>
          <p className="base-summary">{t.mapCurrentBaseSummary}</p>
          <div className="base-institutions-grid">
            <div className="base-inst-item">
              <img src="/icons/complyworld.png" alt="Comply World" />
              <div>
                <strong>Comply World</strong>
                <span>Backend &amp; Automation Engineer · Production Systems</span>
              </div>
            </div>
            <div className="base-inst-item">
              <img src="/icons/alx.webp" alt="ALX Africa" className="alx-logo-bg" />
              <div>
                <strong>ALX Africa</strong>
                <span>Software Engineering · Cybersecurity Specialization</span>
              </div>
            </div>
            <div className="base-inst-item">
              <img src="/icons/scbenMsik_icon.png" alt="Faculté des Sciences Ben M'sik" />
              <div>
                <strong>Faculté des Sciences Ben M&apos;sik</strong>
                <span>Université Hassan II · MIP (Mathematics &amp; Informatics)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )}
    {(!locationId || locationId === 'youssoufia') && filter !== 'future-goals' && (
      <section className="journey-current-base-card">
        <div className="base-badge-icon" style={{ background: '#1c242b', borderColor: '#2b74b8' }}>
          <span className="star-pip" style={{ fontSize: '15px' }}>YC</span>
        </div>
        <div className="base-info">
          <small className="base-kicker" style={{ color: '#285885' }}>{t.mapYoussoufiaKicker}</small>
          <h3>{t.mapYoussoufiaTitle}</h3>
          <p className="base-summary">{t.mapYoussoufiaSummary}</p>
          <div className="base-institutions-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <div className="base-inst-item">
              <img src="/icons/youcode.png" alt="YouCode UM6P" className="youcode-logo-bg" />
              <div>
                <strong>YouCode | UM6P (Simplon)</strong>
                <span>MERN Stack &amp; Full-Stack Software Engineering · Youssoufia Campus</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )}
    {showGoal && (!locationId || locationId === goal.id) && <section className="journey-future-card"><span className="goal-ring" /><div><small>{t.mapFutureGoalKicker}</small><h3>{t.mapFutureGoalTitle}</h3><p>{t.mapFutureGoalDesc}</p></div></section>}
    {filter !== 'future-goals' && <><h3>{selectedLocation?.label ?? 'The archive'} / {labels[filter]}</h3><div className="journey-connections">{records.map(entry => <button key={`${entry.kind}-${entry.id}`} onClick={() => onOpen(entry.file)}>{entry.photo && <img src={entry.photo.src} alt={entry.photo.alt} loading="lazy" />}<span><small>{labels[entry.kind]} · {data.locations.find(location => location.id === entry.locationId)?.label ?? 'City not specified'}</small><strong>{entry.title}</strong><span>{entry.subtitle}</span></span></button>)}</div>{records.length === 0 && <p>No records have a confirmed location for this selection. Choose All places to see the full archive.</p>}<p className="journey-location-note">All presentations took place in Youssoufia. Events without a confirmed city remain in All places.</p></>}
  </article>;
}
