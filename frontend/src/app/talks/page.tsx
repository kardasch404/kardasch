import { getData } from '@/lib/getData';
import { generalSchema, formatArchiveDate } from '@/schemas/general.schema';

export default function TalksPage() {
  const general = getData('general.json', generalSchema);
  const talks = [...general.presentations, ...general.events].map(entry => ({
    ...entry, featured: entry.media.images.length > 0, subtitle: entry.description,
    dateFormatted: formatArchiveDate(entry.date),
    coverPhoto: entry.media.images.find(image => image.id === entry.media.coverId)?.src,
    venue: { name: general.locations.find(location => location.id === entry.locationId)?.label ?? 'City not specified', full: general.locations.find(location => location.id === entry.locationId)?.label },
    links: { event: entry.links.post ?? entry.links.slides ?? entry.links.canva },
  }));
  const featuredTalk = talks.find((talk) => talk.featured) ?? talks[0];
  const secondaryTalk = talks.find((talk) => talk !== featuredTalk) ?? featuredTalk;
  const loremLead = featuredTalk?.description ?? '';
  const loremBody = secondaryTalk?.description ?? '';
  const workshops = talks.filter((talk) => talk.type === 'workshop');
  const interviews = talks.filter((talk) => talk.type === 'interview');
  const events = talks.filter((talk) =>
    ['event', 'hackathon', 'conference'].includes(talk.type)
  );

  return (
    <main className="broadsheet-stage">
      <div className="broadsheet-spread">
        <section className="broadsheet-page">
          <header className="broadsheet-masthead">Old City News</header>
          <div className="broadsheet-subhead">
            <span>Personal archive</span>
            <span>Vol. 12 No. 197</span>
            <span>Youssoufia / Casablanca</span>
          </div>
          <div className="broadsheet-rule" />

          <div className="broadsheet-grid">
            <article className="col-span-3">
              <p className="broadsheet-kicker">Main Feature</p>
              <h1 className="broadsheet-headline">
                {featuredTalk?.title ?? 'Editorial Special Report'}
              </h1>
              {featuredTalk?.subtitle && (
                <h2 className="broadsheet-deck">{featuredTalk.subtitle}</h2>
              )}
              <div
                className="news-photo"
                style={{
                  backgroundImage: featuredTalk?.coverPhoto
                    ? `url(${featuredTalk.coverPhoto})`
                    : undefined,
                }}
                aria-hidden="true"
              />
              <p className="broadsheet-body">
                
                {loremLead}
              </p>
              <p className="broadsheet-body">{loremBody}</p>
              <p className="broadsheet-byline">
                By Zakaria Kardache • {featuredTalk?.dateFormatted ?? 'Date not specified'}
              </p>
            </article>

            <aside className="col-span-2 broadsheet-sidebar">
              <p className="broadsheet-kicker">Secondary Headline</p>
              <h3 className="broadsheet-subheadline">
                {secondaryTalk?.title ?? 'Special Bulletin'}
              </h3>
              <p className="broadsheet-body">
                
                {loremBody}
              </p>
              <div className="news-photo news-photo--small" aria-hidden="true" />
              <p className="broadsheet-body">{loremBody}</p>
              <p className="broadsheet-byline">
                Desk Review • {secondaryTalk?.dateFormatted ?? 'Archive'}
              </p>
            </aside>

            <div className="col-span-5 broadsheet-briefs">
              {talks.slice(0, 5).map((talk, index) => (
                <div key={talk.id} className="broadsheet-brief">
                  <p className="brief-label">Brief {index + 1}</p>
                  <h4 className="brief-headline">{talk.title}</h4>
                  <p className="brief-meta">
                    {talk.dateFormatted ?? 'Date not specified'} • {talk.venue?.name ?? '—'}
                  </p>
                  <p className="brief-body">{talk.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="broadsheet-page">
          <header className="broadsheet-masthead">The Portfolio Journal</header>
          <div className="broadsheet-subhead">
            <span>Talks • Workshops • Interviews • Events</span>
            <span>Special Dispatches</span>
            <span>Issue 04</span>
          </div>
          <div className="broadsheet-rule" />

          <div className="broadsheet-grid">
            <article className="col-span-3">
              <p className="broadsheet-kicker">Talks Ledger</p>
              <h2 className="broadsheet-headline broadsheet-headline--tight">
                Field Notes & Public Sessions
              </h2>
              <p className="broadsheet-body">
                
                {loremLead}
              </p>
              <div className="broadsheet-columns">
                {talks.map((talk) => (
                  <div key={talk.id} className="ledger-item">
                    <h4 className="ledger-title">{talk.title}</h4>
                    <p className="ledger-meta">
                      {talk.dateFormatted ?? 'Date not specified'} •{' '}
                      {talk.venue?.full ?? talk.venue?.name ?? 'Independent'}
                    </p>
                    {talk.subtitle && (
                      <p className="ledger-subtitle">{talk.subtitle}</p>
                    )}
                    {talk.links?.event && (
                      <a
                        className="ledger-link"
                        href={talk.links.event}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read more
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <aside className="col-span-2 broadsheet-sidebar">
              <div className="sidebar-block">
                <h3 className="sidebar-title">Workshops</h3>
                {workshops.length === 0 ? (
                  <p className="broadsheet-body">New sessions scheduled soon.</p>
                ) : (
                  workshops.map((talk) => (
                    <div key={talk.id} className="sidebar-item">
                      <p className="sidebar-item-title">{talk.title}</p>
                      <p className="sidebar-item-meta">
                        {talk.dateFormatted ?? 'Date not specified'} •{' '}
                        {talk.venue?.name ?? '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="sidebar-block">
                <h3 className="sidebar-title">Interviews</h3>
                {interviews.length === 0 ? (
                  <p className="broadsheet-body">Editorial conversations in progress.</p>
                ) : (
                  interviews.map((talk) => (
                    <div key={talk.id} className="sidebar-item">
                      <p className="sidebar-item-title">{talk.title}</p>
                      <p className="sidebar-item-meta">
                        {talk.dateFormatted ?? 'Date not specified'} •{' '}
                        {talk.venue?.name ?? '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="sidebar-block">
                <h3 className="sidebar-title">Events</h3>
                {events.length === 0 ? (
                  <p className="broadsheet-body">Upcoming appearances to announce.</p>
                ) : (
                  events.map((talk) => (
                    <div key={talk.id} className="sidebar-item">
                      <p className="sidebar-item-title">{talk.title}</p>
                      <p className="sidebar-item-meta">
                        {talk.dateFormatted ?? 'Date not specified'} •{' '}
                        {talk.venue?.name ?? '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>

          <div className="broadsheet-rule" />
          <div className="broadsheet-footer">
            <p>
              Presentations, photographs and event notes from the personal archive.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
