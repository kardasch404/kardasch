'use client';
import { useState } from 'react';
import type { Bio } from '@/schemas/bio.schema';
import type { Project } from '@/schemas/project.schema';
import type { RoomFile, RoomEvent } from './InteractiveStudy';

export function PortfolioTerminal({ bio, projects, events, onOpen }: { bio: Bio; projects: Project[]; events: RoomEvent[]; onOpen: (file: RoomFile) => void }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState(['KARDACHE OS / PERSONAL ARCHIVE', 'Connected to the portfolio. Type help to see available commands.']);
  function run(value: string) {
    const input = value.trim().toLowerCase(); setCommand('');
    if (!input) return;
    if (input === 'clear') { setHistory([]); return; }
    let lines: string[] = [];
    if (input === 'help') lines = ['projects — list engineering work', 'open <project> — open a project, e.g. open ostora', 'events — browse talks and photos', 'about / cv — read the personnel file', 'contact — get in touch', 'whoami — about the engineer', 'map / journey — explore Morocco and the Germany goal', 'education — study records', 'chess — play a local game', 'clear — clear this screen'];
    else if (input === 'projects' || input === 'ls') lines = projects.map(project => `${project.slug.padEnd(15)} ${project.tagline}`);
    else if (input === 'whoami') lines = [bio.name, bio.title, `${bio.location.city}, ${bio.location.country}`, bio.summary];
    else if (input === 'events' || input === 'photos') { lines = [`Opening the field journal: ${events.length} events.`]; onOpen({ kind: 'events' }); }
    else if (input === 'about' || input === 'cv') onOpen({ kind: 'resume' });
    else if (input === 'map' || input === 'journey') onOpen({ kind: 'map' });
    else if (input === 'education') onOpen({ kind: 'education' });
    else if (input === 'chess') onOpen({ kind: 'chess' });
    else if (input === 'presentations') onOpen({ kind: 'events' });
    else if (input === 'contact') onOpen({ kind: 'contact' });
    else if (input.startsWith('open ')) { const name = input.slice(5).trim(); const project = projects.find(item => item.slug.toLowerCase() === name || item.name.toLowerCase() === name); if (project) onOpen({ kind: 'project', id: project.id }); else lines = [`No project named “${name}”. Type projects to list available files.`]; }
    else lines = [`Unknown command: ${input}`, 'Type help for the available portfolio commands.'];
    setHistory(previous => [...previous.slice(-60), `> ${input}`, ...lines]);
  }
  return <div className="portfolio-terminal">
    <p className="terminal-heading" id="document-title">KARDACHE OS <span>CONNECTED ●</span></p>
    <div className="terminal-output" role="log" aria-label="Terminal output">{history.map((line, index) => <p key={index}>{line}</p>)}</div>
    <form onSubmit={event => { event.preventDefault(); run(command); }}><label htmlFor="terminal-command">guest@study:~ $</label><input id="terminal-command" value={command} onChange={event => setCommand(event.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="help" /><button type="submit">Run ↵</button></form>
    <div className="terminal-shortcuts"><button onClick={() => run('projects')}>Projects</button><button onClick={() => run('events')}>Photos & events</button><button onClick={() => run('cv')}>CV</button><button onClick={() => run('contact')}>Contact</button><button onClick={() => run('map')}>Journey map</button><button onClick={() => run('education')}>Education</button><button onClick={() => run('help')}>Help</button></div>
  </div>;
}
