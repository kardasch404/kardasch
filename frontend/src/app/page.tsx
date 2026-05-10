import { Top } from '@/components/sections/Top';
import { Head } from '@/components/sections/Head';
import { Slider } from '@/components/sections/Slider';
import { News1 } from '@/components/sections/News1';
import { MiddleHead } from '@/components/sections/MiddleHead';
import { getData } from '@/lib/getData';
import { bioSchema } from '@/schemas/bio.schema';
import { projectsArraySchema } from '@/schemas/project.schema';
import { z } from 'zod';

const experienceSchema = z.array(z.object({
  id: z.string(),
  company: z.string(),
  location: z.string(),
  role: z.string(),
  type: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  bullets: z.array(z.string()),
  stack: z.array(z.string()),
}));

const educationSchema = z.array(z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  description: z.string(),
}));

const certificationsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  year: z.number(),
  date: z.string(),
  credentialUrl: z.string().nullable(),
  description: z.string(),
  tags: z.array(z.string()),
  inProgress: z.boolean().optional(),
}));

export default function HomePage() {
  const bio = getData('bio.json', bioSchema);
  const projects = getData('projects.json', projectsArraySchema);
  const experience = getData('experience.json', experienceSchema);
  const education = getData('education.json', educationSchema);
  const certifications = getData('certifications.json', certificationsSchema);

  return (
    <>
      <Top />
      <Head />
      <News1 />
      <hr className="border-t-2 border-zinc-800" />
      <MiddleHead />
      <hr className="border-t-2 mb-6 border-zinc-800" />
      
      {/* PROJECTS SECTION */}
      <div className="mb-8">
        <h1 className="font-TimesNewRoman font-extrabold text-5xl pb-4 text-center">
          FROM CONCEPT TO CODE: A Chronicle of Creations
        </h1>
        
        <div className="flex gap-5 mt-8">
          {projects.slice(0, 3).map((project, idx) => (
            <div key={project.id} className="flex-1 flex flex-col gap-2 stack-hover page-curl">
              <div className="border-2 border-zinc-800 p-4">
                <h2 className="font-Impact text-3xl font-bold uppercase mb-2 glitch">
                  {project.name}
                </h2>
                <p className="font-TimesNewRoman text-lg font-semibold mb-2 text-themeOrange">
                  {project.tagline}
                </p>
                <div className="text-sm text-justify mb-3">
                  <p className="mb-2">
                    <span className="high">{project.name[0]}</span>
                    {project.description.substring(1)}
                  </p>
                  <p className="font-bold mb-2">
                    🛠️ Tech Stack: {project.stack.slice(0, 5).join(', ')}
                  </p>
                  <div className="space-y-1">
                    {project.highlights.slice(0, 3).map((h, i) => (
                      <p key={i} className="text-xs">• {h}</p>
                    ))}
                  </div>
                </div>
                {project.github && (
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="magnetic-btn inline-block text-sm font-bold text-themeOrange hover:underline"
                  >
                    GitHub Repository →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* More Projects */}
        <div className="flex gap-5 mt-6">
          {projects.slice(3, 6).map((project) => (
            <div key={project.id} className="flex-1 border-2 border-zinc-800 p-3 stack-hover">
              <h3 className="font-Impact text-xl font-bold uppercase mb-1">{project.name}</h3>
              <p className="text-xs mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.stack.slice(0, 4).map((tech) => (
                  <span key={tech} className="bg-zinc-800 text-white px-2 py-0.5 text-xs font-bold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t-2 my-6 border-zinc-800" />

      {/* EXPERIENCE SECTION */}
      <div className="mb-8">
        <h1 className="font-TimesNewRoman font-extrabold text-5xl pb-4 text-center">
          EYEWITNESS ACCOUNT: CODE, COMMIT, CONQUER
        </h1>
        
        {experience.map((exp, idx) => (
          <div key={exp.id} className={`flex gap-2 ${idx > 0 ? 'mt-6' : ''}`}>
            <div className="flex-1 border-r-2 border-zinc-800 pr-4">
              <h2 className="font-Impact text-3xl font-bold uppercase mb-2">
                {exp.role}
              </h2>
              <p className="font-TimesNewRoman text-lg font-semibold mb-2">
                {exp.company} • {exp.location}
              </p>
              
              <div className="text-sm text-justify space-y-2">
                {exp.bullets.map((bullet, i) => (
                  <p key={i}>
                    {i === 0 && <span className="high">{bullet[0]}</span>}
                    {i === 0 ? bullet.substring(1) : bullet}
                  </p>
                ))}
              </div>

              {exp.stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {exp.stack.map((tech) => (
                    <span key={tech} className="bg-zinc-800 text-white px-2 py-1 text-xs font-bold">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-32 flex justify-center items-center text-center">
              <div className="font-Impact text-sm">
                TIMELINE<br />
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-t-2 my-6 border-zinc-800" />

      {/* EDUCATION SECTION */}
      <div className="mb-8">
        <h1 className="font-TimesNewRoman font-extrabold text-5xl pb-4 text-center">
          THE ACADEMIC CHRONICLES
        </h1>
        
        <div className="grid grid-cols-2 gap-4">
          {education.map((edu) => (
            <div key={edu.id} className="border-2 border-zinc-800 p-4 stack-hover">
              <h3 className="font-Impact text-2xl font-bold uppercase mb-2">
                {edu.degree}
              </h3>
              <p className="font-TimesNewRoman text-base font-semibold mb-1">
                {edu.institution}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {edu.location} • {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
              </p>
              <p className="text-sm text-justify">
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t-2 my-6 border-zinc-800" />

      {/* CERTIFICATIONS SECTION */}
      <div className="mb-8">
        <h1 className="font-TimesNewRoman font-extrabold text-5xl pb-4 text-center">
          CREDENTIALS & CERTIFICATIONS
        </h1>
        
        <div className="grid grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="border-2 border-zinc-800 p-4 stack-hover">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-Impact text-xl font-bold uppercase flex-1">
                  {cert.name}
                </h3>
                {cert.inProgress && (
                  <span className="bg-amber-500 text-white px-2 py-1 text-xs font-bold">
                    IN PROGRESS
                  </span>
                )}
              </div>
              <p className="font-TimesNewRoman text-sm font-semibold mb-1">
                {cert.issuer} • {cert.year}
              </p>
              <p className="text-xs text-justify mb-2">
                {cert.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {cert.tags.map((tag) => (
                  <span key={tag} className="bg-gray-200 px-2 py-0.5 text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t-2 my-6 border-zinc-800" />

      {/* Tech Stack Section */}
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem' }} className="text-center mb-4">
          INSIDE THE DEVELOPER'S TOOLBOX : A Glimpse at the Arsenal Behind Every Line of Code
        </h1>
        <p style={{ fontSize: '1.5rem' }} className="text-center mb-6">
          {bio.name}, a quiet force in the coding world, prefers craftsmanship over chaos. His toolbox is well-worn, battle-tested, and perfectly organized.
        </p>
        
        <div className="flex gap-2">
          {/* Rust */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg" alt="Rust" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Rust</span>
            </div>
            <p className="text-xs text-center">Advanced Level</p>
          </div>

          {/* Python */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Python</span>
            </div>
            <p className="text-xs text-center">Advanced Level</p>
          </div>

          {/* Go */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg" alt="Go" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Go</span>
            </div>
            <p className="text-xs text-center">Advanced Level</p>
          </div>

          {/* TypeScript */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" alt="TypeScript" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>TypeScript</span>
            </div>
            <p className="text-xs text-center">Advanced Level</p>
          </div>

          {/* Kubernetes */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" alt="Kubernetes" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>K8s</span>
            </div>
            <p className="text-xs text-center">KCNE Certified</p>
          </div>

          {/* Kafka */}
          <div className="flex-1 flex flex-col gap-2 stack-hover">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apachekafka/apachekafka-original.svg" alt="Kafka" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Kafka</span>
            </div>
            <p className="text-xs text-center">Advanced Level</p>
          </div>
        </div>
      </div>

      <Slider />
      
      {/* Footer */}
      <div className="py-7 font-Canopee text-2xl flex flex-row justify-between px-6">
        <a className="hover:opacity-75 transition-colors duration-300 magnetic-btn" href="#">
          {bio.name} ©
        </a>
        <div className="flex gap-2">
          <a className="hover:opacity-75 transition-colors duration-300 magnetic-btn" href={bio.contact.linkedin} target="_blank">LinkedIn</a>
          <span>•</span>
          <a className="hover:opacity-75 transition-colors duration-300 magnetic-btn" href={bio.contact.github} target="_blank">Github</a>
          <span>•</span>
          <a className="hover:opacity-75 transition-colors duration-300 magnetic-btn" href={bio.contact.xing} target="_blank">XING</a>
          <span>•</span>
          <a className="hover:opacity-75 transition-colors duration-300 magnetic-btn" href={`mailto:${bio.contact.email}`}>Email</a>
        </div>
      </div>
    </>
  );
}
