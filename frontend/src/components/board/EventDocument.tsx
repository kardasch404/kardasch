'use client';
import type { RoomEvent, RoomFile } from './InteractiveStudy';
import type { Locale } from './CvLebenslauf';
import translations from '@/data/translations.json';

export default function EventDocument({ event, locale = 'de', onOpen }: { event: RoomEvent; locale?: Locale; onOpen: (file: RoomFile) => void }) {
  const t = translations[locale].ui;
  const eventLocs = translations[locale].events as Record<string, { title?: string; description?: string; outline?: string[] }>;
  const eLoc = eventLocs?.[event.id];
  const title = eLoc?.title ?? event.title;
  const description = eLoc?.description ?? event.description;
  const outline = eLoc?.outline?.length ? eLoc.outline : event.outline;

  const links = [
    { label: t.eventOpenCanva, url: event.links?.canva },
    { label: t.eventSlides, url: event.links?.slides },
    { label: t.eventRepo, url: event.links?.repository },
    { label: t.eventPost, url: event.links?.post },
    ...(event.links?.other ?? []),
  ].filter(link => link.url);

  return (
    <article className="document-content">
      <p className="document-kicker">
        {event.recordType === 'presentations' ? t.eventKickerPres : t.eventKickerField} /{' '}
        {[event.date, event.city, event.venue].filter(Boolean).join(' · ')}
      </p>
      <h2 id="document-title">{title}</h2>
      <p>{description}</p>
      {!!event.topics?.length && (
        <div className="document-tags">
          {event.topics.map(topic => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      )}
      <div className="event-photo-gallery">
        {event.photos.map(photo => (
          <figure key={photo.url}>
            <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open full photo: ${photo.alt}`}>
              <img src={photo.url} alt={photo.alt} loading="lazy" />
            </a>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
      {!!outline?.length && (
        <>
          <h3>{t.eventOutlineTitle}</h3>
          <ol>
            {outline.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </>
      )}
      {!!event.team?.length && (
        <>
          <h3>{t.eventTeamTitle}</h3>
          <p>{event.team.join(' · ')}</p>
        </>
      )}
      {event.videos?.map(video => (
        <figure key={video.id}>
          {/\.(mp4|webm|ogg)(\?|$)/i.test(video.src) ? (
            <video controls preload="metadata" poster={video.poster} aria-label={video.title}>
              <source src={video.src} />
            </video>
          ) : (
            <a href={video.src} target="_blank" rel="noreferrer">
              {video.title} ↗
            </a>
          )}
          <figcaption>{video.title}</figcaption>
        </figure>
      ))}
      <div className="document-actions">
        {links.map(link => (
          <a key={link.url} href={link.url!} target="_blank" rel="noreferrer">
            {link.label} ↗
          </a>
        ))}
        {event.projectId && (
          <button onClick={() => onOpen({ kind: 'project', id: event.projectId! })}>{t.eventOpenProjectBtn}</button>
        )}
        <button onClick={() => onOpen({ kind: 'events' })}>{t.eventBackJournalBtn}</button>
      </div>
    </article>
  );
}
